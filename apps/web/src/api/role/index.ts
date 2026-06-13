import { request } from '@/utils/service'
import { Role } from './types/role'
import { ResourceNode } from '../resource/types/resource'

export function reqGetRoleList() {
  return request<ApiResponseData<Role[]>>({
    url: '/role/list',
    method: 'get',
  })
}

export function reqQueryRoleList(data: PaginationRequestData<Role>) {
  return request<ApiResponseData<PaginationResponseData<Role>>>({
    url: '/role/list',
    method: 'post',
    data,
  })
}

export function reqRemoveRole(data: { ids: number[] }) {
  return request<ApiResponseData<{}>>({
    url: '/role/remove',
    method: 'post',
    data,
  })
}

export function reqCreateRole(data: Role) {
  return request<ApiResponseData<{}>>({
    url: '/role/create',
    method: 'post',
    data,
  })
}

export function reqUpdateRole(data: Role) {
  return request<ApiResponseData<{}>>({
    url: '/role/update',
    method: 'post',
    data,
  })
}

export function reqFindResources(data: Role) {
  return request<ApiResponseData<ResourceNode[]>>({
    url: '/role/findResources',
    method: 'post',
    data: data,
  })
}

export function reqBindResourcesToRole(data: {
  roleId: number
  resourceIds: number[]
}) {
  return request<ApiResponseData<any>>({
    url: '/role/bindResourcesToRole',
    method: 'post',
    data: data,
  })
}
