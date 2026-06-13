import { SetMetadata } from '@nestjs/common'

export const Everyone = () => SetMetadata('everyone', true)
