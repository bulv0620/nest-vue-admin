import { SetMetadata } from '@nestjs/common'

export const ResourceName = (resourceName: string) =>
  SetMetadata('resource-name', resourceName)
