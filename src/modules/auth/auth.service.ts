import { Injectable } from '@nestjs/common'
import { JwtService } from './jwt/jwt.service'
import { ILoginResponse } from './interfaces/responses/login.interface'
import { EnumJwtType } from './enum/jwt.enum'
import { UserService } from '../user/user.service'
import { hash, verify } from 'argon2'
import { InvalidCredentialsException, InvalidLogin } from './exceptions/unauthorized.exception'
import { IUser } from '../user/interface/user.interface'
import { EnumRoles } from './enum/roles.enum'
import { UserNotFound } from '../user/exceptions/user.exceptions'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  public async login(username: string, password: string): Promise<ILoginResponse> {
    const user = await this.verifyPassword(username, password)
    return await this.generateTokens(user)
  }

  private async updateRefreshToken(id: number, refresh_token: string): Promise<void> {
    const refresh_token_hash = await this.hashData(refresh_token)
    await this.userService.updateRefreshToken(id, refresh_token_hash)
  }

  private async verifyPassword(username: string, password: string): Promise<IUser> {
    const user = await this.userService.findByUsername(username, { password: true, id: true, role: true })
    if (!user) throw new InvalidCredentialsException()
    const is_valid_password = await this.verifyData(user.password, password)
    if (!is_valid_password) throw new InvalidCredentialsException()
    return user
  }

  public async refreshToken(id: number, refresh_token: string): Promise<ILoginResponse> {
    const user = await this.userService.findById(id, { id: true, role: true, refresh_token_hash: true })
    if (!user) throw new UserNotFound()
    if (!user.refresh_token_hash) throw new InvalidLogin()
    const is_valid_token = await this.verifyData(user.refresh_token_hash, refresh_token)
    if (!is_valid_token) throw new InvalidCredentialsException()
    return await this.generateTokens(user)
  }

  private async generateTokens(user: IUser): Promise<ILoginResponse> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signToken({ user_id: user.id, role: user.role }, EnumJwtType.ACCESS),
      this.jwtService.signToken({ user_id: user.id }, EnumJwtType.REFRESH),
    ])
    await this.updateRefreshToken(user.id, refresh_token)
    return {
      access_token,
      refresh_token,
    }
  }

  public async register(username: string, password: string, role: EnumRoles = EnumRoles.USER): Promise<void> {
    await this.userService.checkIfUsernameExists(username)
    const hashed_password = await this.hashData(password)
    await this.userService.create({
      username,
      password: hashed_password,
      role,
    })
    return
  }

  private async hashData(dataToHash: string, hashLength = 10): Promise<string> {
    return await hash(dataToHash, { hashLength })
  }

  private async verifyData(hash: string, data: string): Promise<boolean> {
    return await verify(hash, data)
  }
}
