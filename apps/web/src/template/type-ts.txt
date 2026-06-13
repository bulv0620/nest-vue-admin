import { ResourceNode } from '@/api/resource/types/resource'
import { Role } from '@/api/role/types/role'

export interface User {
  id?: number
  username?: string
  password?: string
  name?: string
  email?: string
  isAdmin?: boolean
  createTime?: Date
  updateTime?: Date
  resources?: ResourceNode[]
  roles?: Role[]
}
