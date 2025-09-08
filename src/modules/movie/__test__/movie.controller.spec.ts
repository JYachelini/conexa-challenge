import { Test, TestingModule } from '@nestjs/testing'
import { MovieController } from '../controller/movie.controller'
import { MovieService } from '../services/movie.service'
import { MovieSyncService } from '../services/sync.service'
import { MovieNotFoundException } from '../exceptions/movie.exceptions'
import { JWtAccessGuard } from '../../auth/guards/jwt/jwt_access.guard'
import { RolesGuard } from '../../auth/guards/roles/roles.guard'

import { mockMovieService } from './__mocks__/movie.service.mock'
import { mockMovieSyncService } from './__mocks__/sync.service.mock'
import { mockJwtAccessGuard, mockRolesGuard } from './__mocks__/guards.mock'
import {
  mockMovieEntity,
  mockMovieEntityAdminUpdated,
  mockSyncMoviesResponse,
  mockCreateMovieDto,
} from './__mocks__/movie.mock'
import {
  mockSyncMoviesDto,
  mockSyncMoviesDtoForceUpdate,
  mockPaginateDto,
  mockPaginateDtoCustom,
  mockGetMovieQueryDto,
  mockGetMovieQueryDtoExtended,
  mockUpdateMovieDto,
} from './__mocks__/dto.mock'
import { Movie } from '../entity/movie.entity'
import { MovieResponseDto } from '../dto/movie.dto'

