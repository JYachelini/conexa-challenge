import * as express from 'express'
import { IJwtPayload } from '../../src/modules/auth/dto/jwt.dto'

declare global {
  namespace Express {
    interface Request {
      user: IJwtPayload
    }
  }
}
