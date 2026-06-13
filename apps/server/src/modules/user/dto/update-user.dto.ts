import { Type } from 'class-transformer'
import { IsBoolean, IsEmail, IsNumber, IsString } from 'class-validator'

export class UpdateUserDto {
  @IsNumber()
  id: number

  @IsString()
  name: string

  @IsEmail()
  email: string

  @Type(() => Boolean)
  @IsBoolean()
  isAdmin: boolean
}
