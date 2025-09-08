import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Roles } from './decorator/roles.decorator'
import { Request } from 'express'
import { EnumRoles } from '../../enum/roles.enum'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler())
    if (!roles) return true
    console.log(roles)
    return this.userHasAccess(context, roles)
  }

  private userHasAccess(context: ExecutionContext, roles: EnumRoles[]): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const user = request.user

    return roles.some((role: EnumRoles) => role === user.role)
  }
}
