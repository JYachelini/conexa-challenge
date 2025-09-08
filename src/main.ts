import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './modules/app/app.module'
import { initSwagger } from './swagger'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { AllExceptionsFilter } from './core/exceptions/exception.handler'
import { GlobalInterceptor } from './core/interceptor/response.interceptor'
import { seeder } from './seed'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  seeder(app)

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  )
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
