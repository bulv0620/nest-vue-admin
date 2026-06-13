import { Controller, Post, Body } from '@nestjs/common'
import { ResourceService } from './resource.service'
import { CreateResourceDto } from './dto/create-resource.dto'
import { UpdateResourceDto } from './dto/update-resource.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { RemoveResourceDto } from './dto/remove-resource.dto'
import { QueryResourceDto } from './dto/query-resource.dto'
import { Admin } from 'src/decorators/admin.decorator'

@ApiTags('资源')
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @ApiOperation({ summary: '创建资源' })
  @Post('create')
  @Admin()
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourceService.create(createResourceDto)
  }

  @ApiOperation({ summary: '查询资源' })
  @Post('list')
  @Admin()
  findAll(@Body() queryResourceDto: QueryResourceDto) {
    return this.resourceService.findAll(queryResourceDto)
  }

  @ApiOperation({ summary: '更新资源' })
  @Post('update')
  @Admin()
  update(@Body() updateResourceDto: UpdateResourceDto) {
    return this.resourceService.update(updateResourceDto)
  }

  @ApiOperation({ summary: '删除资源' })
  @Post('remove')
  @Admin()
  remove(@Body() removeResourceDto: RemoveResourceDto) {
    return this.resourceService.remove(removeResourceDto)
  }
}
