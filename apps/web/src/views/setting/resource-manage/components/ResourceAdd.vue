<script lang="ts" setup>
import { reqAddResource, reqUpdateResource } from '@/api/resource'
import { ResourceNode, ResourceType } from '@/api/resource/types/resource'
import BlDialog from '@/components/BulvComponent/BlDialog.vue'
import BlFormCard from '@/components/BulvComponent/BlFormCard.vue'
import { FormTableItemOption } from '@/components/BulvComponent/types/FormTableItemOption'
import { FormTableItemEnum } from '@/enums/FormTableItemEnum'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'

const emits = defineEmits(['success'])

const visible = ref<boolean>(false)
const title = ref<string>('')
const dialogType = ref<'add' | 'update'>('add')

const blFormRef = ref<any>(null)
const formModel = ref<any>({})
const formOption = ref<Array<FormTableItemOption>>([
  {
    id: 1,
    label: '父级',
    prop: 'parentTitle',
    type: FormTableItemEnum.INPUT,
    span: 12,
    required: false,
    disabled: true,
    placeholder: '无',
  },
  {
    id: 8,
    label: '资源类型',
    prop: 'type',
    type: FormTableItemEnum.SELECT,
    span: 12,
    required: true,
    disabled: false,
    selectType: 'dict',
    dictionaryCode: 'RESOURCE_TYPE',
  },
  {
    id: 2,
    label: '顺序编号',
    prop: 'order',
    type: FormTableItemEnum.INPUT,
    span: 12,
    required: true,
    disabled: false,
    placeholder: '请输入数字',
    bind: {
      type: 'number',
    },
  },
  {
    id: 3,
    label: '资源编号',
    prop: 'resourceName',
    type: FormTableItemEnum.INPUT,
    span: 12,
    required: true,
    disabled: false,
    placeholder: '例: Hello',
  },
  {
    id: 4,
    label: '资源标题',
    prop: 'title',
    type: FormTableItemEnum.INPUT,
    span: 12,
    required: true,
    disabled: false,
    placeholder: '例: 你好',
  },
  {
    id: 5,
    label: '访问路径',
    prop: 'path',
    type: FormTableItemEnum.INPUT,
    span: 12,
    required: true,
    disabled: false,
    placeholder: '例: /hello',
  },
  {
    id: 6,
    label: '组件路径',
    prop: 'component',
    type: FormTableItemEnum.INPUT,
    span: 12,
    required: true,
    disabled: false,
    placeholder: '例: /hello/index.vue',
  },
  {
    id: 7,
    label: '图标',
    prop: 'icon',
    type: FormTableItemEnum.ICONINPUT,
    span: 12,
    required: true,
    disabled: false,
    placeholder: 'El- 或 Svg-',
  },
])
const dynamicFormOption = computed<Array<FormTableItemOption>>(() => {
  switch (formModel.value.type) {
    case ResourceType.MENU:
      return formOption.value.filter(
        (option) => !['path', 'component'].includes(option.prop),
      )
    case ResourceType.URL:
      return formOption.value.filter(
        (option) =>
          !['resourceName', 'icon', 'path', 'component'].includes(option.prop),
      )
    default:
      return formOption.value
  }
})

watch(dynamicFormOption, () => {
  setTimeout(() => {
    blFormRef.value?.clearValidate()
  })
})

const openInit = (type: 'add' | 'update', data: ResourceNode) => {
  visible.value = true
  dialogType.value = type

  if (type === 'add') {
    formModel.value = {}
    if (!data.root) {
      formModel.value.parentTitle = data.title
      formModel.value.parent = data
    }
    title.value = `新增资源(${data.root ? 'root' : data.title})`
    formOption.value.find((option) => option.prop === 'type')!.disabled = false
  } else {
    formModel.value = { ...data }
    if (data.parent) {
      formModel.value.parentTitle = data.parent.title
    }
    title.value = `编辑资源(${data.id})`
    formOption.value.find((option) => option.prop === 'type')!.disabled = true
  }

  setTimeout(() => {
    blFormRef.value?.clearValidate()
  })
}

const handleConfirm = async () => {
  await blFormRef.value.validate()
  await (dialogType.value === 'add'
    ? reqAddResource(formModel.value)
    : reqUpdateResource(formModel.value))

  ElMessage.success('保存成功')

  emits('success')
}

defineExpose({ openInit })
</script>

<template>
  <bl-dialog
    v-model:visible="visible"
    width="680px"
    :title="title"
    :on-confirm="handleConfirm"
  >
    <BlFormCard
      ref="blFormRef"
      :form-option="dynamicFormOption"
      :form-model="formModel"
    >
    </BlFormCard>
  </bl-dialog>
</template>

<style scoped lang="scss"></style>
