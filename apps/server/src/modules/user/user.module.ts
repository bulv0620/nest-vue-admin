import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RoleService } from '../role/role.service'
import { User } from './entities/user.entity'
import { Role } from '../role/entities/role.entity'
import { Resource } from '../resource/entities/resource.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Resource])],
  controllers: [UserController],
  providers: [UserService, RoleService],
  exports: [UserService],
})
export class UserModule {}
