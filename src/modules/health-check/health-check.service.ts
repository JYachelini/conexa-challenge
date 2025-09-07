import { Inject, Injectable } from '@nestjs/common'
import { environments } from '../config/env.config'
import type { ConfigType } from '@nestjs/config'

@Injectable()
export class HealthCheckService {
  constructor(@Inject(environments.KEY) private readonly configService: ConfigType<typeof environments>) {}

  public getVersion(): string {
    return this.configService.APP_VERSION
  }
}
