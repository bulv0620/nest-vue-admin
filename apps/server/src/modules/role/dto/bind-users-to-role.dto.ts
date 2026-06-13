import { IsArray, IsNumber } from 'class-validator'

export class BindUsersToRoleDto {
  @IsNumber()
  roleId: number

  @IsArray()
  userIds: number[]
}
