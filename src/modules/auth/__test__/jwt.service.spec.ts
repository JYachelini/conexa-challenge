import { Test, TestingModule } from '@nestjs/testing'
import { JwtService as NestJwtService } from '@nestjs/jwt'
import { ConfigType } from '@nestjs/config'
import { environments } from '../../config/env.config'
import { IJwtPayload } from '../dto/jwt.dto'
import { EnumJwtType } from '../enum/jwt.enum'
import { EnumRoles } from '../enum/roles.enum'
import { JwtService } from '../jwt/jwt.service'

describe('JwtService', () => {
  let jwtService: JwtService
  let nestJwtService: jest.Mocked<NestJwtService>

  const mockConfig = {
    /* eslint-disable-next-line */
    JWT_SECRET: 'test_jwt_secret',
    /* eslint-disable-next-line */
    JWT_REFRESH_SECRET: 'test_jwt_refresh_secret',
    /* eslint-disable-next-line */
    APP_VERSION: '1.0.0',
  } as ConfigType<typeof environments>

  const mockJwtPayload: IJwtPayload = {
    user_id: 1,
    role: EnumRoles.USER,
  }

  const mockRefreshPayload: IJwtPayload = {
    user_id: 1,
  }

  beforeEach(async () => {
    const mockNestJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: NestJwtService,
          useValue: mockNestJwtService,
        },
        {
          provide: environments.KEY,
          useValue: mockConfig,
        },
      ],
    }).compile()

    jwtService = module.get<JwtService>(JwtService)
    nestJwtService = module.get(NestJwtService)

    jest.clearAllMocks()
  })

  describe('signToken', () => {
    it('should sign an access token successfully', async () => {
      const expectedToken = 'signed_access_token'
      nestJwtService.signAsync.mockResolvedValue(expectedToken)

      const result = await jwtService.signToken(mockJwtPayload, EnumJwtType.ACCESS)

      expect(result).toBe(expectedToken)
      expect(nestJwtService.signAsync).toHaveBeenCalledWith(mockJwtPayload, {
        secret: mockConfig.JWT_SECRET,
        expiresIn: '1d',
      })
    })

    it('should sign a refresh token successfully', async () => {
      const expectedToken = 'signed_refresh_token'
      nestJwtService.signAsync.mockResolvedValue(expectedToken)

      const result = await jwtService.signToken(mockRefreshPayload, EnumJwtType.REFRESH)

      expect(result).toBe(expectedToken)
      expect(nestJwtService.signAsync).toHaveBeenCalledWith(mockRefreshPayload, {
        secret: mockConfig.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      })
    })

    it('should handle signing errors', async () => {
      const error = new Error('JWT signing failed')
      nestJwtService.signAsync.mockRejectedValue(error)

      await expect(jwtService.signToken(mockJwtPayload, EnumJwtType.ACCESS)).rejects.toThrow('JWT signing failed')
      expect(nestJwtService.signAsync).toHaveBeenCalledWith(mockJwtPayload, {
        secret: mockConfig.JWT_SECRET,
        expiresIn: '1d',
      })
    })

    it('should use correct configuration for access tokens', async () => {
      const expectedToken = 'access_token'
      nestJwtService.signAsync.mockResolvedValue(expectedToken)

      await jwtService.signToken(mockJwtPayload, EnumJwtType.ACCESS)

      expect(nestJwtService.signAsync).toHaveBeenCalledWith(mockJwtPayload, {
        secret: 'test_jwt_secret',
        expiresIn: '1d',
      })
    })

    it('should use correct configuration for refresh tokens', async () => {
      const expectedToken = 'refresh_token'
      nestJwtService.signAsync.mockResolvedValue(expectedToken)

      await jwtService.signToken(mockRefreshPayload, EnumJwtType.REFRESH)

      expect(nestJwtService.signAsync).toHaveBeenCalledWith(mockRefreshPayload, {
        secret: 'test_jwt_refresh_secret',
        expiresIn: '7d',
      })
    })
  })

  describe('verify', () => {
    it('should verify an access token successfully', async () => {
      const token = 'valid_access_token'
      nestJwtService.verifyAsync.mockResolvedValue(mockJwtPayload)

      const result = await jwtService.verify(token, EnumJwtType.ACCESS)

      expect(result).toEqual(mockJwtPayload)
      expect(nestJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: mockConfig.JWT_SECRET,
      })
    })

    it('should verify a refresh token successfully', async () => {
      const token = 'valid_refresh_token'
      nestJwtService.verifyAsync.mockResolvedValue(mockRefreshPayload)

      const result = await jwtService.verify(token, EnumJwtType.REFRESH)

      expect(result).toEqual(mockRefreshPayload)
      expect(nestJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: mockConfig.JWT_REFRESH_SECRET,
      })
    })

    it('should handle token verification errors', async () => {
      const token = 'invalid_token'
      const error = new Error('Token verification failed')
      nestJwtService.verifyAsync.mockRejectedValue(error)

      await expect(jwtService.verify(token, EnumJwtType.ACCESS)).rejects.toThrow('Token verification failed')
      expect(nestJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: mockConfig.JWT_SECRET,
      })
    })

    it('should use correct secret for access token verification', async () => {
      const token = 'access_token'
      nestJwtService.verifyAsync.mockResolvedValue(mockJwtPayload)

      await jwtService.verify(token, EnumJwtType.ACCESS)

      expect(nestJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'test_jwt_secret',
      })
    })

    it('should use correct secret for refresh token verification', async () => {
      const token = 'refresh_token'
      nestJwtService.verifyAsync.mockResolvedValue(mockRefreshPayload)

      await jwtService.verify(token, EnumJwtType.REFRESH)

      expect(nestJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'test_jwt_refresh_secret',
      })
    })

    it('should handle expired tokens', async () => {
      const token = 'expired_token'
      const error = new Error('jwt expired')
      nestJwtService.verifyAsync.mockRejectedValue(error)

      await expect(jwtService.verify(token, EnumJwtType.ACCESS)).rejects.toThrow('jwt expired')
      expect(nestJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: mockConfig.JWT_SECRET,
      })
    })

    it('should handle malformed tokens', async () => {
      const token = 'malformed_token'
      const error = new Error('jwt malformed')
      nestJwtService.verifyAsync.mockRejectedValue(error)

      await expect(jwtService.verify(token, EnumJwtType.REFRESH)).rejects.toThrow('jwt malformed')
      expect(nestJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: mockConfig.JWT_REFRESH_SECRET,
      })
    })
  })

  describe('getSignOptions', () => {
    it('should return correct options for access token through signToken', async () => {
      const expectedToken = 'token'
      nestJwtService.signAsync.mockResolvedValue(expectedToken)

      await jwtService.signToken(mockJwtPayload, EnumJwtType.ACCESS)

      expect(nestJwtService.signAsync).toHaveBeenCalledWith(mockJwtPayload, {
        secret: mockConfig.JWT_SECRET,
        expiresIn: '1d',
      })
    })

    it('should return correct options for refresh token through signToken', async () => {
      const expectedToken = 'token'
      nestJwtService.signAsync.mockResolvedValue(expectedToken)

      await jwtService.signToken(mockRefreshPayload, EnumJwtType.REFRESH)

      expect(nestJwtService.signAsync).toHaveBeenCalledWith(mockRefreshPayload, {
        secret: mockConfig.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      })
    })
  })
})
