import { IsNotEmpty, IsNumber } from 'class-validator'

export class FindExampleDto {
  @IsNumber()
  @IsNotEmpty()
  id: number
}
