import { Module } from '@nestjs/common'
import { ResourceService } from './resource.service'
import { ResourceController } from './resource.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Resource } from './entities/resource.entity'
import { User } from '../user/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Resource, User])],
  controllers: [ResourceController],
  providers: [ResourceService],
})
export class ResourceModule {}
