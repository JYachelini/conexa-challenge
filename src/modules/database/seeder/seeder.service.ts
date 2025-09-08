import { InjectDataSource } from '@nestjs/typeorm'
import { UserSeeder } from '../../user/seeder/user.seeder'
import { DataSource } from 'typeorm'

export class SeederService {
  dataSource: DataSource
  constructor(@InjectDataSource() dataSource: DataSource) {
    this.dataSource = dataSource
  }
  public async seed(): Promise<void> {
    const seeders = [new UserSeeder()]
    await Promise.all(seeders.map((seed) => seed.run(this.dataSource)))
  }
}
