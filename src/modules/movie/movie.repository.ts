import { Injectable } from '@nestjs/common'
import { BaseRepository } from '../database/repository/base.repository'
import { Movie } from './entity/movie.entity'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager } from 'typeorm'

@Injectable()
export class MovieRepository extends BaseRepository<Movie> {
  constructor(@InjectEntityManager() manager: EntityManager) {
    super(Movie, manager)
  }
}
