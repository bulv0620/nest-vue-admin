import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CacheModule } from '@nestjs/cache-manager'
import * as redisStore from 'cache-manager-redis-store'
import { CustomConfigModule } from '../config/config.module'

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [CustomConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: +configService.get('REDIS_PORT'),
        db: +configService.get('REDIS_DB'),
        auth_pass: configService.get('REDIS_PASSPORT'),
      }),
    }),
  ],
})
export class RedisModule {}
