import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../auth.service'
import { RegisterDto } from '../dto/register.dto'
import { LoginDto } from '../dto/login.dto'
import { ILoginResponse } from '../interfaces/responses/login.interface'
import { EnumRoles } from '../enum/roles.enum'
import { InvalidCredentialsException } from '../exceptions/unauthorized.exception'
import { UserExistsException } from '../../user/exceptions/user.exceptions'
import { JWtAccessGuard } from '../guards/jwt/jwt_access.guard'
import { RolesGuard } from '../guards/roles/roles.guard'
import { AuthController } from '../controller/auth.controller'
import { mockAuthService } from './__mocks__/auth.service.mock'
import { mockJwtAccessGuard, mockRolesGuard } from './__mocks__/guards.mock'
import { mockLoginDto, mockLoginResponse } from './__mocks__/login.mock'
import { mockRegisterAdminDto, mockRegisterDto } from './__mocks__/register.mock'

describe('AuthController', () => {
  let authController: AuthController
  let authService: jest.Mocked<AuthService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JWtAccessGuard)
      .useValue(mockJwtAccessGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile()

    authController = module.get<AuthController>(AuthController)
    authService = module.get(AuthService)

    jest.clearAllMocks()
    mockJwtAccessGuard.canActivate.mockReturnValue(true)
    mockRolesGuard.canActivate.mockReturnValue(true)
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const is_registered = await authController.register(mockRegisterDto)

      expect(is_registered).toBe(true)
      expect(authService.register).toHaveBeenCalledWith(
        mockRegisterDto.username,
        mockRegisterDto.password,
        EnumRoles.USER,
      )
    })

    it('should handle registration with different user data', async () => {
      const differentRegisterDto: RegisterDto = {
        username: 'anotheruser',
        password: 'differentpassword456',
      }
      const is_registered = await authController.register(differentRegisterDto)
      expect(is_registered).toBe(true)
      expect(authService.register).toHaveBeenCalledWith(
        differentRegisterDto.username,
        differentRegisterDto.password,
        EnumRoles.USER,
      )
    })

    it('should handle registration errors', async () => {
      authService.register.mockRejectedValueOnce(new UserExistsException())

      await expect(authController.register(mockRegisterDto)).rejects.toThrow(UserExistsException)
      expect(authService.register).toHaveBeenCalledWith(
        mockRegisterDto.username,
        mockRegisterDto.password,
        EnumRoles.USER,
      )
    })

    it('should handle service throwing general errors', async () => {
      const error = new Error('Database connection failed')
      authService.register.mockRejectedValueOnce(error)

      await expect(authController.register(mockRegisterDto)).rejects.toThrow('Database connection failed')
      expect(authService.register).toHaveBeenCalledWith(
        mockRegisterDto.username,
        mockRegisterDto.password,
        EnumRoles.USER,
      )
    })
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      const result = await authController.login(mockLoginDto)
      expect(result).toEqual(mockLoginResponse)
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto.username, mockLoginDto.password)
    })

    it('should handle login with different credentials', async () => {
      const differentLoginDto: LoginDto = {
        username: 'differentuser',
        password: 'differentpassword',
      }
      const differentResponse: ILoginResponse = {
        access_token: 'different_access_token',
        refresh_token: 'different_refresh_token',
      }
      authService.login.mockResolvedValueOnce(differentResponse)

      const result = await authController.login(differentLoginDto)

      expect(result).toEqual(differentResponse)
      expect(authService.login).toHaveBeenCalledWith(differentLoginDto.username, differentLoginDto.password)
    })

    it('should handle invalid credentials', async () => {
      authService.login.mockRejectedValueOnce(new InvalidCredentialsException())

      await expect(authController.login(mockLoginDto)).rejects.toThrow(InvalidCredentialsException)
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto.username, mockLoginDto.password)
    })

    it('should handle service errors during login', async () => {
      const error = new Error('JWT service unavailable')
      authService.login.mockRejectedValueOnce(error)

      await expect(authController.login(mockLoginDto)).rejects.toThrow('JWT service unavailable')
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto.username, mockLoginDto.password)
    })
  })

  describe('registerAdmin', () => {
    it('should register a new admin user successfully', async () => {
      const is_created = await authController.registerAdmin(mockRegisterAdminDto)

      expect(is_created).toBe(true)
      expect(authService.register).toHaveBeenCalledWith(
        mockRegisterAdminDto.username,
        mockRegisterAdminDto.password,
        EnumRoles.ADMIN,
      )
    })

    it('should handle admin registration with different user data', async () => {
      const adminRegisterDto: RegisterDto = {
        username: 'adminuser',
        password: 'adminpassword123',
      }
      const is_created = await authController.registerAdmin(adminRegisterDto)

      expect(is_created).toBe(true)
      expect(authService.register).toHaveBeenCalledWith(
        adminRegisterDto.username,
        adminRegisterDto.password,
        EnumRoles.ADMIN,
      )
    })

    it('should handle admin registration errors', async () => {
      authService.register.mockRejectedValueOnce(new UserExistsException())

      await expect(authController.registerAdmin(mockRegisterDto)).rejects.toThrow(UserExistsException)
      expect(authService.register).toHaveBeenCalledWith(
        mockRegisterDto.username,
        mockRegisterDto.password,
        EnumRoles.ADMIN,
      )
    })
  })

  describe('controller behavior', () => {
    it('should call service methods exactly once per controller method call', async () => {
      authService.register.mockResolvedValue(undefined)
      authService.login.mockResolvedValue(mockLoginResponse)

      await authController.register(mockRegisterDto)
      await authController.login(mockLoginDto)
      await authController.registerAdmin(mockRegisterDto)

      expect(authService.register).toHaveBeenCalledTimes(2)
      expect(authService.login).toHaveBeenCalledTimes(1)
    })

    it('should maintain correct role assignment for different registration endpoints', async () => {
      authService.register.mockResolvedValue(undefined)

      await authController.register(mockRegisterDto)
      await authController.registerAdmin(mockRegisterDto)

      expect(authService.register).toHaveBeenNthCalledWith(
        1,
        mockRegisterDto.username,
        mockRegisterDto.password,
        EnumRoles.USER,
      )
      expect(authService.register).toHaveBeenNthCalledWith(
        2,
        mockRegisterDto.username,
        mockRegisterDto.password,
        EnumRoles.ADMIN,
      )
    })
  })
})
