<script setup lang="ts" generic="T">
import { computed, ref, nextTick } from 'vue'
import BlFormTableItem from './BlFormTableItem.vue'
import { FormTableItemOption } from './types/FormTableItemOption'
import { FormTableItemEnum } from '@/enums/FormTableItemEnum'
import { ElMessage, ElTable, FormInstance } from 'element-plus'
import BlIcon from '@/components/BulvComponent/BlIcon.vue'
import { TableButtonHandler } from './types/TableButtonHandler'
import { watch } from 'vue'
import { defaultPaginationData, PaginationData } from '@/hooks/usePagination'

export interface BlTableCardProps<T> {
  tableOption: Array<FormTableItemOption> // table配置
  buttonOption?: Array<FormTableItemOption> // 按钮配置
  buttonHandler?: TableButtonHandler<T> // 按钮处理函数
  tableLayout?: 'cover' | 'manual' | 'default' // table布局 铺满 | 自定义 | 默认(视窗的1/4)
  tableHeight?: string | number // 自定义表格高度 仅tableLayout为manual时可用
  enableMultipleSelection?: boolean // 启用多选
  enableRadioSelection?: boolean // 启用单选
  editMode?: 'default' | 'click' | 'dbClick' | 'never' // 编辑模式(编辑模式会导致校验失效)(插槽不受影响) 根据配置常显示 | 点击编辑行 | 双击编辑行 | 禁止编辑
  enablePagination?: boolean // 启用分页
  paginationData?: PaginationData
}

const props = withDefaults(defineProps<BlTableCardProps<T>>(), {
  fullscreen: () => false,
  buttonOption: () => [],
  buttonHandler: () => ({}),
  layout: () => 'default',
  enableMultipleSelection: () => false,
  enableRadioSelection: () => false,
  enablePagination: () => false,
  paginationData: () => defaultPaginationData,
  editMode: () => 'default',
})

const emits = defineEmits([
  'currentRowChange',
  'currentRowsChange',
  'pageNoChange',
  'pageSizeChange',
])

const tableData = defineModel<T[]>('data', { required: true }) // table双向绑定对象

const form = computed({
  set(val: { tableData: T[] }) {
    tableData.value = val.tableData
  },
  get() {
    return {
      tableData: tableData.value,
    }
  },
})

//#region dialog全屏自适应高度
const tableHeight = computed(() => {
  if (props.tableLayout === 'cover') {
    return '100%'
  } else if (props.tableLayout === 'manual') {
    return typeof props.tableHeight === 'number'
      ? `${props.tableHeight}px`
      : props.tableHeight
  } else {
    return `${Math.floor(window.innerHeight * 0.25)}px`
  }
})
//#endregion

//#region 表单校验
const tableFormRef = ref<FormInstance>()

const rules = computed(() => {
  const obj: any = {}

  props.tableOption.forEach((tableItem) => {
    if (tableItem.required) {
      obj[tableItem.prop] = [
        {
          required: true,
          message: `请填写${tableItem.label}`,
          trigger: 'change',
        },
      ]

      if (tableItem.rules) {
        obj[tableItem.prop].push(...tableItem.rules)
      }
    }
  })

  return obj
})

const validate = () => {
  return tableFormRef.value?.validate()
}

const resetFields = () => {
  return tableFormRef.value?.resetFields()
}

const clearValidate = () => {
  return tableFormRef.value?.clearValidate()
}

//#endregion

//#region 编辑功能
// 根据editmode计算table option
const currentTableOption = computed(() => {
  if (props.editMode === 'never') {
    return props.tableOption.map((el) => ({
      ...el,
      type: FormTableItemEnum.SPAN,
    }))
  } else {
    return props.tableOption
  }
})

// 当前编辑行的标识 rowIndex + '-' + colIndex
const editingCell = ref<string>('')

// 输入框元素ref
const tableInputItemRef = ref<any>('')
watch(editingCell, () => {
  nextTick(() => {
    tableInputItemRef.value?.[0]?.focus()
  })
})

// 输入框失焦
const handleBlur = () => {
  editingCell.value = ''
}

const handleClick = (rowIndex: number, colIndex: number) => {
  if (props.editMode === 'click') {
    editingCell.value = `${rowIndex}-${colIndex}`
  }
}

