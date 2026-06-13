import { IsArray, IsNumber } from 'class-validator'

export class BindRolesToUserDto {
  @IsNumber()
  userId: number

  @IsArray()
  roleIds: number[]
}
