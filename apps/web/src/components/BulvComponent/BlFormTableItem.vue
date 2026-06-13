<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { FormTableItemOption } from './types/FormTableItemOption.ts'
import BlSelect from './BlSelect.vue'
import BlIconInput from './BlIconInput.vue'
import BlSelectSpan from './BlSelectSpan.vue'
import { Search } from '@element-plus/icons-vue'
import { FormTableItemEnum } from '@/enums/FormTableItemEnum'
import BlCodeEditor from './BlCodeEditor.vue'

export interface BlFormTableItemProps {
  itemOption: FormTableItemOption
}

const props = withDefaults(defineProps<BlFormTableItemProps>(), {})

const value = defineModel<any>('value', { required: true })

const inputRef = ref<any>(null)
const focus = () => {
  inputRef.value?.focus()
}

onMounted(() => {
  if (props.itemOption.defaultValue) {
    value.value = props.itemOption.defaultValue
  }
})

defineExpose({ focus })
</script>

<template>
  <span v-if="itemOption.type === FormTableItemEnum.SPAN">
    {{ value }}
  </span>
  <el-input
    ref="inputRef"
    class="input-item"
    v-else-if="itemOption.type === FormTableItemEnum.INPUT"
    v-model="value"
    :placeholder="itemOption.placeholder"
    :disabled="itemOption.disabled"
    :clearable="itemOption.clearable"
    v-bind="itemOption.bind"
  ></el-input>
  <bl-icon-input
    ref="inputRef"
    class="input-item"
    v-else-if="itemOption.type === FormTableItemEnum.ICONINPUT"
    v-model="value"
    :placeholder="itemOption.placeholder"
    :disabled="itemOption.disabled"
    :clearable="itemOption.clearable"
    v-bind="itemOption.bind"
  ></bl-icon-input>
  <bl-select
    ref="inputRef"
    class="input-item"
    v-else-if="itemOption.type === FormTableItemEnum.SELECT"
    v-model="value"
    :placeholder="itemOption.placeholder"
    :disabled="itemOption.disabled"
    :clearable="itemOption.clearable"
    :select-type="itemOption.selectType"
    :dictionary-code="itemOption.dictionaryCode"
    :select-option="itemOption.selectOption"
    v-bind="itemOption.bind"
  >
  </bl-select>
  <el-date-picker
    ref="inputRef"
    style="width: 100%"
    v-else-if="itemOption.type === FormTableItemEnum.DATEPICKER"
    v-model="value"
    :placeholder="itemOption.placeholder"
    :disabled="itemOption.disabled"
    :clearable="itemOption.clearable"
    date-format="YYYY-MM-DD"
    time-format="HH:mm:ss"
    v-bind="itemOption.bind"
  />
  <el-input
    ref="inputRef"
    class="input-item"
    v-else-if="itemOption.type === FormTableItemEnum.SEARCHINPUT"
    v-model="value"
    readonly
    :placeholder="itemOption.placeholder"
    :disabled="itemOption.disabled"
    :clearable="itemOption.clearable"
    v-bind="itemOption.bind"
  >
    <template #append>
      <el-button :icon="Search" :disabled="itemOption.disabled" />
    </template>
  </el-input>
  <el-upload
    ref="inputRef"
    v-else-if="itemOption.type === FormTableItemEnum.UPLOAD"
    v-model:file-list="value"
    action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
    multiple
    v-bind="itemOption.bind"
  >
    <el-button type="primary">点击上传</el-button>
  </el-upload>
  <el-image
    v-else-if="itemOption.type === FormTableItemEnum.IMAGE"
    style="width: 100px; height: 100px"
    :src="value"
    :zoom-rate="1.2"
    :max-scale="7"
    :min-scale="0.2"
    :preview-src-list="[value]"
    :initial-index="4"
    fit="cover"
    v-bind="itemOption.bind"
  />
  <bl-select-span
    v-else-if="itemOption.type === FormTableItemEnum.SELECTSPAN"
    v-model="value"
    :select-type="itemOption.selectType"
    :dictionary-code="itemOption.dictionaryCode"
    :select-option="itemOption.selectOption"
    v-bind="itemOption.bind"
  >
  </bl-select-span>
  <bl-code-editor
    v-else-if="itemOption.type === FormTableItemEnum.CODEEDITOR"
    v-model:value="value"
    :language="itemOption.editorType"
  ></bl-code-editor>
</template>

<style scoped lang="scss">
.input-item {
  width: 100%;
}
</style>
