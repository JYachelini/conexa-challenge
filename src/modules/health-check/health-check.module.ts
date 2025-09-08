import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HealthCheckController } from './health-check.controller'
import { HealthCheckService } from './health-check.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [HealthCheckService],
  controllers: [HealthCheckController],
})
export class HealthCheckModule {}
