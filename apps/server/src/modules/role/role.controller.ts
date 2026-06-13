import { Controller, Post, Body, Get } from '@nestjs/common'
import { RoleService } from './role.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { QueryRoleDto } from './dto/query-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { RemoveRoleDto } from './dto/remove-role.dto'
import { BindUsersToRoleDto } from './dto/bind-users-to-role.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { BindResourcesToRoleDto } from './dto/bind-resources-to-role.dto'
import { FindResourcesDto } from './dto/find-resources.dto'
import { Admin } from 'src/decorators/admin.decorator'

@ApiTags('角色')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: '创建角色' })
  @Admin()
  @Post('create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto)
  }

  @ApiOperation({ summary: '获取角色列表' })
  @Admin()
  @Post('list')
  query(@Body() queryRoleDto: QueryRoleDto) {
    return this.roleService.query(queryRoleDto)
  }

  @ApiOperation({ summary: '获取角色列表' })
  @Admin()
  @Get('list')
  findAll() {
    return this.roleService.findAll()
  }

  @ApiOperation({ summary: '更新角色信息' })
  @Admin()
  @Post('update')
  update(@Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(updateRoleDto)
  }

  @ApiOperation({ summary: '删除角色' })
  @Admin()
  @Post('remove')
  remove(@Body() removeRoleDto: RemoveRoleDto) {
    return this.roleService.remove(removeRoleDto)
  }

  @ApiOperation({ summary: '角色绑定多用户' })
  @Admin()
  @Post('bindUsersToRole')
  bindUsersToRole(@Body() dto: BindUsersToRoleDto) {
    return this.roleService.bindUsersToRole(dto)
  }

  @ApiOperation({ summary: '角色绑定多资源' })
  @Admin()
  @Post('bindResourcesToRole')
  bindResourcesToRole(@Body() dto: BindResourcesToRoleDto) {
    return this.roleService.bindResourcesToRole(dto)
  }

  @ApiOperation({ summary: '获取角色的资源' })
  @Admin()
  @Post('findResources')
  findResources(@Body() dto: FindResourcesDto) {
    return this.roleService.findResources(dto.id)
  }
}
