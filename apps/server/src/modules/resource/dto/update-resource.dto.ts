import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'
import { Type } from 'class-transformer'
import { Resource } from '../entities/resource.entity'

export class UpdateResourceDto {
  @IsNumber()
  @IsNotEmpty()
  id: number

  @IsString()
  @IsOptional()
  resourceName: string

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsOptional()
  path: string

  @IsString()
  @IsOptional()
  component: string

  @IsString()
  @IsOptional()
  icon: string

  @IsObject()
  @IsOptional()
  parent: Resource

  @Type(() => Number)
  @IsNumber()
  order: number
}
