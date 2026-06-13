import { IsNotEmpty, IsString } from 'class-validator'

export class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  exampleCode: string

  @IsString()
  @IsNotEmpty()
  exampleName: string

  @IsString()
  exampleDesc: string
}
