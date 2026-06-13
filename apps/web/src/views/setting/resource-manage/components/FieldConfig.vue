<script setup lang="ts">
import { ResourceNode, ResourceType } from '@/api/resource/types/resource'
import { computed, nextTick, ref, watch } from 'vue'
import BlIcon from '@/components/BulvComponent/BlIcon.vue'
import { Field } from '@/api/field/types/field'
import BlTableCard from '@/components/BulvComponent/BlTableCard.vue'
import BlFormCard from '@/components/BulvComponent/BlFormCard.vue'
import {
  TableButtonEventParam,
  TableButtonHandler,
} from '@/components/BulvComponent/types/TableButtonHandler'
import { FormTableItemEnum } from '@/enums/FormTableItemEnum'
import { FormTableItemOption } from '@/components/BulvComponent/types/FormTableItemOption'
import { reqGetField, reqUpdateField } from '@/api/field'
import SetGroup from './SetGroup.vue'
import { ElMessage } from 'element-plus/es'

export interface FieldConfigProps {
  currentNode?: ResourceNode
}

const props = withDefaults(defineProps<FieldConfigProps>(), {})

//#region 配置项
const loading = ref(false)

const setGroupRef = ref<any>(null)

const fieldList = ref<Field[]>([])

const activeName = ref('')

const activeField = computed(() => {
  return fieldList.value.find((item) => item.fieldGroup === activeName.value)
})

watch(
  () => props.currentNode,
  () => {
    getCurrentFieldList()
  },
)

