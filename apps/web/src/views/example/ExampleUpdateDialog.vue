<script lang="ts" setup>
import { reqGetExampleInfo, reqUpdateExample } from '@/api/example'
import { Example } from '@/api/example/types/example'
import BlDialog from '@/components/BulvComponent/BlDialog.vue'
import BlFormCard from '@/components/BulvComponent/BlFormCard.vue'
import { useFormTable } from '@/hooks/useFormTable'
import { ElMessage } from 'element-plus'
import { nextTick, ref } from 'vue'

const emits = defineEmits(['success'])

const title = ref<string>('修改')
const visible = ref<boolean>(false)

const blFormRef = ref<any>(null)

const { formModel, formOption } = useFormTable<Example>(37)

const openInit = async (data: Example) => {
  visible.value = true

  const resp = await reqGetExampleInfo(data.id)

  formModel.value = resp.data

  nextTick(() => {
    blFormRef.value?.clearValidate()
  })
}

const handleConfirm = async () => {
  await blFormRef.value.validate()

  const payload = {
    id: formModel.value.id,
    exampleCode: formModel.value.exampleCode,
    exampleName: formModel.value.exampleName,
    exampleDesc: formModel.value.exampleDesc,
  }

  await reqUpdateExample(payload)

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
