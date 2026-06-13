import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { Field } from '../entities/field.entity'

export class UpdateFieldDto {
  @IsNumber()
  @IsNotEmpty()
  fieldCode: number

  @IsArray()
  @IsOptional()
  fieldList: Field[]
}
