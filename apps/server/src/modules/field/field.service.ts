import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateFieldDto } from './dto/create-field.dto'
import { UpdateFieldDto } from './dto/update-field.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Field } from './entities/field.entity'
import { Repository } from 'typeorm'

@Injectable()
export class FieldService {
  constructor(
    @InjectRepository(Field)
    private readonly fieldRepository: Repository<Field>,
  ) {}

  async create(createFieldDto: CreateFieldDto) {
    const fieldCode = createFieldDto.fieldList[0].fieldCode
    const exsitResource = await this.fieldRepository.findOne({
      where: {
        fieldCode,
      },
    })

    if (exsitResource) {
      throw new BadRequestException('资源已存在')
    }

    for (const field of createFieldDto.fieldList) {
      const fieldInstance = this.fieldRepository.create({
        ...field,
      })

      await this.fieldRepository.save(fieldInstance)
    }

    return
  }

  findAll() {
    return `This action returns all field`
  }

  async findOne(findFieldDto: UpdateFieldDto) {
    return await this.fieldRepository.find({
      where: {
        fieldCode: findFieldDto.fieldCode,
      },
    })
  }

  async update(updateFieldDto: UpdateFieldDto) {
    const fieldCode = updateFieldDto.fieldCode
    const exsitResource = await this.fieldRepository.findOne({
      where: {
        fieldCode,
      },
    })

    if (exsitResource) {
      await this.fieldRepository.delete({
        fieldCode,
      })
    }

    return this.create(updateFieldDto)
  }

  async remove(removeFieldDto: UpdateFieldDto) {
    const { fieldCode } = removeFieldDto

    await this.fieldRepository.delete({
      fieldCode,
    })

    return
  }
}
