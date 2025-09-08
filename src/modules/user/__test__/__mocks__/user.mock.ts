import { mockJwtToken } from '../../../auth/__test__/__mocks__/jwt.mock'
import { EnumRoles } from '../../../auth/enum/roles.enum'
import { ICreateUser } from '../../interface/user.create'
import { IUser } from '../../interface/user.interface'

export const mockUser: IUser = {
  id: 1,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
  username: 'testuser',
  password: 'hashed_password',
  role: EnumRoles.USER,
  refresh_token_hash: `hashed_${mockJwtToken.refresh_token}`,
}

export const mockCreateUser: ICreateUser = {
  username: 'testuser',
  password: 'hashed_password',
  role: EnumRoles.USER,
}
