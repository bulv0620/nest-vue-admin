export enum ItemType {
  // 输入类型
  INPUT = 101,
  PASSWORD = 102,
  SELECT = 103,
  BOOL = 104,
  DATE = 105,
  DATETIME = 106,
  DATE_RANGE = 107,
  DATETIME_RANGE = 108,
  NUMBER = 109,
  // 文本类型
  STRING = 201,
  SELECT_LABEL = 202,
  BOOL_LABEL = 203,
  DATE_STRING = 204,
  DATETIME_STRING = 205,
  INDEX = 206,
}

export enum ButtonType {
  ROW = 301,
  TABLE = 302,
}

export enum BtnColor {
  BLUE = 'primary',
  RED = 'danger',
  ORANGE = 'warning',
  GREY = 'info',
  GREEN = 'success',
}

export enum FormTableType {
  QUERY_FORM_TABLE = 401,
  DIALOG_FORM_TABLE = 402,
}

export enum DragItemType {
  BUTTON = 501,
  FORM_ITEM = 502,
  TABLE_COLUMN = 503,
}

export interface FormItemConfig {
  // 选择项配置
  selectOptions?: Array<{
    label: string
    value: string
  }>
}

export interface ItemOption {
  uuid?: string // 标识 用于标记拖拽元素
  icon?: string // 图标
  label: string // 标签
  width?: number // 宽度  table
  labelWidth?: number // 标签宽度  form
  span?: number // 占位数  form
  rules?: any // 校验规则
  prop: string // 字段名
  placeholder?: string // 占位内容
  disabled?: boolean // 禁用
  readonly?: boolean // 只读
  type: ItemType // 类型
  config: FormItemConfig // 配置内容
}

export interface ButtonOption {
  uuid?: string // 标识 用于标记拖拽元素
  text: string // 文本
  color: BtnColor // 颜色
  icon?: string // 图标
  handler: string // 处理函数名
  type: ButtonType // 类型(行内按钮,table按钮)
  loading: boolean // 加载状态
  validate?: boolean // 校验（多行按钮判断是否已选择）
  bindDialog?: string // 绑定弹窗
}

export interface FormTable {
  type: FormTableType

  // 弹窗的特殊配置
  dialogConfig?: {
    dialogTitle: string
    dialogWidth: string
    useFullscreen: boolean
    useMinimize: boolean

    initOption?: {
      enable: boolean
      beforeInitHandler?: string
      afterInitHandler?: string
    }

    closeOption?: {
      enable: boolean
      beforeCloseHandler?: string
      afterCloseHandler?: string
    }

    saveOption?: {
      enable: boolean
      url: string
      beforeSaveHandler?: string
      afterSaveHandler?: string
    }
  }

  // 查询页的特殊配置
  queryConfig?: {
    uploadOption?: {
      enable: boolean
      url?: string
      beforeUploadHandler?: string
      afterUploadHandler?: string
    }

    downloadOption?: {
      enable: boolean
      url?: string
      beforeDownloadHandler?: string
      afterDownloadHandler?: string
    }

    queryOption?: {
      enable: boolean
      url: string
      beforeQueryHandler?: string
      afterQueryHandler?: string
    }
  }

  // 表单配置
  formOptions: Array<ItemOption>
  // 多table（查询页只存在一个）
  tables: Array<{
    title: string
    // dialog扫码框 (存在于弹窗的多table中)
    scanSearchOption?: {
      enable: boolean
      url?: string
      beforeScanSearchHandler?: string
      afterScanSearchHandler?: string
    }
    tableOptions: Array<ItemOption>
    buttonOptions: Array<ButtonOption>
  }>
  fn: any
}
export interface PageConfig {
  moduleName: string
  config: FormTable
  dialogs: Array<FormTable>
}

export interface PrehookParams<T, U, V> {
  // T: 弹窗table行类型  U: 弹窗form类型  V: 查询table行类型
  row?: T // 行数据
  rows?: Array<T> // 多行数据
  formData?: U // 表单数据
  tableDatas?: Array<Array<T>> // 所有表格数据
  querySelectedRows?: Array<V> // 查询选中行参数(仅打开弹窗使用)
  code?: string // 扫码code(仅扫码)
  close?: Function // 关闭弹窗的方法
  clearData?: Function // 清空弹窗数据的方法
}

export interface PosthookParams<T, U, V> {
  // T: 弹窗table行类型  U: 弹窗form类型  V: 查询table行类型
  row?: T // 行数据
  rows?: Array<T> // 多行数据
  formData?: U // 表单数据
  tableDatas?: Array<Array<T>> // 所有表格数据
  querySelectedRows?: Array<V> // 查询选中行参数(仅打开弹窗使用)
  close?: Function // 关闭弹窗的方法
  clearData?: Function // 清空弹窗数据的方法
  setFormData?: Function // 设置表单数据
  setTableDatas?: Function // 设置表格数据
  pushTableData?: Function // 表格添加数据(仅扫码)
  prehookResult?: any // 前置钩子的返回值
  eventResult?: any // 事件的返回值
}

export interface ButtonCallbackParams<T, U> {
  // T: 查询table行类型  U: 查询form类型
  row: T // 行数据
  rows: Array<T> // 多行数据
  rowIndex: number // 行下标
  formData: U // 表单数据
  taleData: Array<T> // 操作表格数据
  tableDatas: Array<Array<T>> // 所有表格数据
}
