import { Body, Controller, Param, Query } from '@nestjs/common'
import { IResponseSyncMovies } from '../interface/response.interace'
import { SyncMoviesDto } from '../dto/sync.dto'
import {
  CreateMovie,
  DeleteMovie,
  GetMovieById,
  GetMovies,
  SyncMoviesEndpoint,
  UpdateMovie,
} from './decorators/controller.decorators'
import { CreateMovieDto, MovieDetailResponseDto, MovieResponseDto, UpdateMovieDto } from '../dto/movie.dto'
import { CurrentUser } from '../../../core/decorators/currentUser.decorator'
import { plainToInstance } from 'class-transformer'
import { PaginateDto } from '../../../core/dto/paginate.dto'
import { GetMovieQueryDto } from '../dto/get_movie.dto'
import { MovieSyncService } from '../services/sync.service'
import { MovieService } from '../services/movie.service'
import { ApiTags } from '@nestjs/swagger'

@Controller('movie')
@ApiTags('Movie')
export class MovieController {
  constructor(
    private readonly movieService: MovieService,
    private readonly movieSyncService: MovieSyncService,
  ) {}

  @SyncMoviesEndpoint()
  async syncMovies(@Body() syncMoviesDto: SyncMoviesDto): Promise<IResponseSyncMovies> {
    const result = this.movieSyncService.syncMoviesFromApi(syncMoviesDto.force_update)
    return result
  }

  @UpdateMovie()
  async updateMovie(
    @Body() updateMovieDto: UpdateMovieDto,
    @Param('id') id: number,
    @CurrentUser('id') admin_id: number,
  ): Promise<MovieResponseDto> {
    const movie = await this.movieService.updateMovieByAdmin(id, updateMovieDto, admin_id)
    const dto = plainToInstance(MovieResponseDto, movie)
    return dto
  }

  @GetMovies()
  async getMovies(@Query() paginateDto: PaginateDto): Promise<MovieResponseDto[]> {
    const movies = await this.movieService.find(paginateDto.page, paginateDto.limit)
    const dtos = plainToInstance(MovieResponseDto, movies)
    return dtos
  }

  @GetMovieById()
  async getMovieById(@Param('id') id: number, @Query() query: GetMovieQueryDto): Promise<MovieDetailResponseDto> {
    const movie = await this.movieService.findById(id, query.extended)
    const dto = plainToInstance(MovieDetailResponseDto, movie)
    return dto
  }

  @CreateMovie()
  async createMovie(@Body() movieDto: CreateMovieDto, @CurrentUser('id') id: number): Promise<MovieResponseDto> {
    const movie = await this.movieService.create(movieDto, id)
    const dto = plainToInstance(MovieResponseDto, movie)
    return dto
  }

  @DeleteMovie()
  async deleteMovie(@Param('id') id: number, @CurrentUser('id') admin_id: number): Promise<void> {
    await this.movieService.delete(id, admin_id)
  }
}
