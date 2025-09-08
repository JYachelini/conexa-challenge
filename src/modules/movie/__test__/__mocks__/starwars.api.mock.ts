import { IStarwarsApiResponse, IStarwarsApiDetailResponse } from '../../interface/api.response'
import { mockStarwarsApiResponse, mockStarwarsApiDetailResponse } from './movie.mock'

export const mockStarWarsApi = {
  fetchAllMovies: jest.fn().mockImplementation((): Promise<IStarwarsApiResponse> => {
    return Promise.resolve(mockStarwarsApiResponse)
  }),
  fetchMovieById: jest.fn().mockImplementation((_: string): Promise<IStarwarsApiDetailResponse> => {
    return Promise.resolve(mockStarwarsApiDetailResponse)
  }),
}
