<script lang="ts" setup generic="T extends object">
import { computed, ref } from 'vue'
import BlFormTableItem from './BlFormTableItem.vue'
import { FormTableItemEnum } from '@/enums/FormTableItemEnum'
import type { FormTableItemOption } from './types/FormTableItemOption.ts'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, FormInstance } from 'element-plus'

export interface BlFormCardProps {
  formOption: Array<FormTableItemOption> // form配置
  height?: number | string // 限制高度
  labelPosition?: 'left' | 'top' | 'right' // form item标签位置
  enableQueryControl?: boolean // 启用查询控件
  queryMethod?: () => Promise<void> // 查询函数
}

const props = withDefaults(defineProps<BlFormCardProps>(), {
  labelPosition: () => 'left',
  enableQueryControl: () => false,
})

const model = defineModel<T>('formModel', { required: true }) // form双向绑定对象

//#region 表单校验 & 表单操作
const formRef = ref<FormInstance>()

const rules = computed(() => {
  const obj: any = {}

  props.formOption.forEach((formItem) => {
    if (
      formItem.required &&
      ![
        FormTableItemEnum.BUTTON,
        FormTableItemEnum.SPAN,
        FormTableItemEnum.IMAGE,
        FormTableItemEnum.SELECTSPAN,
      ].includes(formItem.type)
    ) {
      obj[formItem.prop] = [
        {
          required: true,
          message: `请填写${formItem.label}`,
          trigger: 'change',
        },
      ]
    }
    if (formItem.rules) {
      obj[formItem.prop].push(...formItem.rules)
    }
  })

  return obj
})

const validate = () => {
  return formRef.value?.validate()
}

const resetFields = () => {
  return formRef.value?.resetFields()
}

const clearValidate = () => {
  return formRef.value?.clearValidate()
}

defineExpose({
  validate,
  resetFields,
  clearValidate,
})
//#endregion

//#region 查询操作
const searchLoading = ref(false)

const handleReset = () => {
  resetFields()
}

const handleSearch = async () => {
  try {
    searchLoading.value = true

    await validate()

    if (props.queryMethod) {
      await props.queryMethod()
    } else {
      ElMessage.warning('未定义查询函数')
    }
  } catch (error) {
    console.error(error)
    // throw error
  } finally {
    searchLoading.value = false
  }
}
//#endregion
</script>

<template>
  <el-card shadow="never">
    <el-scrollbar :height="height">
      <el-form
        ref="formRef"
        :model="model"
        :rules="rules"
        :label-position="labelPosition"
        scroll-to-error
      >
        <el-row :gutter="12" style="width: 100%">
          <el-col
            v-for="formItem in formOption"
            :key="formItem.id"
            :span="Number(formItem.span) || 8"
          >
            <el-form-item
              :prop="formItem.prop"
              :label="formItem.label"
              :label-width="formItem.labelWidth || 80"
            >
              <slot
                v-if="formItem.type === FormTableItemEnum.SLOT"
                :name="formItem.prop"
                :form="model"
                :prop="formItem.prop"
              ></slot>
              <BlFormTableItem
                v-else
                v-model:value="(model as any)[formItem.prop]"
                :item-option="formItem"
              ></BlFormTableItem>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="enableQueryControl">
            <el-form-item>
              <el-button
                type="primary"
                :icon="Search"
                @click="handleSearch"
                :loading="searchLoading"
              >
                查询
              </el-button>
              <el-button
                :icon="Refresh"
                @click="handleReset"
                :loading="searchLoading"
              >
                重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-scrollbar>
  </el-card>
</template>

<style lang="scss" scoped></style>
