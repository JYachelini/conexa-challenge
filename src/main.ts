import { NestFactory } from '@nestjs/core'
import { AppModule } from './modules/app.module'
import { initSwagger } from './swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  initSwagger(app)
  await app.listen(process.env.PORT!)
}
bootstrap()
