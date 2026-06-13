import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator'
import { Dictionary } from '../entities/dictionary.entity'

export class CreateDictionaryDto {
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
