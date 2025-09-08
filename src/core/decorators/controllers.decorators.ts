import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

export function PublicRoutes(status: HttpStatus): any {
  return applyDecorators(HttpCode(status), GenericErrors())
}

export function GenericErrors(): any {
  return applyDecorators(
    ApiInternalServerErrorResponse({ description: 'If something goes wrong and is not expected.' }),
  )
}

export function ProtectedRoutes(status: HttpStatus): any {
  return applyDecorators(
    PublicRoutes(status),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'It will throw if no token is provided.' }),
    ApiForbiddenResponse({ description: 'It will throw Forbidden if current user does not have enough permissions.' }),
  )
}
