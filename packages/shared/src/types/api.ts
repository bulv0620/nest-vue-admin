/** 所有 api 接口的响应数据都应该准守该格式 */
export interface ApiResponseData<T> {
  code: number
  data: T
  message: string
}

export interface PaginationResponseData<T> {
  list: T[]
  pageNum: number
  pageSize: number
  total: number
}

export interface PaginationRequestData<T> {
  queryDetail: T
  pageSize: number
  pageNum: number
}
