import { SelectOption } from '@/components/BulvComponent/types/FormTableItemOption'

const selectOptionMap: Map<string, SelectOption[]> = new Map([
  [
    'boolSelect',
    [
      {
        label: '是',
        value: true,
        disabled: false,
      },
      {
        label: '否',
        value: false,
        disabled: false,
      },
    ],
  ],
])
export default selectOptionMap
