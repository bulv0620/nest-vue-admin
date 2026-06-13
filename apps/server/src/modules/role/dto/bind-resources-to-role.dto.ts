import { IsArray, IsNumber } from 'class-validator'

export class BindResourcesToRoleDto {
  @IsNumber()
  roleId: number

  @IsArray()
  resourceIds: number[]
}
