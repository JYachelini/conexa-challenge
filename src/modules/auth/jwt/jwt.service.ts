import { Inject, Injectable } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { JwtService as NestJwtService } from '@nestjs/jwt'
import { IJwtPayload } from '../dto/jwt.dto'
import { EnumJwtType } from '../enum/jwt.enum'
import { environments } from '../../config/env.config'

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    @Inject(environments.KEY) private readonly configService: ConfigType<typeof environments>,
  ) {}

  private getSignOptions(type: EnumJwtType): { secret: string; expiresIn: string } {
    return type === EnumJwtType.ACCESS
      ? { secret: this.configService.JWT_SECRET, expiresIn: '1d' }
      : { secret: this.configService.JWT_REFRESH_SECRET, expiresIn: '7d' }
  }

  public async signToken(payload: IJwtPayload, type: EnumJwtType): Promise<string> {
    const { secret, expiresIn } = this.getSignOptions(type)
    return await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    })
  }

  public async verify(token: string, type: EnumJwtType): Promise<IJwtPayload> {
    const { secret } = this.getSignOptions(type)
    return await this.jwtService.verifyAsync(token, {
      secret,
    })
  }
}
