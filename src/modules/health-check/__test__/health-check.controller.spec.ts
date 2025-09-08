import { Test, TestingModule } from '@nestjs/testing'
import { HealthCheckController } from '../health-check.controller'
import { HealthCheckService } from '../health-check.service'
import { mockHealthCheckService } from './__mocks__/health-check.service.mock'

describe('HealthCheckController', () => {
  let healthCheckController: HealthCheckController
  let healthCheckService: jest.Mocked<HealthCheckService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
      ],
    }).compile()
    healthCheckController = module.get<HealthCheckController>(HealthCheckController)
    healthCheckService = module.get(HealthCheckService)
    jest.clearAllMocks()
  })

  describe('getVersion', () => {
    it('should return the application version', async () => {
      const mockVersion = '1.0.0'
      healthCheckService.getVersion.mockReturnValue(mockVersion)

      const result = await healthCheckController.getVersion()

      expect(result).toBe(mockVersion)
      expect(healthCheckService.getVersion).toHaveBeenCalledTimes(1)
    })

    it('should return different versions correctly', async () => {
      const version1 = '1.2.3'
      const version2 = '2.0.0'

      healthCheckService.getVersion.mockReturnValueOnce(version1)
      const result1 = await healthCheckController.getVersion()

      healthCheckService.getVersion.mockReturnValueOnce(version2)
      const result2 = await healthCheckController.getVersion()

      expect(result1).toBe(version1)
      expect(result2).toBe(version2)
      expect(healthCheckService.getVersion).toHaveBeenCalledTimes(2)
    })

    it('should handle empty version string', async () => {
      const emptyVersion = ''
      healthCheckService.getVersion.mockReturnValue(emptyVersion)

      const result = await healthCheckController.getVersion()

      expect(result).toBe(emptyVersion)
      expect(healthCheckService.getVersion).toHaveBeenCalledTimes(1)
    })

    it('should handle undefined version', async () => {
      healthCheckService.getVersion.mockReturnValue(undefined as any)

      const result = await healthCheckController.getVersion()

      expect(result).toBeUndefined()
      expect(healthCheckService.getVersion).toHaveBeenCalledTimes(1)
    })

    it('should handle service throwing errors', async () => {
      const error = new Error('Configuration not loaded')
      healthCheckService.getVersion.mockImplementation(() => {
        throw error
      })

      expect(() => healthCheckController.getVersion()).toThrow('Configuration not loaded')
      expect(healthCheckService.getVersion).toHaveBeenCalledTimes(1)
    })

    it('should call service method without any parameters', async () => {
      const mockVersion = '3.1.4'
      healthCheckService.getVersion.mockReturnValue(mockVersion)

      await healthCheckController.getVersion()

      expect(healthCheckService.getVersion).toHaveBeenCalledWith()
    })

    it('should be called multiple times independently', async () => {
      const mockVersion = '1.5.0'
      healthCheckService.getVersion.mockReturnValue(mockVersion)

      const result1 = await healthCheckController.getVersion()
      const result2 = await healthCheckController.getVersion()
      const result3 = await healthCheckController.getVersion()

      expect(result1).toBe(mockVersion)
      expect(result2).toBe(mockVersion)
      expect(result3).toBe(mockVersion)
      expect(healthCheckService.getVersion).toHaveBeenCalledTimes(3)
    })
  })

  describe('controller behavior', () => {
    it('should maintain proper dependency injection', () => {
      expect(healthCheckController).toBeDefined()
      expect(healthCheckService).toBeDefined()
    })

    it('should have getVersion method available', () => {
      expect(typeof healthCheckController.getVersion).toBe('function')
    })
  })
})
