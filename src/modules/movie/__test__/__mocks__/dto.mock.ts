import { SyncMoviesDto } from '../../dto/sync.dto'
import { PaginateDto } from '../../../../core/dto/paginate.dto'
import { GetMovieQueryDto } from '../../dto/get_movie.dto'
import { UpdateMovieDto } from '../../dto/movie.dto'

export const mockSyncMoviesDto: SyncMoviesDto = {
  force_update: false,
}

export const mockSyncMoviesDtoForceUpdate: SyncMoviesDto = {
  force_update: true,
}

export const mockPaginateDto: PaginateDto = {
  page: 1,
  limit: 10,
}

export const mockPaginateDtoCustom: PaginateDto = {
  page: 2,
  limit: 5,
}

export const mockGetMovieQueryDto: GetMovieQueryDto = {
  extended: false,
}

export const mockGetMovieQueryDtoExtended: GetMovieQueryDto = {
  extended: true,
}

export const mockUpdateMovieDto: UpdateMovieDto = {
  title: 'Updated Movie Title',
  director: 'Updated Director',
  opening_crawl: 'Updated opening crawl text',
}
