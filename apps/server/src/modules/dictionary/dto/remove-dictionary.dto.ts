import { IsArray } from 'class-validator'

export class RemoveDictionaryDto {
  @IsArray()
  ids: number[]
}