const getCurrentFieldList = async () => {
  try {
    loading.value = true

    if (!props.currentNode) return

    const { data } = await reqGetField({
      fieldCode: props.currentNode.id,
    })

    fieldList.value = data

    if (!data.length) {
      fieldList.value = [
        {
          fieldGroup: 'form',
          fieldType: 'form',
          fields: [],
        },
        {
          fieldGroup: 'table',
          fieldType: 'table',
          fields: [],
        },
        {
          fieldGroup: 'button',
          fieldType: 'button',
          fields: [],
        },
      ]
    }

    for (const group of fieldList.value) {
      for (const row of group.fields) {
        if (row.bind) {
          try {
            row.bind = JSON.stringify(row.bind)
          } catch (error) {
            ElMessage.error('bind字段JSON解析失败')
            throw error
          }
        }
      }
    }

    activeName.value = fieldList.value[0].fieldGroup

    currentRow.value = null
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const parseJson = (value: string) => {
  try {
    return JSON.parse(value || '{}')
  } catch (error) {
    ElMessage.error('bind字段JSON解析失败')
    throw error
  }
}

const updateCurrentField = async () => {
  if (!props.currentNode) return

  try {
    loading.value = true

    await blTableRef.value?.validate()
    await blFormRef.value?.validate()

    const payload = {
      fieldCode: props.currentNode!.id,
      fieldList: fieldList.value.map((field) => ({
        ...field,
        fieldCode: props.currentNode!.id,
        fields: field.fields.map((el) => {
          const parseBindJson = parseJson(el.bind)

          return {
            ...el,
            bind: parseBindJson,
          }
        }),
      })),
    }

    await reqUpdateField(payload)

    ElMessage.success('更新成功')

    nextTick(() => {
      getCurrentFieldList()
    })
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const setGroups = async () => {
  try {
    const data = await setGroupRef.value.openInit(fieldList.value)
    fieldList.value = data
  } catch (error) {
    error
  }
}
//#endregion

//#region table
const blTableRef = ref<any>(null)

const tableData = computed(() => {
  if (activeField.value) {
    return activeField.value.fields
  } else {
    return []
  }
})

const currentRow = ref<FormTableItemOption | null>(null)

const tableOption = ref<FormTableItemOption[]>([
  {
    id: 1,
    label: '字段名称',
    prop: 'label',
    type: FormTableItemEnum.INPUT,
    required: true,
  },
  {
    id: 2,
    label: '字段属性',
    prop: 'prop',
    required: true,
    type: FormTableItemEnum.INPUT,
  },
  {
    id: 3,
    label: '禁用',
    prop: 'disabled',
    type: FormTableItemEnum.SELECT,
    selectType: 'manual',
    selectOption: 'boolSelect',
  },
  {
    id: 3,
    label: '显示',
    prop: 'visible',
    type: FormTableItemEnum.SELECT,
    selectType: 'manual',
    selectOption: 'boolSelect',
  },
])

const buttonOption = ref<FormTableItemOption[]>([
  {
    id: 3,
    label: '删除',
    position: 'tableColumn',
    prop: 'handleDeleteRow',
    type: FormTableItemEnum.BUTTON,
    bind: {
      type: 'danger',
      plain: true,
    },
  },
])

const handleDeleteRow = async (
  params: TableButtonEventParam<FormTableItemOption>,
) => {
  if (params.row === currentRow.value) {
    blTableRef.value?.setCurrent()
    currentRow.value = null
  }
  tableData.value.splice(params.rowIndex!, 1)
}

const handleAddRow = () => {
  tableData.value.push({} as any)
}

const handleCurrentRowChange = (val: FormTableItemOption) => {
  currentRow.value = val
}

const buttonHandler: TableButtonHandler<FormTableItemOption> = {
  handleDeleteRow,
}

//#endregion

//#region form
const blFormRef = ref<any>(null)
const inputTypeArr = [
  FormTableItemEnum.DATEPICKER,
  FormTableItemEnum.ICONINPUT,
  FormTableItemEnum.INPUT,
  FormTableItemEnum.SEARCHINPUT,
  FormTableItemEnum.SELECT,
  FormTableItemEnum.SLOT,
]

const formOption = computed<FormTableItemOption[]>(() => {
  if (!activeField.value) return []
  if (!currentRow.value) return []

  const dynamicOptions: FormTableItemOption[] = [
    {
      id: 0,
      label: '字段类型',
      prop: 'type',
      span: 24,
      required: true,
      type: FormTableItemEnum.SELECT,
      selectType: 'dict',
      dictionaryCode: 'FORM_TABLE_ITEM_TYPE',
    },
  ]

  if (inputTypeArr.includes(currentRow.value.type)) {
    const arr: FormTableItemOption[] = [
      {
        id: 1,
        label: '必填项',
        prop: 'required',
        span: 24,
        required: true,
        type: FormTableItemEnum.SELECT,
        selectType: 'manual',
        selectOption: 'boolSelect',
      },
      {
        id: 2,
        label: '占位符',
        prop: 'placeholder',
        span: 24,
        required: false,
        type: FormTableItemEnum.INPUT,
      },
      {
        id: 3,
        label: '默认值',
        prop: 'defaultValue',
        span: 24,
        required: false,
        type: FormTableItemEnum.INPUT,
      },
    ]
    dynamicOptions.push(...arr)
  }

  if (activeField.value.fieldType === 'form') {
    const arr: FormTableItemOption[] = [
      {
        id: 4,
        label: '标签宽度',
        prop: 'labelWidth',
        span: 24,
        required: false,
        type: FormTableItemEnum.INPUT,
      },
      {
        id: 5,
        label: '占位数量',
        prop: 'span',
        span: 24,
        required: false,
        type: FormTableItemEnum.INPUT,
        bind: {
          type: 'number',
        },
      },
    ]
    dynamicOptions.push(...arr)
  }

  if (activeField.value.fieldType === 'table') {
    const arr: FormTableItemOption[] = [
      {
        id: 6,
        label: '对齐方式',
        prop: 'align',
        span: 24,
        required: false,
        defaultValue: 'left',
        type: FormTableItemEnum.SELECT,
        selectType: 'dict',
        dictionaryCode: 'TABLE_ALIGN',
      },
      {
        id: 7,
        label: '列宽',
        prop: 'width',
        span: 24,
        required: false,
        type: FormTableItemEnum.INPUT,
      },
    ]
    dynamicOptions.push(...arr)
  }

  if (
    currentRow.value.type === FormTableItemEnum.SELECT ||
    currentRow.value.type === FormTableItemEnum.SELECTSPAN
  ) {
    const arr: FormTableItemOption[] = [
      {
        id: 8,
        label: '选择类型',
        prop: 'selectType',
        span: 24,
        required: true,
        type: FormTableItemEnum.SELECT,
        selectType: 'dict',
        dictionaryCode: 'SELECT_TYPE',
      },
    ]

    if (currentRow.value.selectType === 'dict') {
      arr.push({
        id: 9,
        label: '字典名称',
        prop: 'dictionaryCode',
        span: 24,
        required: true,
        type: FormTableItemEnum.INPUT,
      })
    }

    if (currentRow.value.selectType === 'manual') {
      arr.push({
        id: 10,
        label: '选项配置',
        prop: 'selectOption',
        span: 24,
        required: true,
        type: FormTableItemEnum.INPUT,
      })
    }

    dynamicOptions.push(...arr)
  }

  if (currentRow.value.type === FormTableItemEnum.BUTTON) {
    const arr: FormTableItemOption[] = [
      {
        id: 11,
        label: '按钮位置',
        prop: 'position',
        span: 24,
        required: true,
        type: FormTableItemEnum.SELECT,
        selectType: 'dict',
        dictionaryCode: 'BUTTON_POSITION',
      },
      {
        id: 12,
        label: '图标',
        prop: 'icon',
        span: 24,
        required: false,
        type: FormTableItemEnum.ICONINPUT,
      },
      {
        id: 13,
        label: '按钮类型',
        prop: 'buttonType',
        span: 24,
        required: true,
        type: FormTableItemEnum.SELECT,
        selectType: 'dict',
        dictionaryCode: 'BUTTON_TYPE',
      },
    ]
    dynamicOptions.push(...arr)
  }

  if (currentRow.value.type === FormTableItemEnum.CODEEDITOR) {
    const arr: FormTableItemOption[] = [
      {
        id: 14,
        label: '代码类型',
        prop: 'editorType',
        span: 24,
        required: true,
        type: FormTableItemEnum.INPUT,
      },
    ]
    dynamicOptions.push(...arr)
  }

  dynamicOptions.push({
    id: 15,
    label: 'bind',
    prop: 'bind',
    span: 24,
    required: false,
    type: FormTableItemEnum.CODEEDITOR,
    editorType: 'json',
  })

  return dynamicOptions
})

watch(formOption, () => {
  setTimeout(() => {
    blFormRef.value?.clearValidate()
  })
})
//#endregion
</script>

<template>
  <el-card
    v-loading="loading"
    body-class="config-card"
    style="flex: 1"
    shadow="never"
  >
    <set-group ref="setGroupRef"></set-group>
    <div
      v-if="
        !currentNode ||
        currentNode.root ||
        currentNode.type === ResourceType.MENU
      "
      class="config-empty"
    >
      <el-empty description="请选择资源模块"></el-empty>
    </div>
    <div v-else class="config-content">
      <div class="config-header">
        <el-button @click="setGroups">
          <bl-icon icon="El-Setting"></bl-icon>
        </el-button>
        <el-radio-group v-model="activeName">
          <el-radio-button
            v-for="(item, index) in fieldList"
            :key="index"
            :label="item.fieldGroup"
            :value="item.fieldGroup"
          />
        </el-radio-group>
      </div>
      <el-divider />
      <div v-if="!activeField" class="config-body empty">
        <el-empty description="请设置资源组"></el-empty>
      </div>
      <div v-else class="config-body">
        <div class="config-options">
          <el-button type="primary" @click="handleAddRow">新增</el-button>
          <div class="right">
            <el-button type="primary" @click="updateCurrentField">
              保存
            </el-button>
            <el-button @click="getCurrentFieldList">重置</el-button>
          </div>
        </div>

        <div class="config-main">
          <BlTableCard
            ref="blTableRef"
            v-model:data="tableData"
            :table-option="tableOption"
            table-layout="cover"
            :button-option="buttonOption"
            :button-handler="buttonHandler"
            enable-radio-selection
            @current-row-change="handleCurrentRowChange"
          >
          </BlTableCard>
          <BlFormCard
            v-if="currentRow"
            ref="blFormRef"
            style="width: 35%"
            :form-option="formOption"
            :form-model="currentRow"
            height="660"
          >
          </BlFormCard>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.config-card) {
  padding: 0;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  height: 100%;

  .config-empty {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .config-content {
    width: 100%;
    height: 100%;
    padding: 12px 18px;

    .config-header {
      display: flex;
      // background: #000;
      align-items: center;
      gap: 12px;
    }

    .config-body {
      height: calc(100% - 58px);

      &.empty {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .config-options {
        display: flex;
        justify-content: space-between;
      }

      .config-main {
        height: calc(100% - 32px);
        padding-top: 12px;
        display: flex;
        gap: 12px;
      }
    }
  }
}
:deep(.el-divider--horizontal) {
  margin: 12px 0 !important;
}
</style>
