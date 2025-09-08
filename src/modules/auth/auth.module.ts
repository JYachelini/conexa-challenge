import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtService } from './jwt/jwt.service'
import { ConfigModule } from '../config/config.module'

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  providers: [AuthService, JwtService],
  exports: [JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
