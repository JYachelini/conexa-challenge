import { Test, TestingModule } from '@nestjs/testing'
import { HealthCheckService } from '../health-check.service'
import { environments } from '../../config/env.config'
import { mockConfig } from './__mocks__/mock.config'

describe('HealthCheckService', () => {
  let healthCheckService: HealthCheckService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckService,
        {
          provide: environments.KEY,
          useValue: mockConfig,
        },
      ],
    }).compile()

    healthCheckService = module.get<HealthCheckService>(HealthCheckService)

    jest.clearAllMocks()
  })

  describe('getVersion', () => {
    it('should return the application version from config', () => {
      const result = healthCheckService.getVersion()

      expect(result).toBe(mockConfig.APP_VERSION)
    })

    it('should return the correct version when config changes', async () => {
      const newMockConfig = {
        ...mockConfig,
        /* eslint-disable-next-line */
        APP_VERSION: '2.0.0',
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          HealthCheckService,
          {
            provide: environments.KEY,
            useValue: newMockConfig,
          },
        ],
      }).compile()

      const service = module.get<HealthCheckService>(HealthCheckService)
      const result = service.getVersion()

      expect(result).toBe('2.0.0')
    })

    it('should handle undefined version gracefully', async () => {
      const configWithUndefinedVersion = {
        ...mockConfig,
        /* eslint-disable-next-line */
        APP_VERSION: undefined,
      } as any

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          HealthCheckService,
          {
            provide: environments.KEY,
            useValue: configWithUndefinedVersion,
          },
        ],
      }).compile()

      const service = module.get<HealthCheckService>(HealthCheckService)
      const result = service.getVersion()

      expect(result).toBeUndefined()
    })

    it('should handle empty string version', async () => {
      const configWithEmptyVersion = {
        ...mockConfig,
        /* eslint-disable-next-line */
        APP_VERSION: '',
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          HealthCheckService,
          {
            provide: environments.KEY,
            useValue: configWithEmptyVersion,
          },
        ],
      }).compile()

      const service = module.get<HealthCheckService>(HealthCheckService)
      const result = service.getVersion()

      expect(result).toBe('')
    })

    it('should be called successfully multiple times', () => {
      const result1 = healthCheckService.getVersion()
      const result2 = healthCheckService.getVersion()
      const result3 = healthCheckService.getVersion()

      expect(result1).toBe('1.2.3')
      expect(result2).toBe('1.2.3')
      expect(result3).toBe('1.2.3')
      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
    })
  })
})
