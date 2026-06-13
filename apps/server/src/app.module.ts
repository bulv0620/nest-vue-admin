import { Module } from '@nestjs/common'
import { AuthTokenGuard } from './guards/access-token.guard'
import { APP_GUARD } from '@nestjs/core'
import { ResourceGuard } from './guards/resource.guard'
import { MysqlModule } from './database/mysql.module'
import { RedisModule } from './database/redis.module'
import { UserModule } from './modules/user/user.module'
import { RoleModule } from './modules/role/role.module'
import { ResourceModule } from './modules/resource/resource.module'
import { DictionaryModule } from './modules/dictionary/dictionary.module'
import { FieldModule } from './modules/field/field.module'
import { AuthModule } from './modules/auth/auth.module'
import { ExampleModule } from './modules/example/example.module'

@Module({
  imports: [
    MysqlModule,
    RedisModule,
    UserModule,
    RoleModule,
    ResourceModule,
    DictionaryModule,
    FieldModule,
    AuthModule,
    ExampleModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
  ],
})
export class AppModule {}
