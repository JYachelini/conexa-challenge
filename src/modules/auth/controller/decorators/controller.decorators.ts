import { applyDecorators, HttpStatus, Post, UseGuards } from '@nestjs/common'
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Auth } from '../../decorator/auth.decorator'
import { EnumRoles } from '../../enum/roles.enum'
import { ProtectedRoutes, PublicRoutes } from '../../../../core/decorators/controllers.decorators'
import { LoginResponseDto } from '../../dto/login.dto'
import { JWtRefreshGuard } from '../../guards/jwt/jwt_refresh.guard'

export function RegisterEndpoint(): any {
  return applyDecorators(
    Post('sign-up'),
    PublicRoutes(HttpStatus.CREATED),
    ApiConflictResponse({ description: 'If username is taken throw conflict.' }),
    ApiUnprocessableEntityResponse({ description: 'If body validations fails throw unprocessable entity.' }),
    ApiOperation({ summary: 'Register new user.' }),
    ApiCreatedResponse({ description: 'Register succesful' }),
  )
}

export function LoginEndpoint(): any {
  return applyDecorators(
    Post('sing-in'),
    PublicRoutes(HttpStatus.OK),
    ApiUnauthorizedResponse({ description: 'It will throw unauthorized if at least one validation fail.' }),
    ApiOperation({ summary: 'Get access tokens.' }),
    ApiOkResponse({ type: LoginResponseDto }),
  )
}

export function CreateAdminEndpoint(): any {
  return applyDecorators(
    Post('admin'),
    ProtectedRoutes(HttpStatus.CREATED),
    ApiConflictResponse({ description: 'If username is taken throw conflict.' }),
    ApiUnprocessableEntityResponse({ description: 'If body validations fails throw unprocessable entity.' }),
    Auth([EnumRoles.ADMIN]),
    ApiOperation({ summary: 'Create new user as admin. Only admins can perform.' }),
  )
}

export function RefreshTokenEndpoint(): any {
  return applyDecorators(
    Post('refresh'),
    UseGuards(JWtRefreshGuard),
    ProtectedRoutes(HttpStatus.OK),
    ApiUnprocessableEntityResponse({ description: 'If body validations fails throw unprocessable entity.' }),
    ApiOkResponse({ type: LoginResponseDto }),
    ApiOperation({ summary: 'Endpoint for refresh tokens.' }),
  )
}