describe('MovieController', () => {
  let movieController: MovieController
  let movieService: jest.Mocked<MovieService>
  let movieSyncService: jest.Mocked<MovieSyncService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: MovieService,
          useValue: mockMovieService,
        },
        {
          provide: MovieSyncService,
          useValue: mockMovieSyncService,
        },
      ],
    })
      .overrideGuard(JWtAccessGuard)
      .useValue(mockJwtAccessGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile()

    movieController = module.get<MovieController>(MovieController)
    movieService = module.get(MovieService)
    movieSyncService = module.get(MovieSyncService)
  })

  afterEach(() => {
    jest.clearAllMocks()
    mockJwtAccessGuard.canActivate.mockReturnValue(true)
    mockRolesGuard.canActivate.mockReturnValue(true)
  })

  describe('syncMovies', () => {
    it('should sync movies successfully without force update', async () => {
      const result = await movieController.syncMovies(mockSyncMoviesDto)
      expect(movieSyncService.syncMoviesFromApi).toHaveBeenCalledWith(false)
      expect(result).toEqual(mockSyncMoviesResponse)
    })

    it('should sync movies successfully with force update', async () => {
      const result = await movieController.syncMovies(mockSyncMoviesDtoForceUpdate)

      expect(movieSyncService.syncMoviesFromApi).toHaveBeenCalledWith(true)
      expect(result).toEqual(mockSyncMoviesResponse)
    })

    it('should handle sync service errors', async () => {
      movieSyncService.syncMoviesFromApi.mockRejectedValueOnce(new Error('Sync failed'))
      await expect(movieController.syncMovies(mockSyncMoviesDto)).rejects.toThrow('Sync failed')
      expect(movieSyncService.syncMoviesFromApi).toHaveBeenCalledWith(false)
    })
  })

  describe('updateMovie', () => {
    it('should update movie successfully', async () => {
      const movieId = 1
      const adminId = 1
      const updatedMovie = { ...mockMovieEntity, ...mockUpdateMovieDto }

      movieService.updateMovieByAdmin.mockResolvedValueOnce(updatedMovie as Movie)

      const result = await movieController.updateMovie(mockUpdateMovieDto, movieId, adminId)

      expect(movieService.updateMovieByAdmin).toHaveBeenCalledWith(movieId, mockUpdateMovieDto, adminId)
      expect(result).toEqual(
        expect.objectContaining({
          id: movieId,
          title: mockUpdateMovieDto.title,
          director: mockUpdateMovieDto.director,
          opening_crawl: mockUpdateMovieDto.opening_crawl,
        }),
      )
    })

    it('should handle movie not found error', async () => {
      const movieId = 999
      const adminId = 1

      movieService.updateMovieByAdmin.mockRejectedValueOnce(new MovieNotFoundException())

      await expect(movieController.updateMovie(mockUpdateMovieDto, movieId, adminId)).rejects.toThrow(
        MovieNotFoundException,
      )

      expect(movieService.updateMovieByAdmin).toHaveBeenCalledWith(movieId, mockUpdateMovieDto, adminId)
    })

    it('should transform response to DTO', async () => {
      const movieId = 1
      const adminId = 1
      const updatedMovie = { ...mockMovieEntity, ...mockUpdateMovieDto }

      movieService.updateMovieByAdmin.mockResolvedValueOnce(updatedMovie as Movie)

      const result = await movieController.updateMovie(mockUpdateMovieDto, movieId, adminId)

      expect(result).toBeInstanceOf(MovieResponseDto)
      expect(result.id).toBe(movieId)
      expect(result.title).toBe(mockUpdateMovieDto.title)
    })
  })

  describe('getMovies', () => {
    it('should return movies with default pagination', async () => {
      const mockMovies = [mockMovieEntity, mockMovieEntityAdminUpdated]
      movieService.find.mockResolvedValueOnce(mockMovies)
      const result = await movieController.getMovies(mockPaginateDto)

      expect(movieService.find).toHaveBeenCalledWith(mockPaginateDto.page, mockPaginateDto.limit)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(expect.objectContaining({ id: mockMovieEntity.id }))
      expect(result[1]).toEqual(expect.objectContaining({ id: mockMovieEntityAdminUpdated.id }))
    })

    it('should return movies with custom pagination', async () => {
      const mockMovies = [mockMovieEntity]
      movieService.find.mockResolvedValueOnce(mockMovies)

      const result = await movieController.getMovies(mockPaginateDtoCustom)

      expect(movieService.find).toHaveBeenCalledWith(mockPaginateDtoCustom.page, mockPaginateDtoCustom.limit)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(expect.objectContaining({ id: mockMovieEntity.id }))
    })

    it('should handle empty results', async () => {
      movieService.find.mockResolvedValueOnce([])

      const result = await movieController.getMovies(mockPaginateDto)

      expect(movieService.find).toHaveBeenCalledWith(mockPaginateDto.page, mockPaginateDto.limit)
      expect(result).toEqual([])
    })

    it('should transform results to DTOs', async () => {
      const mockMovies = [mockMovieEntity]
      movieService.find.mockResolvedValueOnce(mockMovies)

      const result = await movieController.getMovies(mockPaginateDto)

      expect(result).toHaveLength(1)
      expect(result[0]).toBeInstanceOf(MovieResponseDto)
      expect(result[0].id).toBe(mockMovieEntity.id)
    })
  })

  describe('getMovieById', () => {
    it('should return movie by id without extended data', async () => {
      const movieId = 1
      movieService.findById.mockResolvedValueOnce(mockMovieEntity)

      const result = await movieController.getMovieById(movieId, mockGetMovieQueryDto)

      expect(movieService.findById).toHaveBeenCalledWith(movieId, false)
      expect(result).toEqual(expect.objectContaining({ id: movieId }))
    })

    it('should return movie by id with extended data', async () => {
      const movieId = 1
      const extendedMovie = {
        ...mockMovieEntity,
        characters: ['https://swapi.dev/api/people/1/'],
        planets: ['https://swapi.dev/api/planets/1/'],
        starships: ['https://swapi.dev/api/starships/2/'],
        vehicles: ['https://swapi.dev/api/vehicles/4/'],
        species: ['https://swapi.dev/api/species/1/'],
      }

      movieService.findById.mockResolvedValueOnce(extendedMovie)

      const result = await movieController.getMovieById(movieId, mockGetMovieQueryDtoExtended)

      expect(movieService.findById).toHaveBeenCalledWith(movieId, true)
      expect(result).toEqual(
        expect.objectContaining({
          id: movieId,
          characters: extendedMovie.characters,
          planets: extendedMovie.planets,
        }),
      )
    })

    it('should handle movie not found', async () => {
      const movieId = 999

      movieService.findById.mockRejectedValueOnce(new MovieNotFoundException())

      await expect(movieController.getMovieById(movieId, mockGetMovieQueryDto)).rejects.toThrow(MovieNotFoundException)

      expect(movieService.findById).toHaveBeenCalledWith(movieId, false)
    })

    it('should transform response to MovieDetailResponseDto', async () => {
      const movieId = 1
      const extendedMovie = {
        ...mockMovieEntity,
        characters: ['https://swapi.dev/api/people/1/'],
        planets: ['https://swapi.dev/api/planets/1/'],
        starships: ['https://swapi.dev/api/starships/2/'],
        vehicles: ['https://swapi.dev/api/vehicles/4/'],
        species: ['https://swapi.dev/api/species/1/'],
      }

      movieService.findById.mockResolvedValueOnce(extendedMovie)

      const result = await movieController.getMovieById(movieId, mockGetMovieQueryDtoExtended)

      expect(result).toBeInstanceOf(Object)
      expect(result.characters).toBeDefined()
      expect(result.planets).toBeDefined()
      expect(result.starships).toBeDefined()
    })
  })

  describe('createMovie', () => {
    it('should create movie successfully', async () => {
      const adminId = 1
      const createdMovie = {
        ...mockCreateMovieDto,
        id: 1,
        admin_updated: true,
        admin_updated_at: new Date(),
        admin_updated_by: adminId,
        external_description: null,
        external_id: null,
        created: null,
        edited: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      }

      movieService.create.mockResolvedValueOnce(createdMovie)

      const result = await movieController.createMovie(mockCreateMovieDto, adminId)

      expect(movieService.create).toHaveBeenCalledWith(mockCreateMovieDto, adminId)
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          title: mockCreateMovieDto.title,
          director: mockCreateMovieDto.director,
          opening_crawl: mockCreateMovieDto.opening_crawl,
        }),
      )
    })

    it('should handle service creation errors', async () => {
      const adminId = 1

      movieService.create.mockRejectedValueOnce(new Error('Creation failed'))

      await expect(movieController.createMovie(mockCreateMovieDto, adminId)).rejects.toThrow('Creation failed')

      expect(movieService.create).toHaveBeenCalledWith(mockCreateMovieDto, adminId)
    })

    it('should transform response to DTO', async () => {
      const adminId = 1
      const createdMovie = {
        ...mockCreateMovieDto,
        id: 1,
        admin_updated: true,
        admin_updated_at: new Date(),
        admin_updated_by: adminId,
        external_description: null,
        external_id: null,
        created: null,
        edited: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      }

      movieService.create.mockResolvedValueOnce(createdMovie)

      const result = await movieController.createMovie(mockCreateMovieDto, adminId)

      expect(result).toBeInstanceOf(Object)
      expect(result.id).toBe(1)
      expect(result.title).toBe(mockCreateMovieDto.title)
    })
  })

  describe('deleteMovie', () => {
    it('should delete movie successfully', async () => {
      const movieId = 1
      const adminId = 1

      movieService.delete.mockResolvedValueOnce(undefined)

      const result = await movieController.deleteMovie(movieId, adminId)

      expect(movieService.delete).toHaveBeenCalledWith(movieId, adminId)
      expect(result).toBeUndefined()
    })

    it('should handle movie not found during deletion', async () => {
      const movieId = 999
      const adminId = 1

      movieService.delete.mockRejectedValueOnce(new MovieNotFoundException())

      await expect(movieController.deleteMovie(movieId, adminId)).rejects.toThrow(MovieNotFoundException)

      expect(movieService.delete).toHaveBeenCalledWith(movieId, adminId)
    })

    it('should handle service deletion errors', async () => {
      const movieId = 1
      const adminId = 1

      movieService.delete.mockRejectedValueOnce(new Error('Deletion failed'))

      await expect(movieController.deleteMovie(movieId, adminId)).rejects.toThrow('Deletion failed')

      expect(movieService.delete).toHaveBeenCalledWith(movieId, adminId)
    })
  })

  describe('parameter extraction and validation', () => {
    it('should properly extract parameters from different decorators', async () => {
      const movieId = 1
      movieService.findById.mockResolvedValueOnce(mockMovieEntity)

      await movieController.getMovieById(movieId, mockGetMovieQueryDto)

      expect(movieService.findById).toHaveBeenCalledWith(movieId, false)
    })

    it('should handle CurrentUser decorator properly', async () => {
      const adminId = 123
      const createdMovie = {
        ...mockCreateMovieDto,
        id: 1,
        admin_updated: true,
        admin_updated_at: new Date(),
        admin_updated_by: adminId,
        external_description: null,
        external_id: null,
        created: null,
        edited: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      }

      movieService.create.mockResolvedValueOnce(createdMovie)

      await movieController.createMovie(mockCreateMovieDto, adminId)

      expect(movieService.create).toHaveBeenCalledWith(mockCreateMovieDto, adminId)
    })
  })

  describe('DTO transformations', () => {
    it('should properly use plainToInstance for response transformation', async () => {
      const mockMovies = [mockMovieEntity]
      movieService.find.mockResolvedValueOnce(mockMovies)

      const result = await movieController.getMovies(mockPaginateDto)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('title')
      expect(result[0]).toHaveProperty('director')
    })

    it('should handle null/undefined values in transformations', async () => {
      const movieWithNulls = {
        ...mockMovieEntity,
        title: null,
        director: null,
      }

      movieService.findById.mockResolvedValueOnce(movieWithNulls)

      const result = await movieController.getMovieById(1, mockGetMovieQueryDto)

      expect(result).toBeDefined()
      expect(result.id).toBe(1)
    })
  })
})
