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
import { reqGetDictionaryList, reqRemoveDictionary } from '@/api/dictionary'
import { Dictionary } from '@/api/dictionary/types/dictionary'
import DictionaryAddDialog from './DictionaryAddDialog.vue'
import DictionaryUpdateDialog from './DictionaryUpdateDialog.vue'

defineOptions({
  name: 'DictionaryManage',
})

const blFormRef = ref<any>(null)
const blTableRef = ref<any>(null)
const dictionaryAddDialogRef = ref<any>(null)
const dictionaryUpdateDialogRef = ref<any>(null)

//#region handler
// 修改
const handleUpdate = async (params: TableButtonEventParam<Dictionary>) => {
  dictionaryUpdateDialogRef.value?.openInit(params.row)
}

// 删除
const handleRemove = async (params: TableButtonEventParam<Dictionary>) => {
  await ElMessageBox.confirm('是否删除', {
    type: 'error',
    title: '确认',
  })

  const payload = {
    ids: [params.row?.id as number],
  }

  await reqRemoveDictionary(payload)

  ElMessage.success('删除成功')

  nextTick(() => {
    queryMethod()
  })
}

// 新增
const handleAdd = async () => {
  dictionaryAddDialogRef.value?.openInit()
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

  await reqRemoveDictionary(payload)

  ElMessage.success('删除成功')

  nextTick(() => {
    queryMethod()
  })
}

const buttonHandler: TableButtonHandler<Dictionary> = {
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
} = useQueryPage<Dictionary>(reqGetDictionaryList)
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
    <DictionaryAddDialog
      ref="dictionaryAddDialogRef"
      @success="queryMethod"
    ></DictionaryAddDialog>
    <DictionaryUpdateDialog
      ref="dictionaryUpdateDialogRef"
      @success="queryMethod"
    ></DictionaryUpdateDialog>
  </div>
</template>

<style lang="scss" scoped></style>
