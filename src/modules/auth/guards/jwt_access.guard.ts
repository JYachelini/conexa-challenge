import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { TokenExpiredError } from '@nestjs/jwt'
import { JwtService } from '../jwt/jwt.service'
import { Request } from 'express'
import { EnumUnauthorizedJwtErrors, UnauthorizedJwtException } from '../exceptions/unauthorized.exception'
import { EnumJwtType } from '../enum/jwt.enum'

@Injectable()
export class JWtAccessGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractTokenFromHeader(request)
    if (!token) throw new UnauthorizedJwtException()
    try {
      const payload = await this.jwtService.verify(token, EnumJwtType.ACCESS)
      request.user = payload
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedJwtException(EnumUnauthorizedJwtErrors.EXPIRED)
      }
      throw new UnauthorizedJwtException()
    }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
