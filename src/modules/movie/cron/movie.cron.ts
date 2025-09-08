import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { MovieSyncService } from '../services/sync.service'

@Injectable()
export class MovieCron {
  private logger = new Logger()
  constructor(private readonly movieSyncService: MovieSyncService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async fetchMovies(): Promise<void> {
    this.logger.log('Starting cron sync movies')
    const result = await this.movieSyncService.syncMoviesFromApi(false)
    this.logger.warn(result)
    this.logger.log('Finish cron sync')
  }
}
