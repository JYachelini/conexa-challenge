import { IMovieResult, IStarwarsApiResponse, IStarwarsApiDetailResponse } from '../../interface/api.response'
import { Movie } from '../../entity/movie.entity'
import { IResponseSyncMovies } from '../../interface/response.interace'
import { IMovie } from '../../interface/movie.interface'
import { CreateMovieDto, MovieResponseDto, MovieDetailResponseDto } from '../../dto/movie.dto'

export const mockApiMovieResult: IMovieResult = {
  uid: 'starwars-movie-1',
  description: 'A New Hope',
  properties: {
    title: 'A New Hope',
    episode_id: 4,
    opening_crawl: 'It is a period of civil war...',
    director: 'George Lucas',
    producer: 'Gary Kurtz, Rick McCallum',
    release_date: '1977-05-25',
    characters: ['https://swapi.dev/api/people/1/'],
    planets: ['https://swapi.dev/api/planets/1/'],
    starships: ['https://swapi.dev/api/starships/2/'],
    vehicles: ['https://swapi.dev/api/vehicles/4/'],
    species: ['https://swapi.dev/api/species/1/'],
    created: new Date('2014-12-10T14:23:31.880000Z'),
    edited: new Date('2014-12-20T19:49:45.256000Z'),
    url: 'https://swapi.dev/api/films/1/',
  },
}

export const mockApiMovieResult2: IMovieResult = {
  uid: 'starwars-movie-2',
  description: 'The Empire Strikes Back',
  properties: {
    title: 'The Empire Strikes Back',
    episode_id: 5,
    opening_crawl: 'It is a dark time for the Rebellion...',
    director: 'Irvin Kershner',
    producer: 'Gary Kurtz, Rick McCallum',
    release_date: '1980-05-17',
    characters: ['https://swapi.dev/api/people/1/'],
    planets: ['https://swapi.dev/api/planets/4/'],
    starships: ['https://swapi.dev/api/starships/3/'],
    vehicles: ['https://swapi.dev/api/vehicles/8/'],
    species: ['https://swapi.dev/api/species/1/'],
    created: new Date('2014-12-12T11:26:24.656000Z'),
    edited: new Date('2014-12-15T13:07:53.386000Z'),
    url: 'https://swapi.dev/api/films/2/',
  },
}

export const mockStarwarsApiResponse: IStarwarsApiResponse = {
  message: 'ok',
  result: [mockApiMovieResult, mockApiMovieResult2],
}

export const mockStarwarsApiDetailResponse: IStarwarsApiDetailResponse = {
  message: 'ok',
  result: mockApiMovieResult,
}

export const mockMovieEntity: IMovie = {
  id: 1,
  external_id: 'starwars-movie-1',
  external_description: 'A New Hope',
  created: new Date('2014-12-10T14:23:31.880000Z'),
  edited: new Date('2014-12-20T19:49:45.256000Z'),
  opening_crawl: 'It is a period of civil war...',
  director: 'George Lucas',
  producer: 'Gary Kurtz, Rick McCallum',
  release_date: '1977-05-25',
  title: 'A New Hope',
  url: 'https://swapi.dev/api/films/1/',
  episode_id: 4,
  admin_updated: false,
  admin_updated_at: null,
  admin_updated_by: null,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
}

export const mockMovieEntityAdminUpdated: IMovie = {
  ...mockMovieEntity,
  id: 2,
  admin_updated: true,
  admin_updated_at: new Date('2023-01-01'),
  admin_updated_by: 1,
  title: 'Admin Updated Title',
}

export const mockMovieEntityUpdated: IMovie = {
  ...mockMovieEntity,
  title: 'Updated Title',
  director: 'Updated Director',
}

export const mockSyncMoviesResponse: IResponseSyncMovies = {
  created: 1,
  updated: 1,
  skipped: 0,
  errors: 0,
  batchResults: [
    {
      batch: 1,
      success: true,
    },
  ],
}

export const mockBatchMovies = (length: number): IMovieResult[] =>
  Array.from({ length }, (_, i) => ({
    uid: `starwars-movie-${i + 1}`,
    description: `Movie ${i + 1}`,
    properties: {
      title: `Movie ${i + 1}`,
      episode_id: i + 1,
      opening_crawl: `Opening crawl for movie ${i + 1}`,
      director: `Director ${i + 1}`,
      producer: `Producer ${i + 1}`,
      release_date: `197${i % 10}-05-25`,
      characters: [],
      planets: [],
      starships: [],
      vehicles: [],
      species: [],
      created: new Date('2014-12-10T14:23:31.880000Z'),
      edited: new Date('2014-12-20T19:49:45.256000Z'),
      url: `https://swapi.dev/api/films/${i + 1}/`,
    },
  }))

export const mockPartialMovieUpdate: Partial<Movie> = {
  title: 'Updated by Admin',
  director: 'Updated Director',
  opening_crawl: 'Updated opening crawl',
}

export const mockCreateMovieDto: CreateMovieDto = {
  opening_crawl: 'A long time ago in a galaxy far, far away...',
  director: 'George Lucas',
  producer: 'Gary Kurtz, Rick McCallum',
  release_date: '1977-05-25',
  title: 'A New Hope',
  url: 'https://swapi.dev/api/films/1/',
  episode_id: 10,
}

export const mockMovieResponseDto: MovieResponseDto = {
  id: 1,
  opening_crawl: 'A long time ago in a galaxy far, far away...',
  director: 'George Lucas',
  producer: 'Gary Kurtz, Rick McCallum',
  release_date: '1977-05-25',
  title: 'A New Hope',
  url: 'https://swapi.dev/api/films/1/',
  episode_id: 10,
  created: new Date('2014-12-10T14:23:31.880000Z'),
  edited: new Date('2014-12-20T19:49:45.256000Z'),
}

export const mockMovieDetailResponseDto: MovieDetailResponseDto = {
  ...mockMovieResponseDto,
  starships: ['https://swapi.dev/api/starships/2/'],
  vehicles: ['https://swapi.dev/api/vehicles/4/'],
  planets: ['https://swapi.dev/api/planets/1/'],
  characters: ['https://swapi.dev/api/people/1/'],
  species: ['https://swapi.dev/api/species/1/'],
}
