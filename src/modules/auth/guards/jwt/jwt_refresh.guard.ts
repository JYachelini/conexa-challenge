import { Injectable } from '@nestjs/common'
import { JwtService } from '../../jwt/jwt.service'
import { EnumJwtType } from '../../enum/jwt.enum'
import { JWtGuard } from './jwt.guard'

@Injectable()
export class JWtRefreshGuard extends JWtGuard {
  constructor(protected readonly jwtService: JwtService) {
    super(EnumJwtType.REFRESH, jwtService)
  }
}
