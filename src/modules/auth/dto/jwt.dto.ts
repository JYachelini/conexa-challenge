import { EnumRoles } from '../enum/roles.enum'

export interface IJwtPayload {
  id: number
  role?: EnumRoles
}
