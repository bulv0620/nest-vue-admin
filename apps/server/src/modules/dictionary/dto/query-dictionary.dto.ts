import { Type } from 'class-transformer'
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

class DictionaryDetail {
  @IsString()
  @IsOptional()
  dictionaryCode: string

  @IsString()
  @IsOptional()
  dictionaryLabel: string
}

export class QueryDictionaryDto {
  @IsObject()
  @ValidateNested()
  @Type(() => DictionaryDetail)
  queryDetail: DictionaryDetail

  @IsNumber()
  pageSize: number

  @IsNumber()
  pageNum: number
}
