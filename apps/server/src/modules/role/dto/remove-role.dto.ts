import { IsArray } from 'class-validator'

export class RemoveRoleDto {
  @IsArray()
  ids: number[]
}
