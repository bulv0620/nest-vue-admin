import { IsString, Length } from 'class-validator'

export class UpdatePwdDto {
  @IsString()
  @Length(6, 20)
  oldPwd: string

  @IsString()
  @Length(6, 20)
  newPwd: string
}
