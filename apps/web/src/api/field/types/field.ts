import { FormTableItemOption } from '@/components/BulvComponent/types/FormTableItemOption'

export interface Field {
  id?: number
  fieldCode?: number // 标识
  fieldGroup: string // 分组
  fieldType: 'form' | 'table' | 'button'
  fields: FormTableItemOption[]
}
