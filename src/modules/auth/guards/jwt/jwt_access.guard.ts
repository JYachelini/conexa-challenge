import { Injectable } from '@nestjs/common'
import { EnumJwtType } from '../../enum/jwt.enum'
import { JwtService } from '../../jwt/jwt.service'
import { JWtGuard } from './jwt.guard'

@Injectable()
export class JWtAccessGuard extends JWtGuard {
  constructor(protected readonly jwtService: JwtService) {
    super(EnumJwtType.ACCESS, jwtService)
  }
}
