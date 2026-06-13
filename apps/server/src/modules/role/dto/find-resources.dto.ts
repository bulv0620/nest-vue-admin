import { IsNumber } from 'class-validator'

export class FindResourcesDto {
  @IsNumber()
  id: number
}
