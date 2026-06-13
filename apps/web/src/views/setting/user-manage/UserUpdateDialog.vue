<script lang="ts" setup>
import { reqUpdateUser } from '@/api/user'
import { User } from '@/api/user/types/user'
import BlDialog from '@/components/BulvComponent/BlDialog.vue'
import BlFormCard from '@/components/BulvComponent/BlFormCard.vue'
import { FormTableItemOption } from '@/components/BulvComponent/types/FormTableItemOption'
import { useDynamicField } from '@/hooks/useDynamicField'
import { ElMessage } from 'element-plus'
import { computed, nextTick, ref } from 'vue'

const emits = defineEmits(['success'])

const title = ref<string>('用户修改')
const visible = ref<boolean>(false)

const blFormRef = ref<any>(null)
const formModel = ref<any>({})

const { dynamicOptions } = useDynamicField(27)
const formOption = computed<FormTableItemOption[]>(() => {
  return dynamicOptions.value.form?.fields || []
})

const openInit = (data: User) => {
  visible.value = true

  formModel.value = { ...data }

  nextTick(() => {
    blFormRef.value?.clearValidate()
  })
}

const handleConfirm = async () => {
  await blFormRef.value.validate()

  await reqUpdateUser(formModel.value)

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
