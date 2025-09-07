import { Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { AuthModule } from '../auth/auth.module'
import { HealthCheckModule } from '../health-check/health-check.module'

@Module({
  imports: [ConfigModule, AuthModule, HealthCheckModule],
})
export class AppModule {}
