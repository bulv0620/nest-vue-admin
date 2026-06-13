import { IsArray } from 'class-validator'

export class RemoveExampleDto {
  @IsArray()
  ids: number[]
}
