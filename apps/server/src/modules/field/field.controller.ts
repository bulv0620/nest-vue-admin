import { Controller, Post, Body } from '@nestjs/common'
import { FieldService } from './field.service'
import { CreateFieldDto } from './dto/create-field.dto'
import { UpdateFieldDto } from './dto/update-field.dto'
import { ApiOperation } from '@nestjs/swagger'
import { Admin } from 'src/decorators/admin.decorator'
import { NoAuth } from 'src/decorators/no-auth.decorator'

@Controller('field')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @ApiOperation({ summary: '创建字段配置' })
  @Post('create')
  @Admin()
  create(@Body() createFieldDto: CreateFieldDto) {
    return this.fieldService.create(createFieldDto)
  }

  @ApiOperation({ summary: '查询模块字段配置' })
  @Post('findOne')
  @NoAuth()
  findOne(@Body() findFieldDto: UpdateFieldDto) {
    return this.fieldService.findOne(findFieldDto)
  }

  @ApiOperation({ summary: '更新字段配置' })
  @Post('update')
  @Admin()
  update(@Body() updateFieldDto: UpdateFieldDto) {
    return this.fieldService.update(updateFieldDto)
  }

  @ApiOperation({ summary: '删除字段配置' })
  @Post('remove')
  @Admin()
  remove(@Body() removeFieldDto: UpdateFieldDto) {
    return this.fieldService.remove(removeFieldDto)
  }
}
