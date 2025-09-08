import { Test, TestingModule } from '@nestjs/testing'
import { MovieSyncService } from '../services/sync.service'
import { StarWarsApi } from '../api/starwars.api'
import { MovieRepository } from '../movie.repository'
import { Logger } from '@nestjs/common'

import {
  mockApiMovieResult,
  mockApiMovieResult2,
  mockMovieEntity,
  mockMovieEntityAdminUpdated,
  mockBatchMovies,
} from './__mocks__/movie.mock'
import { Movie } from '../entity/movie.entity'
import { mockStarWarsApi } from './__mocks__/starwars.api.mock'
import { mockMovieRepository } from './__mocks__/movie.repository.mock'
import { mockEntityManager } from './__mocks__/entity-manager.mock'
import { AxiosError } from 'axios'

describe('MovieSyncService', () => {
  let movieSyncService: MovieSyncService
  let starWarsApi: jest.Mocked<StarWarsApi>

  const batch_size = 10

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieSyncService,
        {
          provide: StarWarsApi,
          useValue: mockStarWarsApi,
        },
        {
          provide: MovieRepository,
          useValue: mockMovieRepository,
        },
      ],
    }).compile()

    movieSyncService = module.get<MovieSyncService>(MovieSyncService)
    starWarsApi = module.get(StarWarsApi)

    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()
    jest.spyOn(Logger.prototype, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('syncMoviesFromApi', () => {
    it('should sync movies successfully without force update', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockMovieEntity)

      mockEntityManager.create.mockReturnValue({ ...mockApiMovieResult, id: 1 })
      mockEntityManager.save.mockResolvedValue({ ...mockApiMovieResult, id: 1 })

      const result = await movieSyncService.syncMoviesFromApi(false)

      expect(starWarsApi.fetchAllMovies).toHaveBeenCalled()
      expect(result.created).toBe(1)
      expect(result.updated).toBe(1)
      expect(result.skipped).toBe(0)
      expect(result.errors).toBe(0)
      expect(result.batchResults).toHaveLength(1)
      expect(result.batchResults[0].success).toBe(true)
    })

    it('should sync movies successfully with force update', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockMovieEntityAdminUpdated)

      const result = await movieSyncService.syncMoviesFromApi(true)

      expect(starWarsApi.fetchAllMovies).toHaveBeenCalled()
      expect(result.updated).toBe(2)
      expect(result.created).toBe(0)
      expect(result.skipped).toBe(0)
    })

    it('should skip admin-updated movies when forceUpdate is false', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockMovieEntityAdminUpdated)
      const result = await movieSyncService.syncMoviesFromApi(false)
      expect(result.skipped).toBe(2)
      expect(result.created).toBe(0)
      expect(result.updated).toBe(0)
    })

    it('should handle batch processing with large datasets', async () => {
      const length = 25
      starWarsApi.fetchAllMovies.mockResolvedValueOnce({
        message: 'ok',
        result: mockBatchMovies(length),
      })
      mockEntityManager.findOne.mockResolvedValue(null)
      mockEntityManager.create.mockReturnValue({ id: 1 })
      mockEntityManager.save.mockResolvedValue({ id: 1 })

      const result = await movieSyncService.syncMoviesFromApi(false)

      const batch_results = Math.round(length / batch_size)
      expect(result.batchResults.length).toBe(batch_results)
      expect(result.created).toBe(length)
    })

    it('should handle API errors gracefully', async () => {
      starWarsApi.fetchAllMovies.mockRejectedValueOnce(new AxiosError('API Error'))

      await expect(movieSyncService.syncMoviesFromApi(false)).rejects.toThrow('API Error')
    })

    it('should handle batch errors when error threshold is exceeded', async () => {
      mockEntityManager.transaction.mockRejectedValueOnce(new Error('Too many errors in batch 1: 2/2'))
      const result = await movieSyncService.syncMoviesFromApi(false)
      expect(result.batchResults[0].success).toBe(false)
      expect(result.batchResults[0].error).toBeDefined()
      expect(result.created).toBe(0)
      expect(result.updated).toBe(0)
      expect(result.skipped).toBe(0)
    })
  })

  describe('private method testing through public methods', () => {
    describe('chunkArray', () => {
      it('should properly chunk large arrays', async () => {
        const length = 25
        starWarsApi.fetchAllMovies.mockResolvedValueOnce({
          message: 'ok',
          result: mockBatchMovies(length),
        })
        mockEntityManager.findOne.mockResolvedValue(null)
        mockEntityManager.create.mockReturnValue({ id: 1 })
        mockEntityManager.save.mockResolvedValue({ id: 1 })

        const result = await movieSyncService.syncMoviesFromApi(false)

        const batch_results = Math.round(length / batch_size)
        expect(result.batchResults).toHaveLength(batch_results)
      })
    })

    describe('executeWithConcurrencyLimit', () => {
      it('should execute batches with concurrency limit', async () => {
        const length = 35
        starWarsApi.fetchAllMovies.mockResolvedValueOnce({
          message: 'ok',
          result: Array.from({ length }, (_, i) => ({ ...mockApiMovieResult, uid: `movie-${i}` })),
        })
        mockEntityManager.findOne.mockResolvedValue(null)
        mockEntityManager.create.mockReturnValue({ id: 1 })
        mockEntityManager.save.mockResolvedValue({ id: 1 })

        const result = await movieSyncService.syncMoviesFromApi(false)

        expect(result.created).toBe(length)
        const batch_results = Math.round(length / batch_size)
        expect(result.batchResults).toHaveLength(batch_results)
      })
    })

    describe('syncSingleMovie', () => {
      it('should create new movie when not found', async () => {
        starWarsApi.fetchAllMovies.mockResolvedValueOnce({
          message: 'ok',
          result: [mockApiMovieResult],
        })

        mockEntityManager.findOne.mockResolvedValueOnce(null)
        mockEntityManager.create.mockReturnValue({ ...mockApiMovieResult, id: 1 })
        mockEntityManager.save.mockResolvedValue({ ...mockApiMovieResult, id: 1 })

        await movieSyncService.syncMoviesFromApi(false)

        expect(mockEntityManager.create).toHaveBeenCalledWith(Movie, {
          external_id: mockApiMovieResult.uid,
          external_description: mockApiMovieResult.description,
          created: mockApiMovieResult.properties.created,
          edited: mockApiMovieResult.properties.edited,
          opening_crawl: mockApiMovieResult.properties.opening_crawl,
          director: mockApiMovieResult.properties.director,
          producer: mockApiMovieResult.properties.producer,
          release_date: mockApiMovieResult.properties.release_date,
          title: mockApiMovieResult.properties.title,
          url: mockApiMovieResult.properties.url,
          episode_id: mockApiMovieResult.properties.episode_id,
          admin_updated: false,
        })
        expect(mockEntityManager.save).toHaveBeenCalled()
      })

      it('should update existing movie when not admin updated', async () => {
        starWarsApi.fetchAllMovies.mockResolvedValueOnce({
          message: 'ok',
          result: [mockApiMovieResult],
        })

        mockEntityManager.findOne.mockResolvedValueOnce(mockMovieEntity).mockResolvedValueOnce(mockMovieEntity)

        await movieSyncService.syncMoviesFromApi(false)

        expect(mockEntityManager.update).toHaveBeenCalledWith(Movie, mockMovieEntity.id, {
          external_description: mockApiMovieResult.description,
          created: mockApiMovieResult.properties.created,
          edited: mockApiMovieResult.properties.edited,
          url: mockApiMovieResult.properties.url,
          opening_crawl: mockApiMovieResult.properties.opening_crawl,
          director: mockApiMovieResult.properties.director,
          producer: mockApiMovieResult.properties.producer,
          release_date: mockApiMovieResult.properties.release_date,
          title: mockApiMovieResult.properties.title,
          episode_id: mockApiMovieResult.properties.episode_id,
        })
      })

      it('should skip admin-updated movie without force update', async () => {
        starWarsApi.fetchAllMovies.mockResolvedValueOnce({
          message: 'ok',
          result: [mockApiMovieResult, mockApiMovieResult2],
        })

        mockEntityManager.findOne.mockResolvedValue(mockMovieEntityAdminUpdated)

        const result = await movieSyncService.syncMoviesFromApi(false)

        expect(result.skipped).toBe(2)
        expect(mockEntityManager.update).not.toHaveBeenCalled()
      })

      it('should force update admin-updated movie with force flag', async () => {
        starWarsApi.fetchAllMovies.mockResolvedValueOnce({
          message: 'ok',
          result: [mockApiMovieResult],
        })

        mockEntityManager.findOne
          .mockResolvedValueOnce(mockMovieEntityAdminUpdated)
          .mockResolvedValueOnce(mockMovieEntity)

        await movieSyncService.syncMoviesFromApi(true)

        expect(mockEntityManager.update).toHaveBeenCalledWith(Movie, mockMovieEntityAdminUpdated.id, {
          external_description: mockApiMovieResult.description,
          created: mockApiMovieResult.properties.created,
          edited: mockApiMovieResult.properties.edited,
          url: mockApiMovieResult.properties.url,
          opening_crawl: mockApiMovieResult.properties.opening_crawl,
          director: mockApiMovieResult.properties.director,
          producer: mockApiMovieResult.properties.producer,
          release_date: mockApiMovieResult.properties.release_date,
          title: mockApiMovieResult.properties.title,
          episode_id: mockApiMovieResult.properties.episode_id,
          admin_updated: false,
          admin_updated_at: null,
          admin_updated_by: null,
          deleted_at: null,
        })
      })
    })

    describe('processBatch', () => {
      it('should handle individual movie sync errors within error threshold', async () => {
        starWarsApi.fetchAllMovies.mockResolvedValueOnce({
          message: 'ok',
          result: [mockApiMovieResult, mockApiMovieResult2],
        })

        mockEntityManager.findOne
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(mockMovieEntity)
          .mockResolvedValueOnce(mockMovieEntity)

        mockEntityManager.create.mockImplementationOnce(() => {
          throw new Error('Create failed')
        })

        const result = await movieSyncService.syncMoviesFromApi(false)

        expect(result.errors).toBe(0)
        expect(result.created).toBe(0)
        expect(result.updated).toBe(1)
      })
    })
  })

  describe('error handling and edge cases', () => {
    it('should handle empty API response', async () => {
      starWarsApi.fetchAllMovies.mockResolvedValueOnce({
        message: 'ok',
        result: [],
      })

      const result = await movieSyncService.syncMoviesFromApi(false)

      expect(result.created).toBe(0)
      expect(result.updated).toBe(0)
      expect(result.skipped).toBe(0)
      expect(result.errors).toBe(0)
      expect(result.batchResults).toHaveLength(0)
    })

    it('should handle transaction failures', async () => {
      mockEntityManager.transaction.mockRejectedValueOnce(new Error('Transaction failed'))

      const result = await movieSyncService.syncMoviesFromApi(false)

      expect(result.batchResults[0].success).toBe(false)
      expect(result.batchResults[0].error).toBeDefined()
    })
  })
})
