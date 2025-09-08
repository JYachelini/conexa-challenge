import { UnauthorizedException } from '@nestjs/common'

export enum EnumUnauthorizedJwtErrors {
  EXPIRED = 'Token expired.',
  JWT_ERROR = 'Invalid request.',
}

export class UnauthorizedJwtException extends UnauthorizedException {
  constructor(message: EnumUnauthorizedJwtErrors = EnumUnauthorizedJwtErrors.JWT_ERROR) {
    super(message)
  }
}

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Invalid credentials.')
  }
}
