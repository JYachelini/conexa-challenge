import { mockUser } from '../../../user/__test__/__mocks__/user.mock'
import { mockLoginResponse } from './login.mock'

export const mockAuthService = {
  register: jest.fn().mockImplementation((_: string, __: string) => true),
  login: jest.fn().mockImplementation((username: string, __: string) => {
    const exists = username === mockUser.username
    if (exists) return mockLoginResponse
  }),
}
