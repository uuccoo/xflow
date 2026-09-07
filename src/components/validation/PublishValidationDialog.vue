<script setup>
import { ref } from 'vue'
import { useBasicSettingsStore } from '@/stores/basicSettingsStore'
import { useFormDesignStore } from '@/stores/formDesignStore'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import { validateBasicSettings } from '@/validation/basicSettingsValidator'
import { validateFormDesign } from '@/validation/formDesignValidator'
import { validateFlowDesign } from '@/validation/flow'

const emit = defineEmits(['fix'])

const errors = ref([])
const dialogVisible = ref(false)

const check = () => {
  const basicSettingsStore = useBasicSettingsStore()
  const formDesignStore = useFormDesignStore()
  const flowDesignStore = useFlowDesignStore()

  const basicSettingErrors = validateBasicSettings(basicSettingsStore.basicSettings)
  const formDesignErrors = validateFormDesign(formDesignStore.formItems)
  const flowErrors = validateFlowDesign(flowDesignStore.flowData)
  errors.value = [...basicSettingErrors, ...formDesignErrors, ...flowErrors]

  if (errors.value.length > 0) {
    dialogVisible.value = true
    return errors.value
  }

  dialogVisible.value = false
  return []
}

const handleFix = (error) => {
  emit('fix', error)
  dialogVisible.value = false
}

defineExpose({
  check,
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="发布失败"
    width="620px"
    center
    :close-on-click-modal="false"
    :show-close="true"
  >
    <div class="publish-error-wrapper">
      <p class="publish-error-title">以下内容不完善：</p>
      <el-table :data="errors" border stripe style="width: 100%">
        <el-table-column prop="module" label="所属模块" width="120" />
        <el-table-column prop="message" label="问题描述" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button link type="primary" @click="handleFix(scope.row)">
              去修改
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.publish-error-wrapper {
  .publish-error-title {
    margin: 0 0 16px;
    font-size: 14px;
    color: #606266;
  }
}
</style>
