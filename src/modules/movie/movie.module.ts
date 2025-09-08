import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Movie } from './entity/movie.entity'
import { StarWarsApi } from './api/starwars.api'
import { MovieRepository } from './movie.repository'
import { MovieCron } from './cron/movie.cron'
import { AuthModule } from '../auth/auth.module'
import { MovieController } from './controller/movie.controller'
import { MovieSyncService } from './services/sync.service'
import { MovieService } from './services/movie.service'

@Module({
  imports: [TypeOrmModule.forFeature([Movie]), ScheduleModule.forRoot(), AuthModule],
  controllers: [MovieController],
  providers: [MovieService, StarWarsApi, MovieRepository, MovieCron, MovieSyncService],
})
export class MovieModule {}
