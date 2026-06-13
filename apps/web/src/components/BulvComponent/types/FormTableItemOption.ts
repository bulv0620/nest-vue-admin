import { FormTableItemEnum } from '@/enums/FormTableItemEnum'

export interface FormTableItemOption {
  id?: number // id
  label: string // 标签
  prop: string // 属性名 || 按钮处理事件名
  position?: 'form' | 'table' | 'tableColumn' | 'tableTop' | string // 内容位置
  required?: boolean // 是否必填
  disabled?: boolean // 是否禁用
  clearable?: boolean // 是否可清除
  visible?: boolean // 是否可见
  align?: any // table align配置
  placeholder?: string // 占位符
  labelWidth?: number // 标签宽度
  width?: number // 宽度
  span?: number // 布局占位数
  type: FormTableItemEnum // 内容类型
  buttonType?: string // 按钮类型
  editorType?: string // 编辑器类型
  selectType?: 'dict' | 'manual' // 选择框类型
  dictionaryCode?: string // 数据字典编号
  selectOption?: string // 选项配置
  defaultValue?: string // 默认值
  rules?: any[] // 自定义规则
  customVisible?: any // 自定义可见规则
  customDirectives?: any // 自定义指令
  event?: any // 自定义事件
  bind?: any // 绑定属性
  icon?: string // 按钮图标
}

export interface SelectOption {
  label: string
  value: any
  disabled: boolean
}

/**
 * position
 *
 * label
 * prop
 * disabled
 * visible
 *
 * bind 通用
 *
 * required 输入
 * placeholder 输入
 * defaultValue 输入
 *
 * labelWidth 仅表单
 * span 仅表单
 *
 * align 仅表格
 * width 仅表格
 *
 * selectType 仅FormTableItemEnum.SELECT
 * dictionaryCode 仅FormTableItemEnum.SELECT
 * selectOption 仅FormTableItemEnum.SELECT
 *
 * icon 仅FormTableItemEnum.BUTTON
 *
 * rules 未启用
 * customVisible 未启用
 * customDirectives 未启用
 * event 未启用
 *
 */
