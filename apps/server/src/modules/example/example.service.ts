import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateExampleDto } from './dto/create-example.dto'
import { UpdateExampleDto } from './dto/update-example.dto'
import { Repository } from 'typeorm'
import { Example } from './entities/example.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryExampleDto } from './dto/query-example.dto'
import { RemoveExampleDto } from './dto/remove-example.dto'
import { FindExampleDto } from './dto/find-example.dto'

@Injectable()
export class ExampleService {
  constructor(
    @InjectRepository(Example)
    private readonly exampleRepository: Repository<Example>,
  ) {}

  create(createExampleDto: CreateExampleDto) {
    const instance = this.exampleRepository.create(createExampleDto)

    return this.exampleRepository.save(instance)
  }

  async findAll(queryExampleDto: QueryExampleDto) {
    const { exampleCode, exampleName, exampleDesc } =
      queryExampleDto.queryDetail
    const skip = (queryExampleDto.pageNum - 1) * queryExampleDto.pageSize

    const queryBuilder = this.exampleRepository.createQueryBuilder('example')

    if (exampleCode) {
      queryBuilder.andWhere('example.exampleCode like :exampleCode', {
        exampleCode: `%${exampleCode}%`,
      })
    }

    if (exampleName) {
      queryBuilder.andWhere('example.exampleName like :exampleName', {
        exampleName: `%${exampleName}%`,
      })
    }

    if (exampleDesc) {
      queryBuilder.andWhere('example.exampleDesc like :exampleDesc', {
        exampleDesc: `%${exampleDesc}%`,
      })
    }

    const [examples, totalCount] = await queryBuilder
      .skip(skip)
      .take(queryExampleDto.pageSize)
      .orderBy('createTime', 'DESC')
      .getManyAndCount()

    return {
      list: examples,
      total: totalCount,
      pageSize: queryExampleDto.pageSize,
      pageNum: queryExampleDto.pageNum,
    }
  }

  async findOne(findExampleDto: FindExampleDto) {
    return await this.exampleRepository.findOne({
      where: {
        id: findExampleDto.id,
      },
    })
  }

  async update(updateExampleDto: UpdateExampleDto) {
    const existExample = await this.exampleRepository.findOne({
      where: { id: updateExampleDto.id },
    })

    if (!existExample) {
      throw new BadRequestException('数据不存在')
    }

    existExample.exampleCode = updateExampleDto.exampleCode
    existExample.exampleName = updateExampleDto.exampleName
    existExample.exampleDesc = updateExampleDto.exampleDesc

    await this.exampleRepository.save(existExample)

    return
  }

  async remove(removeExampleDto: RemoveExampleDto) {
    const { ids } = removeExampleDto

    // 使用批量删除
    const deleteResult = await this.exampleRepository
      .createQueryBuilder()
      .delete()
      .from(Example)
      .whereInIds(ids)
      .execute()

    // 检查删除结果
    if (deleteResult.affected !== ids.length) {
      throw new BadRequestException('一个或多个数据不存在')
    }
  }
}
