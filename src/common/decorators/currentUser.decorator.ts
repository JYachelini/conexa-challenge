import { createParamDecorator, ExecutionContext, NotFoundException } from '@nestjs/common'
import { Request } from 'express'
import { JwtDto } from '../../modules/auth/dto/jwt.dto'

export const CurrentUser = createParamDecorator((data: string, context: ExecutionContext): JwtDto => {
  const { user } = context.switchToHttp().getRequest<Request>()
  if (!user) throw new NotFoundException('User not found')
  if (!data) return user
  /* eslint-disable-next-line */
  return user[data]
})
