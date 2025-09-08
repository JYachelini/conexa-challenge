import { Test, TestingModule } from '@nestjs/testing'
import { MovieService } from '../services/movie.service'
import { StarWarsApi } from '../api/starwars.api'
import { MovieRepository } from '../movie.repository'
import { MovieNotFoundException } from '../exceptions/movie.exceptions'

import {
  mockMovieEntity,
  mockMovieEntityAdminUpdated,
  mockCreateMovieDto,
  mockPartialMovieUpdate,
  mockStarwarsApiDetailResponse,
} from './__mocks__/movie.mock'
import { mockStarWarsApi } from './__mocks__/starwars.api.mock'
import { Movie } from '../entity/movie.entity'
import { mockMovieRepository } from './__mocks__/movie.repository.mock'
import { AxiosError } from 'axios'
import { IMovie } from '../interface/movie.interface'
import { mockEntityManager } from './__mocks__/entity-manager.mock'

describe('MovieService', () => {
  let movieService: MovieService
  let starWarsApi: jest.Mocked<StarWarsApi>
  let movieRepository: jest.Mocked<MovieRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
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

    movieService = module.get<MovieService>(MovieService)
    starWarsApi = module.get(StarWarsApi)
    movieRepository = module.get(MovieRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('updateMovieByAdmin', () => {
    it('should update movie successfully', async () => {
      const movieId = 1
      const adminUserId = 1
      const updatedMovie = { ...mockMovieEntity, ...mockPartialMovieUpdate }

      mockEntityManager.findOne.mockResolvedValueOnce(mockMovieEntity).mockResolvedValueOnce(updatedMovie)

      const result = await movieService.updateMovieByAdmin(movieId, mockPartialMovieUpdate, adminUserId)

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Movie, { where: { id: movieId } })
      expect(mockEntityManager.update).toHaveBeenCalledWith(Movie, movieId, {
        ...mockPartialMovieUpdate,
        admin_updated: true,
        admin_updated_at: expect.any(String),
        admin_updated_by: adminUserId,
      })
      expect(result).toEqual(updatedMovie)
    })

    it('should throw MovieNotFoundException when movie is not found', async () => {
      const movieId = 999
      const adminUserId = 1

      mockEntityManager.findOne.mockResolvedValueOnce(null)

      await expect(movieService.updateMovieByAdmin(movieId, mockPartialMovieUpdate, adminUserId)).rejects.toThrow(
        MovieNotFoundException,
      )

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Movie, { where: { id: movieId } })
      expect(mockEntityManager.update).not.toHaveBeenCalled()
    })

    it('should handle transaction rollback on update failure', async () => {
      const movieId = 1
      const adminUserId = 1

      mockEntityManager.transaction.mockImplementationOnce(async (callback: any) => {
        const transactionManager = {
          ...mockEntityManager,
          findOne: jest.fn().mockResolvedValueOnce(mockMovieEntity),
          update: jest.fn().mockRejectedValueOnce(new Error('Update failed')),
        }
        return await callback(transactionManager)
      })

      await expect(movieService.updateMovieByAdmin(movieId, mockPartialMovieUpdate, adminUserId)).rejects.toThrow(
        'Update failed',
      )
    })
  })

  describe('find', () => {
    it('should return movies with default pagination', async () => {
      const mockMovies = [mockMovieEntity, mockMovieEntityAdminUpdated]
      movieRepository.find.mockResolvedValueOnce(mockMovies as Movie[])

      const result = await movieService.find()

      expect(movieRepository.find).toHaveBeenCalledWith({ take: 10, skip: 0 })
      expect(result).toEqual(mockMovies)
    })

    it('should return movies with custom pagination', async () => {
      const mockMovies = [mockMovieEntity]
      movieRepository.find.mockResolvedValueOnce(mockMovies as Movie[])

      const limit = 5
      const page = 1
      const result = await movieService.find(page, limit)

      expect(movieRepository.find).toHaveBeenCalledWith({ take: limit, skip: (page - 1) * limit })
      expect(result).toEqual(mockMovies)
    })

    it('should handle empty results', async () => {
      movieRepository.find.mockResolvedValueOnce([])

      const result = await movieService.find()

      expect(result).toEqual([])
    })
  })

  describe('findById', () => {
    it('should return movie by id without extended data', async () => {
      movieRepository.findOne.mockResolvedValueOnce(mockMovieEntity as Movie)

      const result = await movieService.findById(1, false)

      expect(movieRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
      expect(result).toEqual(mockMovieEntity)
    })

    it('should return movie by id with extended data from API', async () => {
      movieRepository.findOne.mockResolvedValueOnce(mockMovieEntity as Movie)
      starWarsApi.fetchMovieById.mockResolvedValueOnce(mockStarwarsApiDetailResponse)

      const result = await movieService.findById(1, true)

      expect(movieRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
      expect(starWarsApi.fetchMovieById).toHaveBeenCalledWith(mockMovieEntity.external_id)

      expect(result).toEqual(
        expect.objectContaining({
          id: mockMovieEntity.id,
          external_id: mockMovieEntity.external_id,
          admin_updated: mockMovieEntity.admin_updated,
          characters: mockStarwarsApiDetailResponse.result.properties.characters,
          planets: mockStarwarsApiDetailResponse.result.properties.planets,
          starships: mockStarwarsApiDetailResponse.result.properties.starships,
          vehicles: mockStarwarsApiDetailResponse.result.properties.vehicles,
          species: mockStarwarsApiDetailResponse.result.properties.species,
        }),
      )
    })

    it('should throw MovieNotFoundException when movie not found', async () => {
      movieRepository.findOne.mockResolvedValueOnce(null)

      await expect(movieService.findById(999)).rejects.toThrow(MovieNotFoundException)

      expect(movieRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } })
      expect(starWarsApi.fetchMovieById).not.toHaveBeenCalled()
    })

    it('should handle API error when fetching extended data', async () => {
      movieRepository.findOne.mockResolvedValueOnce(mockMovieEntity as Movie)
      starWarsApi.fetchMovieById.mockRejectedValueOnce(new AxiosError('API Error'))

      await expect(movieService.findById(1, true)).rejects.toThrow('API Error')

      expect(starWarsApi.fetchMovieById).toHaveBeenCalledWith(mockMovieEntity.external_id)
    })
  })

  describe('create', () => {
    it('should create new movie with admin tracking', async () => {
      const adminId = 1
      const createdMovie: IMovie = {
        ...mockCreateMovieDto,
        id: 1,
        admin_updated: true,
        admin_updated_at: expect.any(String),
        admin_updated_by: adminId,
        external_description: null,
        external_id: null,
        created: null,
        edited: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      }

      movieRepository.create.mockReturnValueOnce(createdMovie as Movie)
      movieRepository.save.mockResolvedValueOnce(createdMovie as Movie)

      const result = await movieService.create(mockCreateMovieDto, adminId)

      expect(movieRepository.create).toHaveBeenCalledWith({
        ...mockCreateMovieDto,
        admin_updated: true,
        admin_updated_at: expect.any(Date),
        admin_updated_by: adminId,
      })
      expect(movieRepository.save).toHaveBeenCalledWith(createdMovie)
      expect(result).toEqual(createdMovie)
    })

    it('should handle repository create error', async () => {
      const adminId = 1

      movieRepository.create.mockImplementationOnce(() => {
        throw new Error('Create failed')
      })

      await expect(movieService.create(mockCreateMovieDto, adminId)).rejects.toThrow('Create failed')

      expect(movieRepository.save).not.toHaveBeenCalled()
    })

    it('should handle repository save error', async () => {
      const adminId = 1
      const createdMovie = {
        ...mockCreateMovieDto,
        admin_updated: true,
        admin_updated_at: expect.any(Date),
        admin_updated_by: adminId,
      }

      movieRepository.create.mockReturnValueOnce(createdMovie as Movie)
      movieRepository.save.mockRejectedValueOnce(new Error('Save failed'))

      await expect(movieService.create(mockCreateMovieDto, adminId)).rejects.toThrow('Save failed')
    })
  })

  describe('delete', () => {
    it('should soft delete movie successfully', async () => {
      const movieId = 1
      const adminId = 1

      movieRepository.exists.mockResolvedValueOnce(true)

      await movieService.delete(movieId, adminId)

      expect(movieRepository.exists).toHaveBeenCalledWith({ where: { id: movieId } })
      expect(movieRepository.update).toHaveBeenCalledWith(
        { id: movieId },
        {
          deleted_at: expect.any(Date),
          admin_updated: true,
          admin_updated_by: adminId,
          admin_updated_at: expect.any(Date),
        },
      )
    })

    it('should throw MovieNotFoundException when movie does not exist', async () => {
      const movieId = 999
      const adminId = 1

      movieRepository.exists.mockResolvedValueOnce(false)

      await expect(movieService.delete(movieId, adminId)).rejects.toThrow(MovieNotFoundException)

      expect(movieRepository.exists).toHaveBeenCalledWith({ where: { id: movieId } })
      expect(movieRepository.update).not.toHaveBeenCalled()
    })

    it('should handle repository update error during delete', async () => {
      const movieId = 1
      const adminId = 1

      movieRepository.exists.mockResolvedValueOnce(true)
      movieRepository.update.mockRejectedValueOnce(new Error('Update failed'))

      await expect(movieService.delete(movieId, adminId)).rejects.toThrow('Update failed')

      expect(movieRepository.exists).toHaveBeenCalledWith({ where: { id: movieId } })
    })

    it('should handle repository exists error', async () => {
      const movieId = 1
      const adminId = 1

      movieRepository.exists.mockRejectedValueOnce(new Error('Database error'))

      await expect(movieService.delete(movieId, adminId)).rejects.toThrow('Database error')

      expect(movieRepository.update).not.toHaveBeenCalled()
    })
  })

  describe('private methods', () => {
    describe('findMovieFromApi', () => {
      it('should fetch movie from API successfully', async () => {
        const external_id = 'starwars-movie-1'
        starWarsApi.fetchMovieById.mockResolvedValueOnce(mockStarwarsApiDetailResponse)

        movieRepository.findOne.mockResolvedValueOnce(mockMovieEntity as Movie)

        await movieService.findById(1, true)

        expect(starWarsApi.fetchMovieById).toHaveBeenCalledWith(external_id)
      })

      it('should propagate API errors', async () => {
        movieRepository.findOne.mockResolvedValueOnce(mockMovieEntity as Movie)
        starWarsApi.fetchMovieById.mockRejectedValueOnce(new Error('API Error'))

        await expect(movieService.findById(1, true)).rejects.toThrow('API Error')
      })
    })
  })

  describe('edge cases and error scenarios', () => {
    it('should handle invalid pagination parameters gracefully', async () => {
      movieRepository.find.mockResolvedValueOnce([])

      const page = -1
      const limit = -10
      const result = await movieService.find(page, limit)

      expect(movieRepository.find).toHaveBeenCalledWith({ take: limit, skip: (page - 1) * limit })
      expect(result).toEqual([])
    })

    it('should handle large pagination offsets', async () => {
      movieRepository.find.mockResolvedValueOnce([])

      const page = 1000
      const limit = 50
      const result = await movieService.find(page, limit)

      expect(movieRepository.find).toHaveBeenCalledWith({ take: limit, skip: (page - 1) * limit })
      expect(result).toEqual([])
    })
  })
})
