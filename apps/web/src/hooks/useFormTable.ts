import { reqGetField } from '@/api/field'
import { Field } from '@/api/field/types/field'
import { FormTableItemOption } from '@/components/BulvComponent/types/FormTableItemOption'
import { groupByFirst } from '@/utils/common'
import { computed, onBeforeMount, ref } from 'vue'

export function useFormTable<T>(id: number) {
  //#region 动态获取
  interface DynamicOption {
    [key: string]: Field
  }

  const loading = ref(false)

  const pageLoading = ref(false)
  const dynamicOptions = ref<DynamicOption>({})

  onBeforeMount(async () => {
    try {
      pageLoading.value = true

      const { data } = await reqGetField({
        fieldCode: id,
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
  const formModel = ref<T>({} as any)

  const formOption = computed<FormTableItemOption[]>(() => {
    return dynamicOptions.value.form?.fields || []
  })
  //#endregion

  //#region table
  const tableData = ref<T[]>([])
  const selectRows = ref<T[]>([])

  const tableOption = computed<FormTableItemOption[]>(() => {
    return dynamicOptions.value.table?.fields || []
  })

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
    handleCurrentRowsChange,
  }
}
