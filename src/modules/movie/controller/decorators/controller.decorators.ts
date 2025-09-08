import { applyDecorators, Delete, Get, HttpStatus, Patch, Post, Put } from '@nestjs/common'
import { EnumRoles } from '../../../auth/enum/roles.enum'
import { Auth } from '../../../auth/decorator/auth.decorator'
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { SyncMoviesResponseDto } from '../../dto/sync.dto'
import { MovieResponseDto } from '../../dto/movie.dto'
import { ProtectedRoutes, PublicRoutes } from '../../../../core/decorators/controllers.decorators'

export function SyncMoviesEndpoint(): any {
  return applyDecorators(
    ProtectedRoutes(HttpStatus.OK),
    Put('sync'),
    Auth([EnumRoles.ADMIN]),
    ApiOperation({
      summary:
        'This will sync movies from star wars api. If froce is true, it will override all data, include deleted ones.',
    }),
    ApiOkResponse({ type: SyncMoviesResponseDto }),
  )
}

export function UpdateMovie(): any {
  return applyDecorators(
    ProtectedRoutes(HttpStatus.OK),
    Patch(':id'),
    Auth([EnumRoles.ADMIN]),
    ApiOkResponse({ type: MovieResponseDto }),
    ApiNotFoundResponse({ description: 'It will throw if no movie matched with given id.' }),
    ApiOperation({
      summary: 'Update movie by by. Only admins can perfom.',
    }),
  )
}

export function GetMovies(): any {
  return applyDecorators(
    PublicRoutes(HttpStatus.OK),
    Get(''),
    ApiOkResponse({ type: MovieResponseDto, isArray: true }),
    ApiNoContentResponse({ description: 'It will return 204 no content if there is no movies.' }),
    ApiOperation({
      summary: 'Get list of movies. Can be paginated',
    }),
  )
}

export function GetMovieById(): any {
  return applyDecorators(
    ProtectedRoutes(HttpStatus.OK),
    Auth([EnumRoles.ADMIN, EnumRoles.USER]),
    Get(':id'),
    ApiOkResponse({ type: MovieResponseDto }),
    ApiNotFoundResponse({ type: 'It will return 404 if no movie was found with given id' }),
    ApiOperation({
      summary:
        'Get movie by id. Can ask for extra info that comes from API. Stored in cache. Only users with token can perform.',
    }),
  )
}

export function CreateMovie(): any {
  return applyDecorators(
    Post(''),
    ProtectedRoutes(HttpStatus.CREATED),
    Auth([EnumRoles.ADMIN]),
    ApiCreatedResponse({ type: MovieResponseDto }),
    ApiUnprocessableEntityResponse({ type: 'It will throw 422 if body is invalid.' }),
    ApiOperation({
      summary: 'Create movie. Only admin can perform.',
    }),
  )
}

export function DeleteMovie(): any {
  return applyDecorators(
    ProtectedRoutes(HttpStatus.NO_CONTENT),
    Delete(':id'),
    Auth([EnumRoles.ADMIN]),
    ApiNoContentResponse({ description: 'If 204 is received, movie was deleted.' }),
    ApiNotFoundResponse({ description: 'It will throw 404 if movie was not found with given id.' }),
    ApiOperation({
      summary: 'Delete movie by given id. Only admin can perform.',
    }),
  )
}
