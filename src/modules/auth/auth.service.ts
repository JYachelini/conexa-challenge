import { Injectable } from '@nestjs/common'
import { JwtService } from './jwt/jwt.service'
import { ILoginResponse } from './interfaces/responses/login.interface'
import { EnumJwtType } from './enum/jwt.enum'
import { EnumRoles } from './enum/roles.enum'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  public async login(): Promise<ILoginResponse> {
    const access_token = await this.jwtService.signToken({ user_id: 1, role: EnumRoles.USER }, EnumJwtType.ACCESS)
    const refresh_token = await this.jwtService.signToken({ user_id: 1 }, EnumJwtType.REFRESH)

    return {
      access_token,
      refresh_token,
    }
  }
}
