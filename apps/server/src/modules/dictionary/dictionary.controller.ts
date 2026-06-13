import { Body, Controller, Post } from '@nestjs/common'
import { DictionaryService } from './dictionary.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateDictionaryDto } from './dto/create-dictionary.dto'
import { QueryDictionaryDto } from './dto/query-dictionary.dto'
import { FindDictionaryDto } from './dto/find-dictionary.dto'
import { RemoveDictionaryDto } from './dto/remove-dictionary.dto'
import { UpdateDictionaryDto } from './dto/update-dictionary.dto'
import { ResourceName } from 'src/decorators/resource.decorator'
import { Admin } from 'src/decorators/admin.decorator'
import { NoAuth } from 'src/decorators/no-auth.decorator'

@ApiTags('字典')
@Controller('dictionary')
@ResourceName('DictionaryManage')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @ApiOperation({ summary: '创建字典' })
  @Post('create')
  @Admin()
  create(@Body() createDictionaryDto: CreateDictionaryDto) {
    return this.dictionaryService.create(createDictionaryDto)
  }

  @ApiOperation({ summary: '分页查询根字典' })
  @Post('list')
  @Admin()
  findAll(@Body() queryDictionaryDto: QueryDictionaryDto) {
    return this.dictionaryService.findAll(queryDictionaryDto)
  }

  @ApiOperation({ summary: '查询子字典' })
  @Post('findOne')
  @NoAuth()
  findOne(@Body() findDictionaryDto: FindDictionaryDto) {
    return this.dictionaryService.findOne(findDictionaryDto)
  }

  @ApiOperation({ summary: '更新字典' })
  @Post('update')
  @Admin()
  update(@Body() updateDictionaryDto: UpdateDictionaryDto) {
    this.dictionaryService.update(updateDictionaryDto)
  }

  @ApiOperation({ summary: '删除字典' })
  @Post('remove')
  @Admin()
  remove(@Body() removeDictionaryDto: RemoveDictionaryDto) {
    return this.dictionaryService.remove(removeDictionaryDto)
  }
}
