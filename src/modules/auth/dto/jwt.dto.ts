import { EnumRoles } from '../enum/roles.enum'

export interface IJwtPayload {
  user_id: number
  role?: EnumRoles
}
