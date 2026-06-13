import { Type } from 'class-transformer'
import { IsBoolean, IsString } from 'class-validator'

export class CreateRoleDto {
  @IsString()
  roleName: string

  @IsString()
  description: string

  @Type(() => Boolean)
  @IsBoolean()
  isDefault: boolean
}
