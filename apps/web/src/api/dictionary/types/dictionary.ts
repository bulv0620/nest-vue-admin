export interface Dictionary {
  id?: number
  dictionaryCode: string // 唯一标识
  dictionaryLabel: string // 名称
  dictionaryValue: string // 实际值
  disabled: boolean
  createTime?: Date
  updateTime?: Date
  parent?: Dictionary
  children?: Dictionary[]
}
