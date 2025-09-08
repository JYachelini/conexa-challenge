import { EntityManager } from 'typeorm'
import { User } from './entity/user.entity'
import { Injectable } from '@nestjs/common'
import { BaseRepository } from '../database/repository/base.repository'
import { InjectEntityManager } from '@nestjs/typeorm'
import { ICreateUser } from './interface/user.create'
import { IUser } from './interface/user.interface'

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectEntityManager() manager: EntityManager) {
    super(User, manager)
  }

  public async createEntity(user: ICreateUser): Promise<IUser> {
    return await this.manager.transaction<User>(async (manager) => {
      const user_created = manager.create(User, user)
      return await manager.save(user_created)
    })
  }
}
