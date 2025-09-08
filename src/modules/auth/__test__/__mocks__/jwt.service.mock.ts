import { IJwtPayload } from '../../dto/jwt.dto'
import { EnumJwtType } from '../../enum/jwt.enum'
import { mockJwtToken } from './jwt.mock'

export const mockJwtService = {
  signToken: jest.fn().mockImplementation((_: IJwtPayload, type: EnumJwtType) => {
    return type === EnumJwtType.ACCESS ? mockJwtToken.access_token : mockJwtToken.refresh_token
  }),
  verify: jest.fn(),
}
