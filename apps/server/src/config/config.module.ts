import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`],
      validationSchema: Joi.object({
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().default(3306),
        MYSQL_USERNAME: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DATABASE: Joi.string().required(),

        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_DB: Joi.number().required(),
        REDIS_PASSPORT: Joi.string().required(),

        JWT_SECRET_KEY: Joi.string().required(),
        JWT_ACCESS_TOKEN_TTL: Joi.string().default('1h'),
        JWT_REFRESH_TOKEN_TTL: Joi.string().default('1h'),

        RBAC_APP_PORT: Joi.number().default(3000),
      }),
    }),
  ],
})
export class CustomConfigModule {}
