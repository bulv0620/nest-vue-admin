<script lang="ts" setup>
import { useTheme } from '@/hooks/useTheme'
import { Sunny, Moon } from '@element-plus/icons-vue'

const { activeThemeName, setTheme } = useTheme()
</script>

<template>
  <div @click="setTheme(activeThemeName === 'dark' ? 'normal' : 'dark')">
    <el-tooltip effect="dark" content="切换主题" placement="bottom">
      <el-icon :size="20">
        <transition name="slide">
          <Sunny v-if="activeThemeName === 'normal'" />
          <Moon v-else />
        </transition>
      </el-icon>
    </el-tooltip>
  </div>
</template>

<style scoped>
.slide-enter-from {
  display: none;
  transform: translateY(50%);
}
.slide-enter-active {
  display: block;
  transition: transform 0.3s;
}
.slide-enter-to {
  transform: translateY(0);
}
.slide-leave-from {
  display: block;
}
.slide-leave-to {
  display: none;
}
</style>
