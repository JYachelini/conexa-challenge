import { IResponseSyncMovies } from '../../interface/response.interace'
import { mockSyncMoviesResponse } from './movie.mock'

export const mockMovieSyncService = {
  syncMoviesFromApi: jest.fn().mockImplementation((_: boolean = false): Promise<IResponseSyncMovies> => {
    return Promise.resolve(mockSyncMoviesResponse)
  }),
}
