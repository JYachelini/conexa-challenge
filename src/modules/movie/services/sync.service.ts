import { Injectable, Logger } from '@nestjs/common'
import { StarWarsApi } from '../api/starwars.api'
import { MovieRepository } from '../movie.repository'
import { IMovieResult } from '../interface/api.response'
import { EntityManager } from 'typeorm'
import { Movie } from '../entity/movie.entity'
import { IResponseSyncMovies } from '../interface/response.interace'

@Injectable()
export class MovieSyncService {
  private readonly logger = new Logger(MovieSyncService.name)
  private readonly BATCH_SIZE = 10

  constructor(
    private readonly starWarsApi: StarWarsApi,
    private readonly movieRepository: MovieRepository,
  ) {}

  async syncMoviesFromApi(forceUpdate: boolean = false): Promise<IResponseSyncMovies> {
    const result = await this.starWarsApi.fetchAllMovies()
    const apiMovies = result.result
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      batchResults: [] as Array<{ batch: number; success: boolean; error?: string }>,
    }

    const batches = this.chunkArray(apiMovies, this.BATCH_SIZE)
    this.logger.log(`Processing ${apiMovies.length} movies in ${batches.length} batches`)

    const batchPromises = batches.map(async (batch, index) => {
      return await this.processBatch(batch, index + 1, forceUpdate)
    })

    const batchResults = await this.executeWithConcurrencyLimit(batchPromises, 3)

    batchResults.forEach((batchResult, index) => {
      results.batchResults.push({
        batch: index + 1,
        success: batchResult.success,
        error: batchResult.error,
      })

      if (batchResult.success) {
        results.created += batchResult.created
        results.updated += batchResult.updated
        results.skipped += batchResult.skipped
      } else {
        results.errors += batchResult.errors
      }
    })

    this.logger.log('Movie sync completed', {
      ...results,
      successfulBatches: results.batchResults.filter((b) => b.success).length,
      totalBatches: results.batchResults.length,
    })

    return results
  }

  private async processBatch(
    batch: IMovieResult[],
    batchNumber: number,
    forceUpdate: boolean,
  ): Promise<{
    success: boolean
    created: number
    updated: number
    skipped: number
    errors: number
    error?: string
  }> {
    const batchResults = {
      success: false,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      error: undefined as string | undefined,
    }

    try {
      await this.movieRepository.manager.transaction(async (transactionalManager) => {
        this.logger.debug(`Processing batch ${batchNumber} with ${batch.length} movies`)

        const syncPromises = batch.map(async (apiMovie) => {
          try {
            return await this.syncSingleMovie(apiMovie, forceUpdate, transactionalManager)
          } catch (error) {
            this.logger.error(`Failed to sync movie ${apiMovie.uid} in batch ${batchNumber}`, {
              error: error,
              movieUid: apiMovie.uid,
              batch: batchNumber,
            })
            batchResults.errors++
            return 'error'
          }
        })

        const syncResults = await Promise.all(syncPromises)

        syncResults.forEach((result) => {
          if (result === 'created') batchResults.created++
          else if (result === 'updated') batchResults.updated++
          else if (result === 'skipped') batchResults.skipped++
        })

        if (batchResults.errors > batch.length * 0.8) {
          throw new Error(`Too many errors in batch ${batchNumber}: ${batchResults.errors}/${batch.length}`)
        }
      })

      batchResults.success = true
      this.logger.debug(`Batch ${batchNumber} completed successfully`, {
        created: batchResults.created,
        updated: batchResults.updated,
        skipped: batchResults.skipped,
        errors: batchResults.errors,
      })
    } catch (error) {
      const error_message = JSON.stringify(error)
      batchResults.error = error_message
      this.logger.error(`Batch ${batchNumber} failed completely`, {
        error: error_message,
        batchSize: batch.length,
      })
    }

    return batchResults
  }

  private async syncSingleMovie(
    apiMovie: IMovieResult,
    forceUpdate: boolean,
    transactionManager: EntityManager,
  ): Promise<'created' | 'updated' | 'skipped'> {
    const existingMovie = await transactionManager.findOne(Movie, {
      where: { external_id: apiMovie.uid },
      withDeleted: true,
    })

    if (!existingMovie) {
      await this.createMovieFromApi(apiMovie, transactionManager)
      return 'created'
    }

    if (existingMovie.admin_updated && !forceUpdate) {
      this.logger.debug(`Skipping admin-updated movie: ${apiMovie.uid}`)
      return 'skipped'
    }

    await this.updateMovieFromApi(existingMovie, apiMovie, forceUpdate, transactionManager)
    return 'updated'
  }

  private async createMovieFromApi(apiMovie: IMovieResult, transactionManager: EntityManager): Promise<Movie> {
    const movie = transactionManager.create(Movie, {
      external_id: apiMovie.uid,
      external_description: apiMovie.description,
      created: new Date(apiMovie.properties.created),
      edited: new Date(apiMovie.properties.edited),
      opening_crawl: apiMovie.properties.opening_crawl,
      director: apiMovie.properties.director,
      producer: apiMovie.properties.producer,
      release_date: apiMovie.properties.release_date,
      title: apiMovie.properties.title,
      url: apiMovie.properties.url,
      episode_id: apiMovie.properties.episode_id,
      admin_updated: false,
    })

    return await transactionManager.save(Movie, movie)
  }

  private async updateMovieFromApi(
    existingMovie: Movie,
    apiMovie: IMovieResult,
    forceUpdate: boolean,
    transactionManager: EntityManager,
  ): Promise<Movie> {
    const updateData: Partial<Movie> = {
      external_description: apiMovie.description,
      created: new Date(apiMovie.properties.created),
      edited: new Date(apiMovie.properties.edited),
      url: apiMovie.properties.url,
    }

    if (forceUpdate || !existingMovie.admin_updated) {
      Object.assign(updateData, {
        opening_crawl: apiMovie.properties.opening_crawl,
        director: apiMovie.properties.director,
        producer: apiMovie.properties.producer,
        release_date: apiMovie.properties.release_date,
        title: apiMovie.properties.title,
        episode_id: apiMovie.properties.episode_id,
      })

      if (forceUpdate) {
        updateData.admin_updated = false
        updateData.admin_updated_at = null
        updateData.admin_updated_by = null
        updateData.deleted_at = null
      }
    }

    await transactionManager.update(Movie, existingMovie.id, updateData)
    return (await transactionManager.findOne(Movie, { where: { id: existingMovie.id }, withDeleted: true })) as Movie
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private async executeWithConcurrencyLimit<T>(promises: Promise<T>[], limit: number): Promise<T[]> {
    const results: T[] = []

    for (let i = 0; i < promises.length; i += limit) {
      const batch = promises.slice(i, i + limit)
      const batchResults = await Promise.all(batch)
      results.push(...batchResults)
    }

    return results
  }
}
