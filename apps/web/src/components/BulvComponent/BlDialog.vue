<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import * as ElIcon from '@element-plus/icons-vue'

export interface BlDialogProps {
  title?: string
  width?: string | number
  defaultFullscreen?: boolean
  onConfirm?: () => Promise<any>
  beforeClose?: () => Promise<any>
  afterClose?: () => Promise<any>
}

const props = withDefaults(defineProps<BlDialogProps>(), {
  title: () => '弹窗',
  width: () => '50%',
})

const isVisible = defineModel<boolean>('visible', { required: true }) // 弹窗显示

const dialogRef = ref<any>(false) // div
const loading = ref<boolean>(false) // 加载状态
const isMinimized = ref<boolean>(false) // 最小化
const isFullscreen = ref<boolean>(false) // 最大化

onMounted(() => {
  if (props.defaultFullscreen) {
    isFullscreen.value = true
  }
})

watch(isVisible, (val: boolean) => {
  if (val) {
    {
      isMinimized.value = false
    }
  }
})

/** 最小化 */
const handleMinimize = () => {
  if (isMinimized.value) {
    isVisible.value = true
  } else {
    isMinimized.value = true
    isVisible.value = false
  }
}

/** 最小化标签关闭 */
const handleRestoreTagClose = () => {
  isMinimized.value = false
}

/** 最大化 */
const handleFullscreen = () => {
  if (isFullscreen.value) {
    isFullscreen.value = false
  } else {
    isFullscreen.value = true
  }
}

/** 关闭 */
const handleClose = async () => {
  if (props.beforeClose) {
    await props.beforeClose() // 关闭前置钩子
  }

  isVisible.value = false

  if (props.afterClose) {
    await props.afterClose() // 关闭后置钩子
  }
}

/** 确定 */
const handleConfirm = async () => {
  if (loading.value) return
  try {
    loading.value = true

    if (props.onConfirm) {
      await props.onConfirm() // 保存事件
    }

    isVisible.value = false
    isMinimized.value = false
  } catch (error) {
    error
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div ref="dialogRef" v-dialog-drag>
      <el-dialog
        :class="{ fullscreen: isFullscreen }"
        v-model="isVisible"
        :title="title"
        :fullscreen="isFullscreen"
        :width="width"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
      >
        <template #header="{ titleId, titleClass }">
          <div class="my-header" @dblclick="handleFullscreen">
            <el-text
              size="large"
              type="primary"
              :id="titleId"
              :class="titleClass"
            >
              {{ title }}
            </el-text>
            <div class="my-header__btn">
              <el-tooltip content="最小化" placement="bottom" :show-after="500">
                <el-button
                  size="small"
                  text
                  :icon="ElIcon.SemiSelect"
                  @click.stop="handleMinimize"
                />
              </el-tooltip>
              <el-tooltip
                :content="isFullscreen ? '还原' : '最大化'"
                placement="bottom"
                :show-after="500"
              >
                <el-button
                  size="small"
                  text
                  :icon="ElIcon.FullScreen"
                  @click.stop="handleFullscreen"
                />
              </el-tooltip>
              <el-tooltip content="关闭" placement="bottom" :show-after="500">
                <el-button
                  @click.stop="handleClose"
                  size="small"
                  text
                  :icon="ElIcon.CloseBold"
                />
              </el-tooltip>
            </div>
          </div>
        </template>
        <slot :fullscreen="isFullscreen" :visible="isVisible"></slot>

        <template #footer>
          <slot name="footer">
            <span class="dialog-footer">
              <el-button @click="handleClose">取消</el-button>
              <el-button
                type="primary"
                @click="handleConfirm"
                :loading="loading"
              >
                确定
              </el-button>
            </span>
          </slot>
        </template>
      </el-dialog>
    </div>
  </Teleport>

  <Teleport to="#restore-tags-wrapper">
    <el-tag
      v-if="isMinimized"
      size="large"
      class="restore-tag"
      closable
      effect="dark"
      @click="handleMinimize"
      @close="handleRestoreTagClose"
      >{{ title }}</el-tag
    >
  </Teleport>
</template>

<style scoped lang="scss">
.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 12px;
  border-radius: var(--el-dialog-border-radius);
  border-bottom: var(--el-color-primary-light-5) 1px solid;
}

.button-box {
  top: 0;
  right: 0;
  position: absolute;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog__body) {
  height: calc(100% - 96px);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.restore-tag {
  user-select: none;
  cursor: pointer;
}
</style>
