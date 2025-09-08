import { ICreateUser } from '../../interface/user.create'
import { mockUser } from './user.mock'

export const mockUserService = {
  findByUsername: jest.fn().mockImplementation((username: string) => {
    const existst = mockUser.username === username
    if (!existst) return null
    return mockUser
  }),
  findById: jest.fn().mockImplementation((id: number) => {
    const exists = mockUser.id === id
    if (!exists) return null
    return mockUser
  }),
  updateRefreshToken: jest.fn().mockImplementation((id: number, _: string) => {
    const exists = mockUser.id === id
    if (!exists) return false
    return true
  }),
  create: jest.fn().mockImplementation((user: ICreateUser) => {
    return { ...mockUser, ...user }
  }),
  checkIfUsernameExists: jest.fn().mockImplementation((username: string) => username === mockUser.username),
}
