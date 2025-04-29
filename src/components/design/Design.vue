<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBasicSettingsStore } from '../../stores/basicSettingsStore'
import { useFormDesignStore } from '../../stores/formDesignStore'
import { useFlowDesignStore } from '../../stores/flowDesignStore'
import { useMoreSettingsStore } from '../../stores/moreSettingsStore'
// 导入API
import { formApi } from '@/api'

const route = useRoute()
const router = useRouter()
const basicSettingsStore = useBasicSettingsStore()
const formDesignStore = useFormDesignStore()
const flowDesignStore = useFlowDesignStore()
const moreSettingsStore = useMoreSettingsStore()

// 根据当前路径计算活动菜单项
const defaultActive = computed(() => {
  const path = route.path
  // 从路径中提取最后一部分作为活动菜单项（例如 /design/formDesign -> formDesign）
  const parts = path.split('/')
  return parts[parts.length - 1] || 'basicSettings'
})

// 是否正在发布
const publishing = ref(false)
// 是否正在加载
const loading = ref(false)

// 加载对话框相关
const loadDialogVisible = ref(false)
const inputJsonData = ref('')
const formIdInput = ref('')
const loadMethod = ref('json') // 'json' 或 'api'

// 打开加载对话框
const openLoadDialog = () => {
  loadDialogVisible.value = true
  loadMethod.value = 'json'
  inputJsonData.value = ''
  formIdInput.value = ''
}

// 确认加载数据
const confirmLoadData = async () => {
  if (loadMethod.value === 'json') {
    if (!inputJsonData.value.trim()) {
      ElMessage.warning('请输入JSON数据')
      return
    }

    try {
      const data = JSON.parse(inputJsonData.value)
      if (loadExistingData(data)) {
        loadDialogVisible.value = false
      }
    } catch (error) {
      ElMessage.error('JSON解析错误: ' + error.message)
    }
  } else if (loadMethod.value === 'api') {
    if (!formIdInput.value.trim()) {
      ElMessage.warning('请输入表单ID')
      return
    }

    loading.value = true
    try {
      const result = await formApi.getFormDetail(formIdInput.value.trim())
      if (result && result.data) {
        if (loadExistingData(result.data)) {
          loadDialogVisible.value = false
        }
      } else {
        ElMessage.error('未找到表单数据')
      }
    } catch (error) {
      console.error('从API加载数据失败:', error)
      ElMessage.error('加载失败: ' + (error.message || '未知错误'))
    } finally {
      loading.value = false
    }
  }
}

// 加载已有数据
const loadExistingData = (data) => {
  if (!data) {
    ElMessage.error('无效的数据结构')
    return false
  }

  loading.value = true

  try {
    // 加载基础设置
    if (data.basicSettings) {
      // 图标和颜色
      if (data.basicSettings.iconColor) {
        basicSettingsStore.iconColor = data.basicSettings.iconColor
      }
      if (data.basicSettings.selectedIcon) {
        basicSettingsStore.selectedIcon = data.basicSettings.selectedIcon
      }

      // 表单信息
      if (data.basicSettings.formInfo) {
        Object.assign(basicSettingsStore.formInfo, data.basicSettings.formInfo)
      }

      // 发起人设置
      if (data.basicSettings.initiatorScope) {
        basicSettingsStore.initiatorScope = data.basicSettings.initiatorScope
      }
      if (data.basicSettings.selectedInitiators) {
        basicSettingsStore.selectedInitiators = [...data.basicSettings.selectedInitiators]
      }

      // 管理员设置
      if (data.basicSettings.adminScope) {
        basicSettingsStore.adminScope = data.basicSettings.adminScope
      }
      if (data.basicSettings.selectedAdmins) {
        basicSettingsStore.selectedAdmins = [...data.basicSettings.selectedAdmins]
      }
    }

    // 加载表单设计数据
    if (data.formDesign && data.formDesign.formItems) {
      formDesignStore.formItems = [...data.formDesign.formItems]
    }

    // 加载流程设计数据
    if (data.flowDesign) {
      flowDesignStore.importFlowData(data.flowDesign)
    }

    // 加载更多设置数据
    if (data.moreSettings) {
      Object.assign(moreSettingsStore.settings, data.moreSettings)
    }

    ElMessage.success('数据加载成功')
    return true
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败: ' + error.message)
    return false
  } finally {
    loading.value = false
  }
}

