import { reqGetField } from '@/api/field'
import { Field } from '@/api/field/types/field'
import { FormTableItemOption } from '@/components/BulvComponent/types/FormTableItemOption'
import { groupByFirst } from '@/utils/common'
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePagination } from './usePagination'

export function useQueryPage<T>(reqQuery: (...args: any[]) => Promise<any>) {
  //#region 动态获取
  interface DynamicOption {
    [key: string]: Field
  }

  const loading = ref(false)

  const pageLoading = ref(false)
  const dynamicOptions = ref<DynamicOption>({})
  const route = useRoute()

  onBeforeMount(async () => {
    try {
      pageLoading.value = true

      const { data } = await reqGetField({
        fieldCode: route.meta.id as number,
      })
      dynamicOptions.value = groupByFirst(data, 'fieldGroup')

      for (const option of Object.values(dynamicOptions.value)) {
        option.fields = option.fields.filter((field) => field.visible)
      }
    } catch (error) {
      console.error(error)
    } finally {
      pageLoading.value = false
    }
  })
  //#endregion

  //#region form
  const formModel = ref<any>({})

  const formOption = computed<FormTableItemOption[]>(() => {
    return dynamicOptions.value.form?.fields || []
  })

  const queryMethod = async () => {
    try {
      loading.value = true

      const payload: PaginationRequestData<T> = {
        queryDetail: formModel.value,
        pageNum: paginationData.pageNum,
        pageSize: paginationData.pageSize,
      }

      const { data } = await reqQuery(payload)

      tableData.value = data.list

      paginationData.pageNum = data.pageNum
      paginationData.pageSize = data.pageSize
      paginationData.total = data.total
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      loading.value = false
    }
  }
  //#endregion

  //#region table
  const tableData = ref<T[]>([])
  const selectRows = ref<T[]>([])

  const tableOption = computed<FormTableItemOption[]>(() => {
    return dynamicOptions.value.table?.fields || []
  })

  const { paginationData, handlePageNoChange, handlePageSizeChange } =
    usePagination()

  /** 监听分页参数的变化 */
  watch(
    [() => paginationData.pageNum, () => paginationData.pageSize],
    () => {
      nextTick(() => {
        queryMethod()
      })
    },
    { immediate: true },
  )

  const handleCurrentRowsChange = (val: any[]) => {
    selectRows.value = val
  }
  //#endregion

  //#region button
  const buttonOption = computed<FormTableItemOption[]>(() => {
    return dynamicOptions.value.button?.fields || []
  })
  //#endregion

  return {
    loading,
    pageLoading,
    dynamicOptions,
    formModel,
    formOption,
    tableData,
    selectRows,
    tableOption,
    buttonOption,
    paginationData,
    handlePageNoChange,
    handlePageSizeChange,
    handleCurrentRowsChange,
    queryMethod,
  }
}
