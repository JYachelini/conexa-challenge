import { Body, Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthService } from '../auth.service'
import { EnumRoles } from '../enum/roles.enum'
import { LoginDto } from '../dto/login.dto'
import { ILoginResponse } from '../interfaces/responses/login.interface'
import { RegisterDto } from '../dto/register.dto'
import { CreateAdminEndpoint, LoginEndpoint, RegisterEndpoint } from './decorators/controller.decorators'

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RegisterEndpoint()
  async register(@Body() new_user: RegisterDto): Promise<boolean> {
    await this.authService.register(new_user.username, new_user.password, EnumRoles.USER)
    return true
  }

  @LoginEndpoint()
  async login(@Body() login: LoginDto): Promise<ILoginResponse> {
    return await this.authService.login(login.username, login.password)
  }

  @CreateAdminEndpoint()
  async registerAdmin(@Body() new_user: RegisterDto): Promise<boolean> {
    await this.authService.register(new_user.username, new_user.password, EnumRoles.ADMIN)
    return true
  }
}
