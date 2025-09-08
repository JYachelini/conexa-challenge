import { Module } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { environments } from '../config/env.config'
import { SeederService } from './seeder/seeder.service'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [environments.KEY],
      useFactory: (configService: ConfigType<typeof environments>) => {
        return {
          type: 'postgres',
          host: configService.DB_HOST,
          port: Number(configService.DB_PORT),
          username: configService.DB_USER,
          database: configService.DB_NAME,
          password: configService.DB_PASSWORD,
          autoLoadEntities: true,
          synchronize: true,
        }
      },
    }),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}
