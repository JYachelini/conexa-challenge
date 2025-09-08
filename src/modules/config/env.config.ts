import { registerAs } from '@nestjs/config'

export const environments = registerAs('config', () => {
  return {
    NODE_ENV: process.env.NODE_ENV!,
    APP_VERSION: process.env.APP_VERSION!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    DB_PORT: process.env.DB_PORT,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    STARWARS_API_URL: process.env.STARWARS_API_URL!,
  }
})
