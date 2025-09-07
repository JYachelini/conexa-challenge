import { plainToClass } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsPositive, IsString, validateSync } from 'class-validator'

export class EnvironmentVariables {
  @IsPositive()
  @IsNumber()
  PORT: number

  @IsNotEmpty()
  @IsString()
  VERCEL_GIT_PULL_REQUEST_ID: string

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_SECRET: string
}

export const validate = (config: Record<string, unknown>): EnvironmentVariables => {
  const validatedConfig = plainToClass(EnvironmentVariables, config, { enableImplicitConversion: true })

  const errors = validateSync(validatedConfig, { skipMissingProperties: false })

  if (errors.length > 0) throw new Error(errors.toString())

  return validatedConfig
}
