import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ResourceType } from '@nest-vue-admin/shared'
import { Resource } from '../entities/resource.entity'

export class CreateResourceDto {
  @IsOptional()
  @IsString()
  resourceName: string

  @IsString()
  @IsNotEmpty()
  title: string

  @IsOptional()
  @IsString()
  path: string

  @IsOptional()
  @IsString()
  component: string

  @IsOptional()
  @IsString()
  icon: string

  @IsString()
  @IsNotEmpty()
  type: ResourceType

  @IsOptional()
  @IsObject()
  parent: Resource

  @Type(() => Number)
  @IsNumber()
  order: number
}
