import { applyDecorators, HttpCode, HttpStatus, Post } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Auth } from '../../decorator/auth.decorator'
import { EnumRoles } from '../../enum/roles.enum'

export function RegisterEndpoint(): any {
  return applyDecorators(
    Post('sign-up'),
    ApiConflictResponse({ description: 'If username is taken throw conflict.' }),
    ApiUnprocessableEntityResponse({ description: 'If body validations fails throw unprocessable entity.' }),
    HttpCode(HttpStatus.CREATED),
  )
}

export function LoginEndpoint(): any {
  return applyDecorators(
    Post('sing-in'),
    ApiUnauthorizedResponse({ description: 'It will throw unauthorized if at least one validation fail.' }),
    HttpCode(HttpStatus.OK),
  )
}

export function CreateAdminEndpoint(): any {
  return applyDecorators(
    Post('admin'),
    ApiBearerAuth(),
    ApiForbiddenResponse({ description: 'It will throw Forbidden if current user does not have enough permissions.' }),
    ApiConflictResponse({ description: 'If username is taken throw conflict.' }),
    ApiUnprocessableEntityResponse({ description: 'If body validations fails throw unprocessable entity.' }),
    HttpCode(HttpStatus.CREATED),
    Auth([EnumRoles.ADMIN]),
  )
}
