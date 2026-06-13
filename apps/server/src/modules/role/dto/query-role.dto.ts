import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

class RoleDetail {
  @IsString()
  @IsOptional()
  roleName: string

  @IsString()
  @IsOptional()
  description: string

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isDefault: boolean
}

export class QueryRoleDto {
  @IsObject()
  @ValidateNested()
  @Type(() => RoleDetail)
  queryDetail: RoleDetail

  @IsNumber()
  pageSize: number

  @IsNumber()
  pageNum: number
}