const handleDbClick = (rowIndex: number, colIndex: number) => {
  if (props.editMode === 'dbClick') {
    editingCell.value = `${rowIndex}-${colIndex}`
  }
}
//#endregion

//#region 多选单选
const tableRef = ref<InstanceType<typeof ElTable>>()

const multipleSelection = ref<T[]>([])
const currentRow = ref<T>()

// 手动切换单行选中状态
const setCurrent = (row?: T) => {
  tableRef.value!.setCurrentRow(row)
}

// 单行选中事件
const handleCurrentRowChange = (val: T | undefined) => {
  if (props.enableRadioSelection) {
    currentRow.value = val
    emits('currentRowChange', val)
  }
}

// 手动切换多行选中
const toggleSelection = (rows?: T[], selected?: boolean) => {
  if (rows) {
    rows.forEach((row) => {
      tableRef.value!.toggleRowSelection(row, selected as boolean)
    })
  } else {
    tableRef.value!.clearSelection()
  }
}

// 多行选中事件
const handleSelectionChange = (val: any[]) => {
  if (props.enableMultipleSelection) {
    multipleSelection.value = val
    emits('currentRowsChange', val)
  }
}
//#endregion

//#region table操作按钮及事件
// 按钮加载状态
const buttonLoading = ref<Map<string, boolean>>(new Map())

/**
 * 获取表格按钮加载状态
 * @param type 表格行按钮 或 表格头按钮 'column' | 'top'
 * @param btn 表格配置
 * @param $index 表格行序号
 */
const getLoadingStatus = (
  type: 'column' | 'top',
  btn: FormTableItemOption,
  $index?: number,
) => {
  if (type === 'column') {
    return buttonLoading.value.get(`${btn.prop}-${$index}`)
  } else {
    return buttonLoading.value.get(btn.prop)
  }
}

// 计算行内按钮
const tableColumnButtons = computed(() => {
  return props.buttonOption.filter((btn) => btn.position === 'tableColumn')
})

// 计算表头按钮
const tableTopButtons = computed(() => {
  return props.buttonOption.filter((btn) => btn.position === 'tableTop')
})

/**
 * 表格头按钮处理事件
 * @param selectRows 表格选中的列
 * @param option 按钮配置
 */
