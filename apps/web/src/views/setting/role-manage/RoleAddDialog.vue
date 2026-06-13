<script lang="ts" setup>
import { reqCreateRole } from '@/api/role'
import BlDialog from '@/components/BulvComponent/BlDialog.vue'
import BlFormCard from '@/components/BulvComponent/BlFormCard.vue'
import { FormTableItemOption } from '@/components/BulvComponent/types/FormTableItemOption'
import { useDynamicField } from '@/hooks/useDynamicField'
import { ElMessage } from 'element-plus'
import { computed, nextTick, ref } from 'vue'

const emits = defineEmits(['success'])

const title = ref<string>('角色新增')
const visible = ref<boolean>(false)

const blFormRef = ref<any>(null)
const formModel = ref<any>({})

const { dynamicOptions } = useDynamicField(29)
const formOption = computed<FormTableItemOption[]>(() => {
  return dynamicOptions.value.form?.fields || []
})

const openInit = () => {
  visible.value = true

  nextTick(() => {
    blFormRef.value?.resetFields()
  })
}

const handleConfirm = async () => {
  await blFormRef.value.validate()

  await reqCreateRole(formModel.value)

  ElMessage.success('保存成功')

  emits('success')
}

defineExpose({ openInit })
</script>

<template>
  <bl-dialog
    v-model:visible="visible"
    width="480px"
    :title="title"
    :on-confirm="handleConfirm"
  >
    <BlFormCard
      ref="blFormRef"
      :form-option="formOption"
      :form-model="formModel"
    >
    </BlFormCard>
  </bl-dialog>
</template>

<style scoped lang="scss"></style>
