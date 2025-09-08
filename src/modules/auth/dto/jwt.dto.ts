import { EnumRoles } from '../enum/roles.enum'

export class JwtDto {
  user_id: number
  role?: EnumRoles
}