const handleTableTopButtonClick = async (
  currentRow: any,
  selectRows: any[],
  option: FormTableItemOption,
) => {
  const loadingKey = option.prop

  // 无初始化loading状态则设置loading状态
  buttonLoading.value.has(loadingKey) ||
    buttonLoading.value.set(loadingKey, false)

  try {
    buttonLoading.value.set(loadingKey, true)

    const handlerFn = props.buttonHandler[option.prop]

    if (!handlerFn) {
      ElMessage.warning('未定义按钮处理函数')
    } else {
      await handlerFn({
        rows: selectRows,
        option,
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    buttonLoading.value.set(loadingKey, false)
  }
}

/**
 * 表格行内按钮处理事件
 * @param row 表格行内容
 * @param rowIndex 表格行序号
 * @param option 按钮配置
 */
const handleTableColumnButtonClick = async (
  row: any,
  rowIndex: number,
  option: FormTableItemOption,
) => {
  const loadingKey = `${option.prop}-${rowIndex}`

  // 无初始化loading状态则设置loading状态
  buttonLoading.value.has(loadingKey) ||
    buttonLoading.value.set(loadingKey, false)

  try {
    buttonLoading.value.set(loadingKey, true)

    const handlerFn = props.buttonHandler[option.prop]

    if (!handlerFn) {
      ElMessage.warning('未定义按钮处理函数')
    } else {
      await handlerFn({
        row,
        rowIndex,
        option,
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    buttonLoading.value.set(loadingKey, false)
  }
}
//#endregion

//#region 表格操作列宽度计算
const operationColumnWidth = ref(120)
const tableCardRef = ref<any>(null)

const updateOperationWidth = async () => {
  await nextTick()
  const btns = tableCardRef.value.$el.querySelectorAll('.operation-column-btn')
  if (btns.length === 0) return
  let total = 24 // padding
  btns.forEach((btn: HTMLElement) => {
    const rect = btn.getBoundingClientRect()
    total += rect.width
  })
  total += (btns.length - 1) * 12
  operationColumnWidth.value = total + 16 + 1
}

// 初次加载 + 按钮配置变化时重新测量
watch(tableColumnButtons, updateOperationWidth, { immediate: true })
//#endregion

defineExpose({
  toggleSelection,
  setCurrent,
  validate,
  resetFields,
  clearValidate,
})
</script>

<template>
  <el-card
    ref="tableCardRef"
    class="table-card"
    style="flex: 1; height: 100%"
    shadow="never"
  >
    <div class="table-top-btn-wrapper" v-if="tableTopButtons.length">
      <el-button
        v-for="btn in tableTopButtons"
        :key="btn.prop"
        :loading="getLoadingStatus('top', btn)"
        @click="handleTableTopButtonClick(currentRow, multipleSelection, btn)"
        :type="btn.buttonType"
        plain
        v-bind="btn.bind"
      >
        <bl-icon
          v-if="btn.icon && !getLoadingStatus('top', btn)"
          style="margin-right: 4px"
          :icon="btn.icon"
        ></bl-icon>
        {{ btn.label }}
      </el-button>
    </div>
    <el-form ref="tableFormRef" :model="form" style="flex: 1; height: 0">
      <el-table
        ref="tableRef"
        :data="tableData"
        style="width: 100%"
        :height="tableHeight"
        table-layout="auto"
        border
        :highlight-current-row="enableRadioSelection"
        @selection-change="handleSelectionChange"
        @current-change="handleCurrentRowChange"
      >
        <el-table-column
          v-if="enableMultipleSelection"
          type="selection"
          width="55"
        />
        <el-table-column
          v-if="tableColumnButtons.length"
          label="操作"
          fixed="left"
          :width="operationColumnWidth"
        >
          <template #default="scope">
            <el-button
              v-for="btn in tableColumnButtons"
              :key="btn.prop"
              class="operation-column-btn"
              size="small"
              :loading="getLoadingStatus('column', btn, scope.$index)"
              @click.stop="
                handleTableColumnButtonClick(scope.row, scope.$index, btn)
              "
              :type="btn.buttonType"
              text
              bg
              v-bind="btn.bind"
            >
              <bl-icon
                v-if="
                  btn.icon && !getLoadingStatus('column', btn, scope.$index)
                "
                style="margin-right: 4px"
                :icon="btn.icon"
              ></bl-icon>
              {{ btn.label }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(col, colIndex) in currentTableOption"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :min-width="col.width"
          resizable
        >
          <template #default="scope: { row: T; $index: number }">
            <slot
              v-if="col.type === FormTableItemEnum.SLOT"
              :name="col.prop"
              :row="scope.row"
              :index="scope.$index"
            ></slot>
            <div
              class="edit-text"
              v-else-if="
                editMode === 'never' ||
                (['click', 'dbClick'].includes(editMode) &&
                  editingCell !== `${scope.$index}-${colIndex}`)
              "
              @click="handleClick(scope.$index, colIndex)"
              @dblclick="handleDbClick(scope.$index, colIndex)"
            >
              {{ (scope.row as any)[col.prop] }}
            </div>
            <el-form-item
              v-else
              :prop="`tableData.${scope.$index}.${col.prop}`"
              :rules="rules[col.prop]"
              :show-message="false"
            >
              <BlFormTableItem
                ref="tableInputItemRef"
                v-model:value="(scope.row as any)[col.prop]"
                :item-option="col"
                @blur="handleBlur"
              ></BlFormTableItem>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <div class="pager-wrapper" v-if="enablePagination">
      <el-pagination
        background
        :layout="paginationData.layout"
        :page-sizes="paginationData.pageSizes"
        :total="paginationData.total"
        :page-size="paginationData.pageSize"
        :currentPage="paginationData.pageNum"
        @size-change="emits('pageSizeChange', $event)"
        @current-change="emits('pageNoChange', $event)"
      />
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-column-btn-wrapper {
  width: fit-content;
  display: flex;
  justify-content: left;
}

.table-top-btn-wrapper {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  row-gap: 8px;
}

.edit-text {
  cursor: pointer;
  height: 32px;
  line-height: 32px;
}

:deep(.el-table__cell) {
  .el-form-item {
    margin-bottom: 0;
  }
}

.pager-wrapper {
  padding-top: 12px;
}
</style>
