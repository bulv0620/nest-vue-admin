import { Controller, Post, Body } from '@nestjs/common'
import { ExampleService } from './example.service'
import { CreateExampleDto } from './dto/create-example.dto'
import { UpdateExampleDto } from './dto/update-example.dto'
import { QueryExampleDto } from './dto/query-example.dto'
import { RemoveExampleDto } from './dto/remove-example.dto'
import { FindExampleDto } from './dto/find-example.dto'

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post('create')
  create(@Body() createExampleDto: CreateExampleDto) {
    return this.exampleService.create(createExampleDto)
  }

  @Post('list')
  findAll(@Body() queryExampleDto: QueryExampleDto) {
    return this.exampleService.findAll(queryExampleDto)
  }

  @Post('findOne')
  findOne(@Body() findExampleDto: FindExampleDto) {
    return this.exampleService.findOne(findExampleDto)
  }

  @Post('update')
  update(@Body() updateExampleDto: UpdateExampleDto) {
    return this.exampleService.update(updateExampleDto)
  }

  @Post('remove')
  remove(@Body() removeExampleDto: RemoveExampleDto) {
    return this.exampleService.remove(removeExampleDto)
  }
}
