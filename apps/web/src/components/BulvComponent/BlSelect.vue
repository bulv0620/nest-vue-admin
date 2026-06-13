<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { SelectOption } from './types/FormTableItemOption'
import { useDictionary } from '@/store/modules/dictionary'
import selectOptionMap from '@/utils/select-options'

export interface BlSelectProps {
  selectType?: 'dict' | 'manual' // 选择框类型
  dictionaryCode?: string // 数据字典编号
  selectOption?: string // 选项配置
}

const props = withDefaults(defineProps<BlSelectProps>(), {
  selectType: () => 'dict',
  selectOption: () => '',
})

const modelValue = defineModel('modelValue', { required: true }) // table双向绑定对象

const dictionaryStore = useDictionary()

const dynamicOptions = ref<SelectOption[]>([])

onMounted(async () => {
  if (props.selectType === 'dict') {
    dynamicOptions.value = await dictionaryStore.getDictionaryByCode(
      props.dictionaryCode as string,
    )
  }
})

const options = computed(() => {
  if (props.selectType === 'manual') {
    return selectOptionMap.get(props.selectOption) || []
  } else {
    return dynamicOptions.value
  }
})
</script>

<template>
  <el-select v-model="modelValue" style="width: 100%">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      :disabled="item.disabled"
    />
  </el-select>
</template>
