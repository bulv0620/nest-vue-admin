import { request } from '@/utils/service'
import { Dictionary } from './types/dictionary'

export function reqGetDictionaryList(data: PaginationRequestData<Dictionary>) {
  return request<ApiResponseData<PaginationResponseData<Dictionary>>>({
    url: 'dictionary/list',
    method: 'post',
    data,
  })
}

/** 获取字典详情 */
export function reqGetDictionaryInfo(dictionaryCode: string) {
  return request<ApiResponseData<Dictionary>>({
    url: 'dictionary/findOne',
    method: 'post',
    data: {
      dictionaryCode,
    },
  })
}

export function reqRemoveDictionary(data: { ids: number[] }) {
  return request<ApiResponseData<{}>>({
    url: 'dictionary/remove',
    method: 'post',
    data,
  })
}

export function reqCreateDictionary(data: Dictionary) {
  return request<ApiResponseData<{}>>({
    url: 'dictionary/create',
    method: 'post',
    data,
  })
}

export function reqUpdateDictionary(data: Dictionary) {
  return request<ApiResponseData<{}>>({
    url: 'dictionary/update',
    method: 'post',
    data,
  })
}
