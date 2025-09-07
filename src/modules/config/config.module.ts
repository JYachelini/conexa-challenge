import { Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config'
import { validate } from './validation/env.validation'
import { environments } from './env.config'

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [environments],
      validate,
      isGlobal: true,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
