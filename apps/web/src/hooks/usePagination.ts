import { reactive } from 'vue'

interface DefaultPaginationData {
  total: number
  pageNum: number
  pageSizes: number[]
  pageSize: number
  layout: string
}

export interface PaginationData {
  total?: number
  pageNum?: number
  pageSizes?: number[]
  pageSize?: number
  layout?: string
}

/** 默认的分页参数 */
export const defaultPaginationData: DefaultPaginationData = {
  total: 0,
  pageNum: 1,
  pageSizes: [10, 20, 50],
  pageSize: 10,
  layout: 'total, sizes, prev, pager, next, jumper',
}

export function usePagination(initialPaginationData: PaginationData = {}) {
  /** 合并分页参数 */
  const paginationData = reactive({
    ...defaultPaginationData,
    ...initialPaginationData,
  })
  /** 改变当前页码 */
  const handlePageNoChange = (value: number) => {
    paginationData.pageNum = value
  }
  /** 改变页面大小 */
  const handlePageSizeChange = (value: number) => {
    paginationData.pageSize = value
  }

  return { paginationData, handlePageNoChange, handlePageSizeChange }
}
