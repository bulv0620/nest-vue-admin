import { Type } from 'class-transformer'
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

export class ExampleDetail {
  @IsString()
  @IsOptional()
  exampleCode: string

  @IsString()
  @IsOptional()
  exampleName: string

  @IsString()
  @IsOptional()
  exampleDesc: string
}

export class QueryExampleDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ExampleDetail)
  queryDetail: ExampleDetail

  @IsNumber()
  pageSize: number

  @IsNumber()
  pageNum: number
}
