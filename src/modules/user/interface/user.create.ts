import { IUser } from './user.interface'

export interface ICreateUser extends Pick<IUser, 'username' | 'password' | 'role'> {}
