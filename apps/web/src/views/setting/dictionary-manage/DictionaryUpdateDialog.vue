<script lang="ts" setup>
import { reqGetDictionaryInfo, reqUpdateDictionary } from '@/api/dictionary'
import { Dictionary } from '@/api/dictionary/types/dictionary'
import BlDialog from '@/components/BulvComponent/BlDialog.vue'
import BlFormCard from '@/components/BulvComponent/BlFormCard.vue'
import BlTableCard from '@/components/BulvComponent/BlTableCard.vue'
import {
  TableButtonEventParam,
  TableButtonHandler,
} from '@/components/BulvComponent/types/TableButtonHandler'
import { useFormTable } from '@/hooks/useFormTable'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick, ref } from 'vue'

const emits = defineEmits(['success'])

const title = ref<string>('字典修改')
const visible = ref<boolean>(false)

const blFormRef = ref<any>(null)
const blTableRef = ref<any>(null)

const { formModel, formOption, tableData, tableOption, buttonOption } =
  useFormTable<Dictionary>(34)

const openInit = async (data: Dictionary) => {
  visible.value = true

  const resp = await reqGetDictionaryInfo(data.dictionaryCode)

  formModel.value = resp.data
  tableData.value = resp.data.children!

  nextTick(() => {
    blFormRef.value?.clearValidate()
  })
}

const handleConfirm = async () => {
  await blFormRef.value.validate()

  if (!tableData.value.length) {
    ElMessage.error('请添加选项')
    throw new Error('请添加选项')
  }

  await blTableRef.value.validate()

  const payload = {
    id: formModel.value.id,
    dictionaryCode: formModel.value.dictionaryCode,
    dictionaryLabel: formModel.value.dictionaryLabel,
    dictionaryValue: formModel.value.dictionaryLabel,
    disabled: false,
    children: tableData.value.map((row) => ({
      dictionaryCode: formModel.value.dictionaryCode,
      dictionaryLabel: row.dictionaryLabel,
      dictionaryValue: row.dictionaryValue,
      disabled: row.disabled,
    })),
  }

  await reqUpdateDictionary(payload)

  ElMessage.success('保存成功')

  emits('success')
}

const handleAddRow = async () => {
  tableData.value.push({} as any)
}

const handleDeleteRow = async (params: TableButtonEventParam<Dictionary>) => {
  await ElMessageBox.confirm('是否删除', {
    type: 'error',
    title: '确认',
  })
  tableData.value.splice(params.rowIndex!, 1)
}

const buttonHandler: TableButtonHandler<Dictionary> = {
  handleAddRow,
  handleDeleteRow,
}

defineExpose({ openInit })
</script>

<template>
  <bl-dialog
    v-model:visible="visible"
    width="780px"
    :title="title"
    :on-confirm="handleConfirm"
  >
    <template #default="{ fullscreen }">
      <BlFormCard
        ref="blFormRef"
        :form-option="formOption"
        :form-model="formModel"
      >
      </BlFormCard>
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
