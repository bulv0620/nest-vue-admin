import { ResourceNode } from '@/api/resource/types/resource'
import { User } from '@/api/user/types/user'

export interface Role {
  id?: number
  roleName?: string
  description?: string
  isDefault?: boolean
  createTime?: Date
  updateTime?: Date
  users?: User[]
  resources?: ResourceNode[]
}
