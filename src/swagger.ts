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
  SwaggerModule.setup('docs', app, swaggerFactory, {
    customfavIcon: 'https://avatars.githubusercontent.com/u/7658037?s=48&v=4',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.28.1/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.28.1/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.28.1/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.28.1/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.28.1/swagger-ui.css',
    ],
  })
}
