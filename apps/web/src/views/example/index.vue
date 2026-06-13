<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import BlFormCard from '@/components/BulvComponent/BlFormCard.vue'
import BlTableCard from '@/components/BulvComponent/BlTableCard.vue'
import {
  TableButtonEventParam,
  TableButtonHandler,
} from '@/components/BulvComponent/types/TableButtonHandler'
import { useQueryPage } from '@/hooks/useQueryPage'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqGetExampleList, reqRemoveExample } from '@/api/example'
import { Example } from '@/api/example/types/example'
import ExampleAddDialog from './ExampleAddDialog.vue'
import ExampleUpdateDialog from './ExampleUpdateDialog.vue'

defineOptions({
  name: 'Example',
})

const blFormRef = ref<any>(null)
const blTableRef = ref<any>(null)
const exampleAddDialogRef = ref<any>(null)
const exampleUpdateDialogRef = ref<any>(null)

//#region handler
// 修改
const handleUpdate = async (params: TableButtonEventParam<Example>) => {
  exampleUpdateDialogRef.value?.openInit(params.row)
}

// 删除
const handleRemove = async (params: TableButtonEventParam<Example>) => {
  await ElMessageBox.confirm('是否删除', {
    type: 'error',
    title: '确认',
  })

  const payload = {
    ids: [params.row?.id as number],
  }

  await reqRemoveExample(payload)

  ElMessage.success('删除成功')

  nextTick(() => {
    queryMethod()
  })
}

// 新增
const handleAdd = async () => {
  exampleAddDialogRef.value?.openInit()
}

// 多选删除
const handleRemoveBatch = async () => {
  if (!selectRows.value.length) {
    ElMessage.error('请选择删除的行')
    throw new Error('请选择删除的行')
  }

  await ElMessageBox.confirm('是否删除', {
    type: 'error',
    title: '确认',
  })

  const payload = {
    ids: selectRows.value.map((row) => row.id as number),
  }

  await reqRemoveExample(payload)

  ElMessage.success('删除成功')

  nextTick(() => {
    queryMethod()
  })
}

const buttonHandler: TableButtonHandler<Example> = {
  handleUpdate,
  handleRemove,
  handleAdd,
  handleRemoveBatch,
}
//#endregion

const {
  loading,
  pageLoading,
  formModel,
  formOption,
  tableData,
  selectRows,
  tableOption,
  buttonOption,
  paginationData,
  handlePageNoChange,
  handlePageSizeChange,
  handleCurrentRowsChange,
  queryMethod,
} = useQueryPage<Example>(reqGetExampleList)
</script>

<template>
  <div class="page-container" v-loading="pageLoading">
    <bl-form-card
      ref="blFormRef"
      :form-option="formOption"
      :form-model="formModel"
      enable-query-control
      :query-method="queryMethod"
    ></bl-form-card>
    <bl-table-card
      v-loading="loading"
      ref="blTableRef"
      v-model:data="tableData"
      :table-option="tableOption"
      :button-option="buttonOption"
      :button-handler="buttonHandler"
      :table-layout="'cover'"
      enable-multiple-selection
      enable-pagination
      :pagination-data="paginationData"
      @page-no-change="handlePageNoChange"
      @page-size-change="handlePageSizeChange"
      @current-rows-change="handleCurrentRowsChange"
    >
    </bl-table-card>
    <ExampleAddDialog
      ref="exampleAddDialogRef"
      @success="queryMethod"
    ></ExampleAddDialog>
    <ExampleUpdateDialog
      ref="exampleUpdateDialogRef"
      @success="queryMethod"
    ></ExampleUpdateDialog>
  </div>
</template>

<style lang="scss" scoped></style>
