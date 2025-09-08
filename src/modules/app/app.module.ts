import { Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { AuthModule } from '../auth/auth.module'
import { HealthCheckModule } from '../health-check/health-check.module'
import { DatabaseModule } from '@database/database.module'
import { UserModule } from '../user/user.module'
import { MovieModule } from '../movie/movie.module'

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, HealthCheckModule, UserModule, MovieModule],
})
export class AppModule {}
