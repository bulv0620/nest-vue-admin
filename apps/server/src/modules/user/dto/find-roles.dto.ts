import { IsNumber } from 'class-validator'

export class FindRolesDto {
  @IsNumber()
  id: number
}
