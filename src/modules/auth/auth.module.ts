import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { AuthController } from './controller/auth.controller'
import { JwtService } from './jwt/jwt.service'
import { ConfigModule } from '../config/config.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [ConfigModule, JwtModule.register({}), UserModule],
  providers: [AuthService, JwtService],
  exports: [JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
