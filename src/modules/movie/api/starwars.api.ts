import { Inject, Injectable } from '@nestjs/common'
import { environments } from '../../config/env.config'
import { ConfigType } from '@nestjs/config'
import { Api } from '../../../core/api/api'
import { IMovieResult, IStarwarsApiDetailResponse, IStarwarsApiResponse } from '../interface/api.response'
import { AxiosInstance } from 'axios'

@Injectable()
export class StarWarsApi {
  private api: Api
  private instance: AxiosInstance
  private readonly film_suffix = 'films/'

  private readonly moviesCached = new Map<
    string,
    {
      data: IMovieResult
    }
  >()

  constructor(@Inject(environments.KEY) private readonly configService: ConfigType<typeof environments>) {
    this.api = Api.create(this.configService.STARWARS_API_URL)
    this.instance = this.api.client
  }

  async fetchAllMovies(): Promise<IStarwarsApiResponse> {
    const result = await this.instance.get<IStarwarsApiResponse>(this.film_suffix)
    return result.data
  }

  async fetchMovieById(id: string): Promise<IStarwarsApiDetailResponse> {
    const cachedMovie = this.getCachedMovie(id)
    if (cachedMovie) {
      return {
        message: 'ok',
        result: cachedMovie,
      }
    }
    const result = await this.instance.get<IStarwarsApiDetailResponse>(`${this.film_suffix}${id}`)
    this.moviesCached.set(result.data.result.uid, { data: result.data.result })
    return result.data
  }

  private getCachedMovie(id: string): IMovieResult | null {
    const cached = this.moviesCached.get(id)
    if (!cached) {
      return null
    }
    return cached.data
  }
}
