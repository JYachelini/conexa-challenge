import { Inject, Injectable } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { JwtService as NestJwtService } from '@nestjs/jwt'
import { JwtDto } from '../dto/jwt.dto'
import { EnumJwtType } from '../enum/jwt.enum'
import { environments } from 'src/modules/config/env.config'

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    @Inject(environments.KEY) private readonly configService: ConfigType<typeof environments>,
  ) {}

  private getSecret(type: EnumJwtType): string {
    return type === EnumJwtType.ACCESS ? this.configService.JWT_SECRET : this.configService.JWT_REFRESH_SECRET
  }

  private getExpiresIn(type: EnumJwtType): string {
    return type === EnumJwtType.ACCESS ? '1d' : '7d'
  }

  public async signToken(payload: JwtDto, type: EnumJwtType): Promise<string> {
    const secret = this.getSecret(type)
    const expiresIn = this.getExpiresIn(type)
    return await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    })
  }

  public async verify(token: string, type: EnumJwtType): Promise<JwtDto> {
    const secret = this.getSecret(type)
    return await this.jwtService.verifyAsync(token, {
      secret,
    })
  }
}
