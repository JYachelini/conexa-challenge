import { EnumRoles } from '../../auth/enum/roles.enum'
import { IBaseEntity } from '../../database/interface/base.interface'

export interface IUser extends IBaseEntity {
  username: string
  password: string
  role: EnumRoles
  refresh_token_hash: string | null
}
