import { Injectable } from '@nestjs/common'
import { StarWarsApi } from '../api/starwars.api'
import { MovieRepository } from '../movie.repository'
import { Movie } from '../entity/movie.entity'
import { MovieNotFoundException } from '../exceptions/movie.exceptions'
import { IMovie } from '../interface/movie.interface'
import { IMovieProperties, IMovieResult } from '../interface/api.response'
import { CreateMovieDto } from '../dto/movie.dto'

@Injectable()
export class MovieService {
  constructor(
    private readonly starWarsApi: StarWarsApi,
    private readonly movieRepository: MovieRepository,
  ) {}

  async updateMovieByAdmin(movieId: number, updateData: Partial<Movie>, adminUserId: number): Promise<Movie> {
    return await this.movieRepository.manager.transaction(async (transactionalManager) => {
      const movie = await transactionalManager.findOne(Movie, { where: { id: movieId } })
      if (!movie) {
        throw new MovieNotFoundException()
      }

      await transactionalManager.update(Movie, movieId, {
        ...updateData,
        admin_updated: true,
        admin_updated_at: new Date().toISOString(),
        admin_updated_by: adminUserId,
      })

      return (await transactionalManager.findOne(Movie, { where: { id: movieId } })) as Movie
    })
  }

  async find(page: number = 1, limit: number = 10): Promise<IMovie[]> {
    const movies = await this.movieRepository.find({ take: limit, skip: (page - 1) * limit })
    return movies
  }

  async findById(id: number, extended: boolean = false): Promise<IMovie | IMovieProperties> {
    const movie = await this.movieRepository.findOne({ where: { id } })
    if (!movie) throw new MovieNotFoundException()

    if (!extended) {
      return movie
    }

    const fetchedMovie = await this.findMovieFromApi(movie.external_id)
    return {
      ...fetchedMovie.properties,
      ...movie,
      external_description: fetchedMovie.description,
    }
  }

  private async findMovieFromApi(external_id: string): Promise<IMovieResult> {
    const result = await this.starWarsApi.fetchMovieById(external_id)
    return result.result
  }

  async create(create_movie: CreateMovieDto, admin_id: number): Promise<IMovie> {
    const movie = this.movieRepository.create({
      ...create_movie,
      admin_updated: true,
      admin_updated_at: new Date(),
      admin_updated_by: admin_id,
    })
    return await this.movieRepository.save(movie)
  }

  async delete(id: number, admin_id: number): Promise<void> {
    const exists = await this.movieRepository.exists({ where: { id } })
    if (!exists) throw new MovieNotFoundException()
    await this.movieRepository.update(
      { id },
      { deleted_at: new Date(), admin_updated: true, admin_updated_by: admin_id, admin_updated_at: new Date() },
    )
  }
}
