import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'

export const CurrentToken = createParamDecorator((_: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest()
  const authHeader = request.headers.authorization
  if (!authHeader) {
    throw new UnauthorizedException('Authorization header not found')
  }
  const token = authHeader.replace('Bearer ', '')

  if (!token) {
    throw new UnauthorizedException('Token not found')
  }

  return token
})
