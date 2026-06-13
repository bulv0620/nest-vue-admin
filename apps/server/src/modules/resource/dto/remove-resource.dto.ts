import { IsArray } from 'class-validator'

export class RemoveResourceDto {
  @IsArray()
  ids: number[]
}
