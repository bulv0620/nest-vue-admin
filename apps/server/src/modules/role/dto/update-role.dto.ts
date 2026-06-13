import { Type } from 'class-transformer'
import { IsBoolean, IsNumber, IsString } from 'class-validator'

export class UpdateRoleDto {
  @IsNumber()
  id: number

  @IsString()
  roleName: string

  @IsString()
  description: string

  @Type(() => Boolean)
  @IsBoolean()
  isDefault: boolean
}
