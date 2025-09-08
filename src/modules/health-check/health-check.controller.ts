import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { HealthCheckService } from './health-check.service'

@Controller('')
@ApiTags('Health Check')
export class HealthCheckController {
  constructor(private readonly healtCheckService: HealthCheckService) {}
  @Get('health')
  @HttpCode(HttpStatus.NO_CONTENT)
  healthCheck(): void {
    return
  }

  @Get('version')
  @HttpCode(HttpStatus.OK)
  getVersion(): string {
    return this.healtCheckService.getVersion()
  }
}
