import { request } from '@/utils/service'
import { Field } from './types/field'

/** 新增字段配置 */
export function reqCreateField(data: { fieldList: Field[] }) {
  return request<ApiResponseData<{}>>({
    url: '/field/create',
    method: 'post',
    data,
  })
}

/** 更新字段配置 */
export function reqUpdateField(data: {
  fieldCode: number
  fieldList: Field[]
}) {
  return request<ApiResponseData<{}>>({
    url: '/field/update',
    method: 'post',
    data,
  })
}

/** 更新字段配置 */
export function reqGetField(data: { fieldCode: number }) {
  return request<ApiResponseData<Field[]>>({
    url: '/field/findOne',
    method: 'post',
    data,
  })
}
