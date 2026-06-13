import { ResourceNode } from '@/api/resource/types/resource'

export interface LoginRequestData {
  /** admin 或 editor */
  username: string
  /** 密码 */
  password: string
  /** 验证码 */
  code: string
}

export interface UserInfo {
  // 用户名
  username: string
  // 资源
  resources: ResourceNode[]
  // 邮箱
  email: string
  // 是否超级管理员
  isAdmin: boolean
  // 昵称
  name: string
}

export type LoginCodeResponseData = ApiResponseData<string>
export type LoginResponseData = ApiResponseData<{
  accessToken: string
  refreshToken: string
}>
export type UserInfoResponseData = ApiResponseData<UserInfo>
