import * as express from 'express'
import { JwtDto } from '../../src/modules/auth/dto/jwt.dto'

declare global {
  namespace Express {
    interface Request {
      user: JwtDtoDto
    }
  }
}
