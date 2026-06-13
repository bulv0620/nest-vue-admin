import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Dictionary } from './entities/dictionary.entity'
import { Repository } from 'typeorm'
import { CreateDictionaryDto } from './dto/create-dictionary.dto'
import { QueryDictionaryDto } from './dto/query-dictionary.dto'
import { FindDictionaryDto } from './dto/find-dictionary.dto'
import { RemoveDictionaryDto } from './dto/remove-dictionary.dto'
import { UpdateDictionaryDto } from './dto/update-dictionary.dto'

@Injectable()
export class DictionaryService {
  constructor(
    @InjectRepository(Dictionary)
    private readonly dictionaryRepository: Repository<Dictionary>,
  ) {}

  async create(createDictionaryDto: CreateDictionaryDto) {
    const exsitResource = await this.dictionaryRepository.findOne({
      where: {
        dictionaryCode: createDictionaryDto.dictionaryCode,
      },
    })

    if (exsitResource) {
      throw new BadRequestException('资源已存在')
    }

    const resourceInstance = this.dictionaryRepository.create({
      ...createDictionaryDto,
    })

    const savedDict = await this.dictionaryRepository.save(resourceInstance)

    for (const child of createDictionaryDto.children) {
      child.parent = savedDict

      const childInstance = this.dictionaryRepository.create(child)

      await this.dictionaryRepository.save(childInstance)
    }

    return
  }

  async findAll(queryDictionaryDto: QueryDictionaryDto) {
    const { dictionaryCode, dictionaryLabel } = queryDictionaryDto.queryDetail
    const skip = (queryDictionaryDto.pageNum - 1) * queryDictionaryDto.pageSize

    const queryBuilder =
      this.dictionaryRepository.createQueryBuilder('dictionary')

    if (dictionaryCode) {
      queryBuilder.andWhere('dictionary.dictionaryCode LIKE :dictionaryCode', {
        dictionaryCode: `%${dictionaryCode}%`,
      })
    }

    if (dictionaryLabel) {
      queryBuilder.andWhere(
        'dictionary.dictionaryLabel LIKE :dictionaryLabel',
        {
          dictionaryLabel: `%${dictionaryLabel}%`,
        },
      )
    }

    queryBuilder.andWhere('dictionary.parentId IS NULL')

    const [users, totalCount] = await queryBuilder
      .skip(skip)
      .take(queryDictionaryDto.pageSize)
      .orderBy('createTime', 'DESC')
      .getManyAndCount()

    return {
      list: users,
      total: totalCount,
      pageSize: queryDictionaryDto.pageSize,
      pageNum: queryDictionaryDto.pageNum,
    }
  }

  async findOne(findDictionaryDto: FindDictionaryDto) {
    return await this.dictionaryRepository.findOne({
      where: {
        dictionaryCode: findDictionaryDto.dictionaryCode,
      },
      relations: ['children'],
    })
  }

  async update(updateDictionaryDto: UpdateDictionaryDto) {
    const existDict = await this.dictionaryRepository.findOne({
      where: { id: updateDictionaryDto.id },
    })

    if (!existDict) {
      throw new BadRequestException('字典不存在')
    }

    existDict.dictionaryCode = updateDictionaryDto.dictionaryCode
    existDict.dictionaryLabel = updateDictionaryDto.dictionaryLabel
    existDict.dictionaryValue = updateDictionaryDto.dictionaryValue
    existDict.disabled = updateDictionaryDto.disabled

    await this.dictionaryRepository.save(existDict)

    await this.dictionaryRepository.delete({
      parent: existDict,
    })

    for (const child of updateDictionaryDto.children) {
      child.parent = existDict

      const childInstance = this.dictionaryRepository.create(child)

      await this.dictionaryRepository.save(childInstance)
    }

    return
  }

  async remove(removeDictionaryDto: RemoveDictionaryDto) {
    const { ids } = removeDictionaryDto

    // 使用批量删除
    const deleteResult = await this.dictionaryRepository
      .createQueryBuilder()
      .delete()
      .from(Dictionary)
      .whereInIds(ids)
      .execute()

    // 检查删除结果
    if (deleteResult.affected !== ids.length) {
      throw new BadRequestException('一个或多个资源不存在')
    }
  }
}