// 预览和发布功能
const preview = () => {
  // 实现预览功能
}

const publish = async () => {
  // 设置发布状态
  publishing.value = true

  try {
    // 收集所有数据
    const finalData = {
      // 基础设置数据
      basicSettings: {
        iconColor: basicSettingsStore.iconColor,
        selectedIcon: basicSettingsStore.selectedIcon,
        formInfo: { ...basicSettingsStore.formInfo },
        initiatorScope: basicSettingsStore.initiatorScope,
        selectedInitiators: [...basicSettingsStore.selectedInitiators],
        adminScope: basicSettingsStore.adminScope,
        selectedAdmins: [...basicSettingsStore.selectedAdmins]
      },

      // 表单设计数据
      formDesign: {
        formItems: [...formDesignStore.formItems]
      },

      // 流程设计数据
      flowDesign: flowDesignStore.exportFlowData(),

      // 更多设置数据
      moreSettings: { ...moreSettingsStore.settings },

      // 元数据
      metadata: {
        publishTime: new Date().toISOString(),
        version: '1.0.0'
      }
    }

    // 使用API发布表单
    const formId = basicSettingsStore.formInfo.id
    let result

    if (formId) {
      // 更新已有表单
      result = await formApi.updateForm(formId, finalData)
    } else {
      // 创建新表单
      result = await formApi.saveForm(finalData)
    }

    // 更新表单ID
    if (result.data && result.data.id) {
      basicSettingsStore.formInfo.id = result.data.id
    }

    ElMessage({
      type: 'success',
      message: '表单已成功发布',
      duration: 3000
    })
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败: ' + (error.message || '未知错误'))
  } finally {
    // 重置发布状态
    publishing.value = false
  }
}

// 页面加载时，检查URL是否包含表单ID，如果有则自动加载
onMounted(async () => {
  const formId = route.query.id
  if (formId) {
    try {
      loading.value = true
      const result = await formApi.getFormDetail(formId)
      if (result && result.data) {
        loadExistingData(result.data)
        // 更新URL，移除ID参数，避免刷新重复加载
        router.replace({ query: {} })
      }
    } catch (error) {
      console.error('加载表单数据失败:', error)
      ElMessage.error('加载表单数据失败: ' + (error.message || '未知错误'))
    } finally {
      loading.value = false
    }
  }
})
</script>

<template>
  <header>
    <el-menu :default-active="defaultActive" active-text-color="#409eff" mode="horizontal" :ellipsis="false"
      :router="true">
      <el-menu-item index="basicSettings" route="/design/basicSettings">基础设置</el-menu-item>
      <el-menu-item index="formDesign" route="/design/formDesign">表单设计</el-menu-item>
      <el-menu-item index="flowDesign" route="/design/flowDesign">流程设计</el-menu-item>
      <el-menu-item index="moreSettings" route="/design/moreSettings">更多设置</el-menu-item>
    </el-menu>
    <div class="publish">
      <el-button size="small" @click="openLoadDialog">加载</el-button>
      <el-button size="small" @click="preview">预览</el-button>
      <el-button size="small" type="primary" :loading="publishing" @click="publish">
        {{ publishing ? '发布中...' : '发布' }}
      </el-button>
    </div>
  </header>
  <router-view />

  <!-- 加载数据对话框 -->
  <el-dialog title="加载已有数据" v-model="loadDialogVisible" width="500px">
    <div v-loading="loading">
      <el-form>
        <el-form-item label="加载方式">
          <el-radio-group v-model="loadMethod">
            <el-radio label="json">从JSON文本加载</el-radio>
            <el-radio label="api">从后端加载</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="loadMethod === 'json'" label="JSON数据">
          <el-input type="textarea" :rows="10" placeholder="请粘贴JSON数据" v-model="inputJsonData"></el-input>
        </el-form-item>

        <el-form-item v-if="loadMethod === 'api'" label="表单ID">
          <el-input placeholder="请输入表单ID" v-model="formIdInput"></el-input>
        </el-form-item>
      </el-form>

      <div class="dialog-footer">
        <el-button @click="loadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmLoadData">确认加载</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
header {
  background-color: #ffffff;

  .el-menu {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.publish {
  position: absolute;
  top: 0px;
  right: 30px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  .el-button {
    border-radius: 8px;

    .el-icon {
      margin-right: 7px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}
</style>
