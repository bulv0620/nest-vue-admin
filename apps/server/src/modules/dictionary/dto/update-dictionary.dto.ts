import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator'
import { Dictionary } from '../entities/dictionary.entity'

export class UpdateDictionaryDto {
  @IsNumber()
  @IsNotEmpty()
  id: number

  @IsString()
  @IsNotEmpty()
  dictionaryCode: string

  @IsString()
  @IsNotEmpty()
  dictionaryLabel: string

  @IsString()
  @IsNotEmpty()
  dictionaryValue: string

  @IsBoolean()
  @IsNotEmpty()
  disabled: boolean

  @IsArray()
  children: Dictionary[] // 关联的子资源
}
