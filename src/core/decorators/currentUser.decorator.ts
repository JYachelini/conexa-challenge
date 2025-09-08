import { createParamDecorator, ExecutionContext, NotFoundException } from '@nestjs/common'
import { Request } from 'express'
import { IJwtPayload } from '../../modules/auth/dto/jwt.dto'

export const CurrentUser = createParamDecorator((data: string | undefined, context: ExecutionContext): IJwtPayload => {
  const { user } = context.switchToHttp().getRequest<Request>()
  if (!user) throw new NotFoundException('User not found')
  if (!data) return user
  /* eslint-disable-next-line */
  return user[data]
})
