import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

export class CreateUserDto {
  @IsString()
  @Length(4, 20)
  username: string

  @IsString()
  @Length(6, 20)
  password: string

  @IsString()
  name: string

  @IsEmail()
  email: string

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  isAdmin: boolean
}
