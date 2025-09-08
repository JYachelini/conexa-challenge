import { INestApplication } from '@nestjs/common'
import { SeederService } from './modules/database/seeder/seeder.service'

export async function seeder(app: INestApplication): Promise<void> {
  const seederService = app.get(SeederService)
  await seederService.seed()
}
