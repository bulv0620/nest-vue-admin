import {
  Controller,
  Post,
  Body,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { Request } from '@nestjs/common'
import { UpdatePwdDto } from './dto/update-pwd.dto'
import { RemoveUserDto } from './dto/remove-user.dto'
import { QueryUserDto } from './dto/query-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { BindRolesToUserDto } from './dto/bind-roles-to-user.dto'
import { FindRolesDto } from './dto/find-roles.dto'
import { MessagePattern } from '@nestjs/microservices'
import { NoAuth } from 'src/decorators/no-auth.decorator'
import { Admin } from 'src/decorators/admin.decorator'

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '创建用户接口' })
  // @Admin()
  @NoAuth()
  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @ApiOperation({ summary: '更新密码接口' })
  @Post('updatePwd')
  updatePassword(@Body() updatePwdDto: UpdatePwdDto, @Request() req: any) {
    return this.userService.updatePassword(req.user, updatePwdDto)
  }

  @ApiOperation({ summary: '获取用户列表接口' })
  @Admin()
  @Post('list')
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(@Body() queryUserDto: QueryUserDto) {
    return this.userService.findAll(queryUserDto)
  }

  @ApiOperation({ summary: '更新用户信息接口' })
  @Post('update')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto)
  }

  @ApiOperation({ summary: '删除用户接口' })
  @Admin()
  @Post('remove')
  remove(@Body() removeUserDto: RemoveUserDto) {
    return this.userService.remove(removeUserDto)
  }

  @ApiOperation({ summary: '用户绑定多角色' })
  @Admin()
  @Post('bindRolesToUser')
  bindRolesToUser(@Body() dto: BindRolesToUserDto) {
    return this.userService.bindRolesToUser(dto)
  }

  @ApiOperation({ summary: '获取用户绑定的角色' })
  @Admin()
  @Post('findRoles')
  @UseInterceptors(ClassSerializerInterceptor)
  findRolesByUser(@Body() dto: FindRolesDto) {
    return this.userService.getUserDetail(dto.id)
  }

  @MessagePattern('getHello')
  getHello(name: string): string {
    return 'hello ' + name
  }
}
