import { FormTableItemOption } from './FormTableItemOption'

export type TableButtonHandler<T> = {
  [key: string]: (arg: TableButtonEventParam<T>) => Promise<void>
}

export type TableButtonEventParam<T> = {
  row?: T
  rows?: T[]
  rowIndex?: number
  option?: FormTableItemOption
}
