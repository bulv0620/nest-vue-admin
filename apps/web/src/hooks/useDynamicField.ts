import { reqGetField } from '@/api/field'
import { Field } from '@/api/field/types/field'
import { groupByFirst } from '@/utils/common'
import { onBeforeMount, ref } from 'vue'

export function useDynamicField(id: number) {
  //#region 动态获取
  interface DynamicOption {
    [key: string]: Field
  }

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

  return {
    pageLoading,
    dynamicOptions,
  }
}
