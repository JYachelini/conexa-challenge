import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../auth.service'
import { JwtService } from '../jwt/jwt.service'
import { UserService } from '../../user/user.service'
import { InvalidCredentialsException } from '../exceptions/unauthorized.exception'
import { UserExistsException, UserNotFound } from '../../user/exceptions/user.exceptions'
import { EnumJwtType } from '../enum/jwt.enum'
import { EnumRoles } from '../enum/roles.enum'
import * as argon2 from 'argon2'
import { mockJwtService } from './__mocks__/jwt.service.mock'
import { mockUserService } from '../../user/__test__/__mocks__/user.service.mock'
import { mockCreateUser, mockUser } from '../../user/__test__/__mocks__/user.mock'
import { mockJwtToken } from './__mocks__/jwt.mock'

jest.mock('argon2')

const mockedArgon2 = argon2 as jest.Mocked<typeof argon2>

describe('AuthService', () => {
  let authService: AuthService
  let jwtService: jest.Mocked<JwtService>
  let userService: jest.Mocked<UserService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    jwtService = module.get(JwtService)
    userService = module.get(UserService)
    jest.clearAllMocks()

    mockedArgon2.verify.mockImplementation((hash: string, data: Buffer | string) => {
      return Promise.resolve(`hashed_${data}` === hash)
    })

    mockedArgon2.hash.mockImplementation((data: Buffer | string) => {
      return Promise.resolve(`hashed_${data}`)
    })
  })

  describe('login', () => {
    it('should return tokens when credentials are valid', async () => {
      const username = mockUser.username
      const password = 'password'

      const result = await authService.login(username, password)

      expect(result).toEqual(mockJwtToken)
      expect(userService.findByUsername).toHaveBeenCalledWith(username, {
        password: true,
        id: true,
        role: true,
      })
      expect(argon2.verify).toHaveBeenCalledWith(mockUser.password, password)
      expect(jwtService.signToken).toHaveBeenCalledWith(
        { user_id: mockUser.id, role: mockUser.role },
        EnumJwtType.ACCESS,
      )
      expect(jwtService.signToken).toHaveBeenCalledWith({ user_id: mockUser.id }, EnumJwtType.REFRESH)
      expect(jwtService.signToken).toHaveBeenCalledTimes(2)
      expect(userService.updateRefreshToken).toHaveBeenCalledWith(mockUser.id, mockUser.refresh_token_hash)
    })

    it('should throw InvalidCredentialsException when user is not found', async () => {
      const username = 'nonexistent'
      const password = 'testpassword'
      await expect(authService.login(username, password)).rejects.toThrow(InvalidCredentialsException)
      expect(userService.findByUsername).toHaveBeenCalledWith(username, {
        password: true,
        id: true,
        role: true,
      })
    })

    it('should throw InvalidCredentialsException when password is invalid', async () => {
      const username = 'testuser'
      const password = 'wrongpassword'
      await expect(authService.login(username, password)).rejects.toThrow(InvalidCredentialsException)
      expect(argon2.verify).toHaveBeenCalledWith(mockUser.password, password)
    })
  })

  describe('refreshToken', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const result = await authService.refreshToken(mockUser.id, mockJwtToken.refresh_token)

      expect(result).toEqual(mockJwtToken)
      expect(userService.findById).toHaveBeenCalledWith(mockUser.id, {
        id: true,
        role: true,
        refresh_token_hash: true,
      })
      expect(argon2.verify).toHaveBeenCalledWith(mockUser.refresh_token_hash, mockJwtToken.refresh_token)
      expect(jwtService.signToken).toHaveBeenCalledWith(
        { user_id: mockUser.id, role: mockUser.role },
        EnumJwtType.ACCESS,
      )
      expect(jwtService.signToken).toHaveBeenCalledWith({ user_id: mockUser.id }, EnumJwtType.REFRESH)
      expect(jwtService.signToken).toHaveBeenCalledTimes(2)
      expect(userService.updateRefreshToken).toHaveBeenCalledWith(mockUser.id, mockUser.refresh_token_hash)
    })

    it('should throw UserNotFound when user does not exist', async () => {
      const userId = 999
      const refreshToken = 'refresh_token'

      await expect(authService.refreshToken(userId, refreshToken)).rejects.toThrow(UserNotFound)
    })

    it('should throw InvalidCredentialsException when refresh token is invalid', async () => {
      const userId = 1
      const refreshToken = 'invalid_refresh_token'

      userService.findById.mockResolvedValue(mockUser)
      await expect(authService.refreshToken(userId, refreshToken)).rejects.toThrow(InvalidCredentialsException)
    })
  })

  describe('register', () => {
    it('should register a new user with default USER role', async () => {
      const username = mockCreateUser.username
      const password = 'password'

      await authService.register(username, password)

      expect(userService.checkIfUsernameExists).toHaveBeenCalledWith(username)
      expect(argon2.hash).toHaveBeenCalledWith(password, { hashLength: 10 })
      expect(userService.create).toHaveBeenCalledWith({
        username,
        password: mockCreateUser.password,
        role: EnumRoles.USER,
      })
    })

    it('should register a new admin user', async () => {
      const username = 'admin'
      const password = 'password'
      const role = EnumRoles.ADMIN

      await authService.register(username, password, role)

      expect(userService.create).toHaveBeenCalledWith({
        username,
        password: mockCreateUser.password,
        role: EnumRoles.ADMIN,
      })
    })

    it('should throw an error if username already exists', async () => {
      const username = mockUser.username
      const password = 'password'

      userService.checkIfUsernameExists.mockRejectedValueOnce(new UserExistsException())

      await expect(authService.register(username, password)).rejects.toThrow('Username already exists.')
      expect(userService.checkIfUsernameExists).toHaveBeenCalledWith(username)
      expect(argon2.hash).not.toHaveBeenCalled()
      expect(userService.create).not.toHaveBeenCalled()
    })
  })

  describe('private methods behavior', () => {
    it('should verify password correctly through login flow', async () => {
      const username = mockUser.username
      const password = 'password'

      await authService.login(username, password)
      expect(argon2.verify).toHaveBeenCalledWith(mockUser.password, password)
    })

    it('should hash data correctly through register flow', async () => {
      const username = 'new_user'
      const password = 'password'

      await authService.register(username, password)
      expect(argon2.hash).toHaveBeenCalledWith(password, { hashLength: 10 })
    })
  })
})
