import { ICreateUser } from '../../interface/user.create'
import { mockUser } from './user.mock'

interface IFindWhere {
  username: string
  id: number
}

interface IFindSelect {
  username: boolean
  id: boolean
}

interface IFindOptions {
  where?: IFindWhere
  select?: IFindSelect
}

export const mockUserRepository = {
  createEntity: jest.fn().mockImplementation((user: ICreateUser) => {
    return { ...mockUser, ...user }
  }),
  findOne: jest.fn().mockImplementation((options: IFindOptions) => {
    const exists =
      (options.where && options.where.username === mockUser.username) ||
      (options.where && options.where.id === mockUser.id)

    if (!exists) {
      return null
    }

    if (!options.select) return mockUser

    const filteredUser: Partial<typeof mockUser> = {}
    Object.keys(options.select).forEach((key) => {
      if (options.select![key] && key in mockUser) {
        ;(filteredUser as any)[key] = (mockUser as any)[key]
      }
    })
    return filteredUser
  }),
  exists: jest.fn().mockImplementation((options: IFindOptions) => {
    const exists =
      (options.where && options.where.username === mockUser.username) ||
      (options.where && options.where.id === mockUser.id)

    if (!exists) {
      return false
    }
    return true
  }),
  update: jest.fn(),
}
