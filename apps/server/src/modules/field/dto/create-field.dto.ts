import { ArrayMinSize, IsArray, IsNotEmpty } from 'class-validator'
import { Field } from '../entities/field.entity'

export class CreateFieldDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  fieldList: Field[]
}
