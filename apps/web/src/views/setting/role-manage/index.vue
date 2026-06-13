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
import { reqQueryRoleList, reqRemoveRole } from '@/api/role'
import RoleAddDialog from './RoleAddDialog.vue'
import RoleUpdateDialog from './RoleUpdateDialog.vue'
import RoleBindResourceDialog from './RoleBindResourceDialog.vue'
import { Role } from '@/api/role/types/role'

defineOptions({
  name: 'RoleManage',
})

const blFormRef = ref<any>(null)
const blTableRef = ref<any>(null)
const roleAddDialogRef = ref<any>(null)
const roleUpdateDialogRef = ref<any>(null)
const roleBindResourceDialogRef = ref<any>(null)

//#region handler
// 修改
const handleUpdate = async (params: TableButtonEventParam<Role>) => {
  roleUpdateDialogRef.value.openInit(params.row)
}

// 绑定资源
const handleBindResource = async (params: TableButtonEventParam<Role>) => {
  roleBindResourceDialogRef.value.openInit(params.row)
}

// 删除
const handleRemove = async (params: TableButtonEventParam<Role>) => {
  await ElMessageBox.confirm('是否删除', {
    type: 'error',
    title: '确认',
  })

  const payload = {
    ids: [params.row?.id as number],
  }

  await reqRemoveRole(payload)

  ElMessage.success('删除成功')

  nextTick(() => {
    queryMethod()
  })
}

// 新增
const handleAdd = async () => {
  roleAddDialogRef.value.openInit()
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

  await reqRemoveRole(payload)

  ElMessage.success('删除成功')

  nextTick(() => {
    queryMethod()
  })
}

const buttonHandler: TableButtonHandler<Role> = {
  handleUpdate,
  handleBindResource,
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
} = useQueryPage<Role>(reqQueryRoleList)
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
    <RoleAddDialog
      ref="roleAddDialogRef"
      @success="queryMethod"
    ></RoleAddDialog>
    <RoleUpdateDialog
      ref="roleUpdateDialogRef"
      @success="queryMethod"
    ></RoleUpdateDialog>
    <RoleBindResourceDialog
      ref="roleBindResourceDialogRef"
      @success="queryMethod"
    ></RoleBindResourceDialog>
  </div>
</template>

<style lang="scss" scoped></style>
