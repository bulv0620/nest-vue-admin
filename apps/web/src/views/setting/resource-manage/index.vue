<script setup lang="ts">
import { ElMessageBox, ElTree } from 'element-plus'
import { ref, onMounted, watch } from 'vue'
import ContextMenu from './components/ContextMenu.vue'
import { ResourceType, type ResourceNode } from '@/api/resource/types/resource'
import { reqGetResourceList, reqRemoveResource } from '@/api/resource/index'
import { Search } from '@element-plus/icons-vue'
import ResourceAdd from './components/ResourceAdd.vue'
import FieldConfig from './components/FieldConfig.vue'

defineOptions({
  name: 'ResourceManage',
})

const loading = ref<boolean>(false)

//#region 资源树
const resourceTree = ref<ResourceNode[]>([
  {
    id: 0,
    root: true,
    resourceName: 'Root',
    title: 'Root',
    path: '',
    component: '',
    order: 0,
    icon: '',
    type: ResourceType.MENU,
    children: [],
    parent: null,
  },
])
const defaultProps = {
  children: 'children',
  label: (data: ResourceNode) => `${data.id} - ${data.title}`,
} as any

const getResourceTree = async () => {
  try {
    loading.value = true

    const result = await reqGetResourceList()

    if (currentNode.value) {
      const id = currentNode.value?.id
      setTimeout(() => {
        treeRef.value?.setCurrentKey(id)
      })
    }

    resourceTree.value[0].children = result.data
    currentNode.value = undefined
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getResourceTree()
})
//#endregion

//#region 树过滤
const filterText = ref<string>('')

const treeRef = ref<InstanceType<typeof ElTree>>()

const filterNode: any = (value: string, data: ResourceNode) => {
  if (!value) return true
  return data.title.includes(value)
}

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})
//#endregion

//#region 树选中
const currentNode = ref<ResourceNode | undefined>(undefined)

const currentChange = (data: ResourceNode) => {
  currentNode.value = data
}
//#endregion

//#region 树右键弹窗
const removeLoading = ref<boolean>(false)
const contextMenuRef = ref<any>(false)
const resourceAddRef = ref<any>(null)

const handleShowNodeMenu = (event: MouseEvent, data: ResourceNode) => {
  contextMenuRef.value?.onContextMenu(event, data)
}

const handleAdd = (data: ResourceNode) => {
  resourceAddRef.value.openInit('add', data)
}

const handleUpdate = (data: ResourceNode) => {
  resourceAddRef.value.openInit('update', data)
}

const handleRemove = async (data: ResourceNode) => {
  if (removeLoading.value) return
  try {
    removeLoading.value = true

    await ElMessageBox.confirm(`确认删除资源: ${data.title} ?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await reqRemoveResource([data.id])
    getResourceTree()
  } catch (error) {
    console.error(error)
  } finally {
    removeLoading.value = false
  }
}
//#endregion
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" body-class="resource-card">
      <div class="resource-operation">
        <el-input
          v-model="filterText"
          placeholder="输入关键词"
          :prefix-icon="Search"
        />
      </div>
      <el-scrollbar height="100%">
        <el-tree
          ref="treeRef"
          class="filter-tree"
          :data="resourceTree"
          :props="defaultProps"
          node-key="id"
          highlight-current
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          empty-text="暂无资源目录"
          @current-change="currentChange"
          @node-contextmenu="handleShowNodeMenu"
        />
      </el-scrollbar>
    </el-card>
    <field-config :current-node="currentNode"></field-config>
    <ContextMenu
      ref="contextMenuRef"
      @add="handleAdd"
      @update="handleUpdate"
      @remove="handleRemove"
      @refresh="getResourceTree"
    />
    <ResourceAdd ref="resourceAddRef" @success="getResourceTree"> </ResourceAdd>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  display: flex;
  gap: 20px;
  overflow: auto;

  :deep(.resource-card) {
    height: 100%;
    padding: 12px 8px;
    width: 250px;
    display: flex;
    flex-direction: column;

    .resource-operation {
      // height: 40px;
      margin-bottom: 12px;
    }
  }
}
</style>
