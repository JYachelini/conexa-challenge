import { NestFactory } from '@nestjs/core'
import { AppModule } from './modules/app/app.module'
import { initSwagger } from './swagger'
import { ValidationPipe } from '@nestjs/common'
import { AllExceptionsFilter } from './common/exceptions/exception.handler'
import { GlobalInterceptor } from './common/interceptor/response.interceptor'
import { seeder } from './seed'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  seeder(app)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: 422,
    }),
  )

  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new GlobalInterceptor())

  initSwagger(app)
  await app.listen(process.env.PORT!)
}
bootstrap()
