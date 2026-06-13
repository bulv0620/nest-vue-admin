import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class UpdateExampleDto {
  @IsNumber()
  @IsNotEmpty()
  id: number

  @IsString()
  @IsNotEmpty()
  exampleCode: string

  @IsString()
  @IsNotEmpty()
  exampleName: string

  @IsString()
  exampleDesc: string
}
