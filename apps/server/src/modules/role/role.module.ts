import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleController } from './role.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserService } from '../user/user.service'
import { Role } from './entities/role.entity'
import { User } from '../user/entities/user.entity'
import { Resource } from '../resource/entities/resource.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Role, User, Resource])],
  controllers: [RoleController],
  providers: [RoleService, UserService],
})
export class RoleModule {}
