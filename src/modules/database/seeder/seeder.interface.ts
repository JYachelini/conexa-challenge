import { DataSource } from 'typeorm'

export interface ISeeder {
  run: (dataSource: DataSource) => Promise<void>
}
