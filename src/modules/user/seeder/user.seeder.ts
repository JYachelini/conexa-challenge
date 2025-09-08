import { User } from '../entity/user.entity'
import { DataSource } from 'typeorm'
import { ICreateUser } from '../interface/user.create'
import { EnumRoles } from '../../auth/enum/roles.enum'
import { ISeeder } from '../../database/seeder/seeder.interface'
import { hash } from 'argon2'

export class UserSeeder implements ISeeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(User)
    const password = await hash('admin123')
    const data: ICreateUser = {
      username: 'admin',
      password,
      role: EnumRoles.ADMIN,
    }

    const user = await repository.findOne({ where: { username: data.username } })
    if (!user) {
      await repository.insert([data])
    }

    return
  }
}
