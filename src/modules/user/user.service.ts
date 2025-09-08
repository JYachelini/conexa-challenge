import { Injectable } from '@nestjs/common'
import { ICreateUser } from './interface/user.create'
import { IUser } from './interface/user.interface'
import { UserRepository } from './user.repository'
import { FindOptionsSelect } from 'typeorm'
import { UserExistsException } from './exceptions/user.exceptions'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async create(user: ICreateUser): Promise<IUser> {
    return this.userRepository.createEntity(user)
  }

  public async findByUsername(username: string, select?: FindOptionsSelect<IUser>): Promise<IUser | null> {
    return await this.userRepository.findOne({ where: { username }, select })
  }

  public async checkIfUsernameExists(username: string): Promise<void> {
    const user = await this.userRepository.exists({ where: { username } })
    if (user) throw new UserExistsException()
    return
  }

  public async updateRefreshToken(id: number, refresh_token_hash: string): Promise<void> {
    await this.userRepository.update({ id }, { refresh_token_hash })
  }

  public async findById(id: number, select?: FindOptionsSelect<IUser>): Promise<IUser | null> {
    return await this.userRepository.findOne({ where: { id }, select })
  }
}
