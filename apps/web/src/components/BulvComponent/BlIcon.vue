<script setup lang="ts">
import { computed } from 'vue'
interface Props {
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {})

const iconType = computed(() => {
  return props.icon?.split('-')[0] || ''
})

const iconName = computed(() => {
  return props.icon?.split('-')[1] || ''
})

const isValid = computed(() => {
  const regex = /^(El-|Svg-)[a-zA-Z0-9]+$/
  return regex.test(props.icon || '')
})
</script>

<template>
  <span v-if="!isValid"></span>
  <SvgIcon v-else-if="iconType === 'Svg'" :name="iconName" />
  <component v-else :is="iconName" class="el-icon" />
</template>
