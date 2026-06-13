import { request } from '@/utils/service'
import { Example } from './types/example'

export function reqGetExampleList(data: PaginationRequestData<Example>) {
  return request<ApiResponseData<PaginationResponseData<Example>>>({
    url: 'example/list',
    method: 'post',
    data,
  })
}

/** 获取字典详情 */
export function reqGetExampleInfo(id: number) {
  return request<ApiResponseData<Example>>({
    url: 'example/findOne',
    method: 'post',
    data: {
      id,
    },
  })
}

export function reqRemoveExample(data: { ids: number[] }) {
  return request<ApiResponseData<{}>>({
    url: 'example/remove',
    method: 'post',
    data,
  })
}

export function reqCreateExample(data: Example) {
  return request<ApiResponseData<{}>>({
    url: 'example/create',
    method: 'post',
    data,
  })
}

export function reqUpdateExample(data: Example) {
  return request<ApiResponseData<{}>>({
    url: 'example/update',
    method: 'post',
    data,
  })
}
