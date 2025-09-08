import { mockUser } from '../../../user/__test__/__mocks__/user.mock'
import { LoginDto } from '../../dto/login.dto'
import { ILoginResponse } from '../../interfaces/responses/login.interface'

export const mockLoginResponse: ILoginResponse = {
  access_token: 'mock_access_token',
  refresh_token: 'mock_refresh_token',
}

export const mockLoginDto: LoginDto = {
  username: mockUser.username,
  password: 'password',
}
