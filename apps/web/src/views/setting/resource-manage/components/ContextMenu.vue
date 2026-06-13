<script lang="ts" setup>
import { reactive, ref } from 'vue'
// import type { MenuOptions } from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import { deepClone } from '@/utils/deep-clone'
import {
  ContextMenu,
  // ContextMenuGroup,
  ContextMenuSeparator,
  ContextMenuItem,
} from '@imengyu/vue3-context-menu'
import { ResourceNode, ResourceType } from '@/api/resource/types/resource'

const show = ref<boolean>(false)
const optionsComponent = reactive<any>({
  x: 500,
  y: 200,
})
const node = ref<ResourceNode | null>(null)

const onContextMenu = (e: MouseEvent, data: ResourceNode) => {
  e.preventDefault()
  optionsComponent.x = e.x
  optionsComponent.y = e.y
  show.value = true
  node.value = deepClone(data)
}

const emits = defineEmits(['add', 'update', 'remove', 'refresh'])

const handleAdd = () => {
  emits('add', node.value)
}

const handleUpdate = () => {
  emits('update', node.value)
}

const handleRemove = () => {
  emits('remove', node.value)
}

const handleRefresh = () => {
  emits('refresh')
}

defineExpose({ onContextMenu })
</script>

<template>
  <context-menu v-model:show="show" :options="optionsComponent">
    <context-menu-item
      label="新增子项"
      :disabled="node?.type === ResourceType.URL"
      @click="handleAdd"
    >
      <template #icon>
        <el-icon><Plus /></el-icon>
      </template>
    </context-menu-item>
    <context-menu-separator />
    <context-menu-item
      label="编辑资源"
      @click="handleUpdate"
      :disabled="node?.root"
    >
      <template #icon>
        <el-icon><EditPen /></el-icon>
      </template>
    </context-menu-item>
    <context-menu-item
      label="删除资源"
      @click="handleRemove"
      :disabled="node?.root"
    >
      <template #icon>
        <el-icon><Delete /></el-icon>
      </template>
    </context-menu-item>
    <context-menu-item
      label="刷新列表"
      @click="handleRefresh"
      :disabled="node?.root"
    >
      <template #icon>
        <el-icon><Refresh /></el-icon>
      </template>
    </context-menu-item>
  </context-menu>
</template>
