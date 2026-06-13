import { IsOptional, IsString } from 'class-validator'

export class QueryResourceDto {
  @IsString()
  @IsOptional()
  resourceName: string

  @IsString()
  @IsOptional()
  title: string

  @IsString()
  @IsOptional()
  path: string

  @IsString()
  @IsOptional()
  type: string
}
