import { applyDecorators, UseGuards } from '@nestjs/common'
import { JWtAccessGuard } from '../guards/jwt/jwt_access.guard'
import { RolesGuard } from '../guards/roles/roles.guard'
import { EnumRoles } from '../enum/roles.enum'
import { Roles } from '../guards/roles/decorator/roles.decorator'

export function Auth(role: EnumRoles[]): (target: object) => void {
  return applyDecorators(Roles(role), UseGuards(JWtAccessGuard, RolesGuard))
}
