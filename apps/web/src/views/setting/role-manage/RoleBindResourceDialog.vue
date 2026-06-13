<script lang="ts" setup>
import { ResourceNode } from '@/api/resource/types/resource'
import { reqBindResourcesToRole, reqFindResources } from '@/api/role'
import { User } from '@/api/user/types/user'
import BlDialog from '@/components/BulvComponent/BlDialog.vue'
import BlFormCard from '@/components/BulvComponent/BlFormCard.vue'
import { FormTableItemOption } from '@/components/BulvComponent/types/FormTableItemOption'
import { useDynamicField } from '@/hooks/useDynamicField'
import { ElMessage } from 'element-plus'
import { computed, nextTick, ref } from 'vue'

const emits = defineEmits(['success'])

const title = ref<string>('角色绑定资源')
const visible = ref<boolean>(false)

const blFormRef = ref<any>(null)
const formModel = ref<User>({})

const { dynamicOptions } = useDynamicField(31)
const formOption = computed<FormTableItemOption[]>(() => {
  return dynamicOptions.value.form?.fields || []
})

//#region 角色资源
const treeRef = ref<any>(null)
const resourceTree = ref<ResourceNode[]>([])
const defaultProps = {
  children: 'children',
  label: (data: ResourceNode) => `${data.id} - ${data.title}`,
} as any

const filterAvailableItems = (array: ResourceNode[]): ResourceNode[] => {
  return array.reduce((acc: ResourceNode[], item: ResourceNode) => {
    // 如果当前项的available属性为true，将其加入结果数组中
    if (item.available === true && (!item.children || !item.children.length)) {
      acc.push(item)
    }

    // 如果当前项有子项，递归调用这个函数处理子项
    if (item.children && item.children.length > 0) {
      const filteredChildren = filterAvailableItems(item.children)
      // 将子项展开为一维数组
      acc = acc.concat(filteredChildren)
    }

    return acc
  }, [])
}
//#endregion

const openInit = async (data: User) => {
  visible.value = true

  formModel.value = { ...data }

  const result = await reqFindResources(data)
  resourceTree.value = result.data

  setTimeout(() => {
    const availableItems = filterAvailableItems(result.data)
    treeRef.value?.setCheckedNodes(availableItems)
  })

  nextTick(() => {
    blFormRef.value?.clearValidate()
  })
}

const handleConfirm = async () => {
  await blFormRef.value.validate()

  const resources = treeRef.value?.getCheckedNodes(false, true)

  const payload = {
    roleId: formModel.value.id as number,
    resourceIds: resources.map((el: ResourceNode) => el.id),
  }

  await reqBindResourcesToRole(payload)

  ElMessage.success('保存成功')

  emits('success')
}

defineExpose({ openInit })
</script>

<template>
  <bl-dialog
    v-model:visible="visible"
    width="624px"
    :title="title"
    :on-confirm="handleConfirm"
  >
    <template #default="{ fullscreen }">
      <bl-form-card
        ref="blFormRef"
        :form-option="formOption"
        :form-model="formModel"
      >
      </bl-form-card>

      <el-card style="flex: 1; height: 100%" shadow="never">
        <el-scrollbar :height="fullscreen ? '100%' : '30vh'">
          <el-tree
            ref="treeRef"
            node-key="id"
            :data="resourceTree"
            :props="defaultProps"
            :expand-on-click-node="false"
            default-expand-all
            show-checkbox
          />
        </el-scrollbar>
      </el-card>
    </template>
  </bl-dialog>
</template>

<style scoped lang="scss">
:deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
