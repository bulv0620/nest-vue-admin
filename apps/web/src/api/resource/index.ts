import { request } from '@/utils/service'
import type * as Resource from './types/resource'

/** 查 */
export function reqGetResourceList(data?: Resource.QueryResouceBody) {
  return request<ApiResponseData<Resource.ResourceNode[]>>({
    url: '/resource/list',
    method: 'post',
    data: data || {},
  })
}

/** 增 */
export function reqAddResource(data: Resource.AddResourceBody) {
  return request<ApiResponseData<any>>({
    url: '/resource/create',
    method: 'post',
    data: data,
  })
}

/** 更新 */
export function reqUpdateResource(data: Resource.AddResourceBody) {
  return request<ApiResponseData<any>>({
    url: '/resource/update',
    method: 'post',
    data: data,
  })
}

/** 删 */
export function reqRemoveResource(data: number[]) {
  return request<ApiResponseData<any>>({
    url: '/resource/remove',
    method: 'post',
    data: {
      ids: data,
    },
  })
}
