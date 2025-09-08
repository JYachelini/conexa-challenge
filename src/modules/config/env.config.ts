import { registerAs } from '@nestjs/config'

export const environments = registerAs('config', () => {
  return {
    NODE_ENV: process.env.NODE_ENV!,
    APP_VERSION: process.env.APP_VERSION!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  }
})
