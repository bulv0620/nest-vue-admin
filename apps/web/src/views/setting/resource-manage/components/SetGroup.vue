<script lang="ts" setup>
import BlDialog from '@/components/BulvComponent/BlDialog.vue'
import BlTableCard from '@/components/BulvComponent/BlTableCard.vue'
import type { FormTableItemOption } from '@/components/BulvComponent/types/FormTableItemOption'
import { ref, watch } from 'vue'
import { FormTableItemEnum } from '@/enums/FormTableItemEnum'
import {
  TableButtonEventParam,
  TableButtonHandler,
} from '@/components/BulvComponent/types/TableButtonHandler'
import { hasDuplicateField } from '@/utils/common'
import { ElMessage } from 'element-plus'

const visible = ref<boolean>(false)

//#region 表格配置
const blTableRef = ref<any>(null)
const tableData = ref<FormTableItemOption[]>([])

const tableOption = ref<FormTableItemOption[]>([
  {
    id: 1,
    label: '组名',
    prop: 'fieldGroup',
    type: FormTableItemEnum.INPUT,
    required: true,
  },
  {
    id: 3,
    label: '类型',
    prop: 'fieldType',
    type: FormTableItemEnum.SELECT,
    required: true,
    selectType: 'dict',
    dictionaryCode: 'FIELD_TYPE',
  },
])

const buttonOption = ref<FormTableItemOption[]>([
  {
    id: 5,
    label: '删除',
    position: 'tableColumn',
    prop: 'handleDeleteRow',
    type: FormTableItemEnum.BUTTON,
    bind: {
      type: 'danger',
      plain: true,
    },
  },
  {
    id: 6,
    label: '新增',
    position: 'tableTop',
    prop: 'handleAddRow',
    type: FormTableItemEnum.BUTTON,
    bind: {
      type: 'primary',
    },
  },
])

const handleDeleteRow = async (
  params: TableButtonEventParam<FormTableItemOption>,
) => {
  tableData.value.splice(params.rowIndex!, 1)
}
const handleAddRow = async () => {
  tableData.value.push({ fields: [] } as any)
}

const buttonHandler: TableButtonHandler<FormTableItemOption> = {
  handleDeleteRow,
  handleAddRow,
}
//#endregion

//#region 弹窗处理逻辑
let promiseState: any = {
  resolve: null,
  reject: null,
}

const openInit = (data: FormTableItemOption[]) => {
  return new Promise((resolve, reject) => {
    promiseState = { resolve, reject }

    visible.value = true

    tableData.value = JSON.parse(JSON.stringify(data))
  })
}

const handleConfirm = async () => {
  await blTableRef.value.validate()

  if (hasDuplicateField(tableData.value, 'fieldGroup')) {
    ElMessage.error('组名不能重复')
    throw new Error('组名不能重复')
  }

  promiseState.resolve(tableData.value)
}

watch(visible, (newVal) => {
  if (newVal === false) {
    if (promiseState.reject) {
      promiseState.reject(new Error('关闭'))
    }
  }
})
//#endregion

defineExpose({ openInit })
</script>

<template>
  <bl-dialog
    v-model:visible="visible"
    width="600px"
    title="配置字段组"
    :on-confirm="handleConfirm"
  >
    <template #default="{ fullscreen }">
      <BlTableCard
        ref="blTableRef"
        v-model:data="tableData"
        :table-option="tableOption"
        :button-option="buttonOption"
        :button-handler="buttonHandler"
        :table-layout="fullscreen ? 'cover' : 'default'"
      >
      </BlTableCard>
    </template>
  </bl-dialog>
</template>

<style scoped lang="scss"></style>
