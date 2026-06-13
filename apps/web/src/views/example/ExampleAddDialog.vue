<script lang="ts" setup>
import { reqCreateExample } from '@/api/example'
import { Example } from '@/api/example/types/example'
import BlDialog from '@/components/BulvComponent/BlDialog.vue'
import BlFormCard from '@/components/BulvComponent/BlFormCard.vue'
import { useFormTable } from '@/hooks/useFormTable'
import { ElMessage } from 'element-plus'
import { nextTick, ref } from 'vue'

const emits = defineEmits(['success'])

const title = ref<string>('新增')
const visible = ref<boolean>(false)

const blFormRef = ref<any>(null)

const { formModel, formOption } = useFormTable<Example>(36)

const openInit = () => {
  visible.value = true

  nextTick(() => {
    blFormRef.value?.resetFields()
  })
}

const handleConfirm = async () => {
  await blFormRef.value.validate()

  const payload = {
    exampleCode: formModel.value.exampleCode,
    exampleName: formModel.value.exampleName,
    exampleDesc: formModel.value.exampleDesc,
  }

  await reqCreateExample(payload)

  ElMessage.success('保存成功')

  emits('success')
}

defineExpose({ openInit })
</script>

<template>
  <bl-dialog
    v-model:visible="visible"
    width="520px"
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
