import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const initSwagger = (app: INestApplication) => {
  const version = process.env.APP_VERSION || '0.0.1'
  const config = new DocumentBuilder()
    .setTitle('Conexa StarWars API')
    .setDescription('Documentación swagger para el challenge Conexa.')
    .setVersion(version)
    .build()

  const swaggerFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, swaggerFactory)
}
