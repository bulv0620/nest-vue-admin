<script lang="ts" setup>
import BlIcon from './BlIcon.vue'
import * as ElIcon from '@element-plus/icons-vue'

const modelValue = defineModel('modelValue', { required: true }) // table双向绑定对象
</script>

<template>
  <el-input v-model="modelValue" style="width: 100%">
    <template #prefix>
      <bl-icon :icon="modelValue"></bl-icon>
    </template>
    <template #append>
      <el-popover placement="bottom-end" :width="240" trigger="hover">
        <el-scrollbar height="200px">
          <div class="icon-wrapper">
            <div
              class="icon-item"
              v-for="icon in ElIcon"
              :key="icon.name"
              text
              bg
              @click="modelValue = `El-${icon.name}`"
            >
              <component :is="icon" class="el-icon" />
            </div>
          </div>
        </el-scrollbar>
        <template #reference>
          <el-button>选择</el-button>
        </template>
      </el-popover>
    </template>
  </el-input>
</template>

<style lang="scss" scoped>
.icon-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .icon-item {
    width: 36px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 8px;

    &:hover {
      background-color: #eee;
    }
  }
}
</style>
