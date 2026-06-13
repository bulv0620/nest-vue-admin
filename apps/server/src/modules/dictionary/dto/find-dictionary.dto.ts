import { IsNotEmpty, IsString } from 'class-validator'

export class FindDictionaryDto {
  @IsString()
  @IsNotEmpty()
  dictionaryCode: string
}
