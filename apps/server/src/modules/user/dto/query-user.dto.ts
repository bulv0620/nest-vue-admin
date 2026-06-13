import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

class UserDetail {
  @IsString()
  @IsOptional()
  username: string

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isAdmin: boolean

  @IsString()
  @IsOptional()
  name: string

  @IsString()
  @IsOptional()
  email: string
}

export class QueryUserDto {
  @IsObject()
  @ValidateNested()
  @Type(() => UserDetail)
  queryDetail: UserDetail

  @IsNumber()
  pageSize: number

  @IsNumber()
  pageNum: number
}
