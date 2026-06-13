import { IsArray } from 'class-validator'

export class RemoveUserDto {
  @IsArray()
  ids: number[]
}
