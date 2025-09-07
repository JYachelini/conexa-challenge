import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HealthCheckController } from './health-check.controller'
import { HealthCheckService } from './health-check.service'

@Module({
  imports: [ConfigModule],
  providers: [HealthCheckService],
  controllers: [HealthCheckController],
})
export class HealthCheckModule {}
