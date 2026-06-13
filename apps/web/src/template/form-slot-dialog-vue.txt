<script lang="ts" setup>
import { reqGetRoleList } from '@/api/role'
import { Role } from '@/api/role/types/role'
import { reqBindRolesToUser, reqFindRoles } from '@/api/user'
import { User } from '@/api/user/types/user'
import BlDialog from '@/components/BulvComponent/BlDialog.vue'
import BlFormCard from '@/components/BulvComponent/BlFormCard.vue'
import { FormTableItemOption } from '@/components/BulvComponent/types/FormTableItemOption'
import { useDynamicField } from '@/hooks/useDynamicField'
import { ElMessage } from 'element-plus'
import { computed, nextTick, ref } from 'vue'

const emits = defineEmits(['success'])

const title = ref<string>('用户绑定角色')
const visible = ref<boolean>(false)

const blFormRef = ref<any>(null)
const formModel = ref<User>({})

const { dynamicOptions } = useDynamicField(28)
const formOption = computed<FormTableItemOption[]>(() => {
  return dynamicOptions.value.form?.fields || []
})

//#region 用户角色
const currentRoles = ref<number[]>([])
const allRoles = ref<Role[]>([])
//#endregion

const openInit = async (data: User) => {
  visible.value = true

  formModel.value = { ...data }

  const userDetail = await reqFindRoles(data)

  if (userDetail.data.roles) {
    currentRoles.value = userDetail.data.roles.map(
      (el: Role) => el.id as number,
    )
  }

  const roles = await reqGetRoleList()

  allRoles.value = roles.data

  nextTick(() => {
    blFormRef.value?.clearValidate()
  })
}

const handleConfirm = async () => {
  await blFormRef.value.validate()

  const payload = {
    userId: formModel.value.id as number,
    roleIds: currentRoles.value,
  }

  await reqBindRolesToUser(payload)

  ElMessage.success('保存成功')

  emits('success')
}

defineExpose({ openInit })
</script>

<template>
  <bl-dialog
    v-model:visible="visible"
    width="888px"
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
        <el-transfer
          :style="fullscreen ? 'height: 100%; flex: 1' : 'height: 30vh'"
          v-model="currentRoles"
          :data="allRoles"
          filterable
          :props="{
            key: 'id',
            label: 'roleName',
          }"
          :titles="['未分配', '已分配']"
        >
          <template #default="{ option }">
            <span>{{ option.roleName }}({{ option.description }})</span>
          </template>
        </el-transfer>
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
