<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBasicSettingsStore } from '@/stores/basicSettingsStore'
import { useFormDesignStore } from '@/stores/formDesignStore'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import { useMoreSettingsStore } from '@/stores/moreSettingsStore'
import { ArrowLeft, Close } from '@element-plus/icons-vue'
// 导入API
import { formApi } from '@/api'
// 导入环境工具函数
import { isDevelopment } from '@/utils/env'

// 导入各个组件
import BasicSettings from './BasicSettings.vue'
import FormDesign from './FormDesign.vue'
import FlowDesign from './FlowDesign.vue'
import MoreSettings from './MoreSettings.vue'
// 导入预览组件
import ApprovalFormView from '@/views/approval/ApprovalFormView.vue'

const route = useRoute()
const router = useRouter()
const basicSettingsStore = useBasicSettingsStore()
const formDesignStore = useFormDesignStore()
const flowDesignStore = useFlowDesignStore()
const moreSettingsStore = useMoreSettingsStore()

// 当前激活的组件
const activeComponent = ref('basicSettings')

// 判断是否为开发环境
const isDevMode = computed(() => isDevelopment())

// 是否显示预览
const showPreview = ref(false)

// 返回上一页的功能
const handleBack = () => {
  router.push('/home/manage-forms')
}

// 是否正在发布
const publishing = ref(false)
// 是否正在加载
const loading = ref(false)

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

      // 表单信息 - 直接使用扁平化的字段
      basicSettingsStore.id = data.basicSettings.id || ''
      basicSettingsStore.formName = data.basicSettings.formName || ''
      basicSettingsStore.formCode = data.basicSettings.formCode || ''
      basicSettingsStore.groupId = data.basicSettings.groupId || ''
      basicSettingsStore.description = data.basicSettings.description || ''

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
  // 收集所有表单数据
  const previewData = {
    // 基础设置数据
    basicSettings: {
      iconColor: basicSettingsStore.iconColor,
      selectedIcon: basicSettingsStore.selectedIcon,
      id: basicSettingsStore.id || 'preview-' + Date.now(),
      formName: basicSettingsStore.formName || '预览表单',
      formCode: basicSettingsStore.formCode,
      groupId: basicSettingsStore.groupId,
      description: basicSettingsStore.description,
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
    moreSettings: { ...moreSettingsStore.settings }
  }

  // 将预览数据存储到sessionStorage，避免数据传递问题
  sessionStorage.setItem('formPreviewData', JSON.stringify(previewData))

  // 显示预览组件，不进行路由跳转
  showPreview.value = true
}

// 关闭预览
const closePreview = () => {
  showPreview.value = false
}

const publish = async () => {
  // 设置发布状态
  publishing.value = true

  try {
    // 数据验证
    if (!basicSettingsStore.formName) {
      ElMessage.error('请设置表单名称')
      router.push('/design/basicSettings')
      return
    }

    if (formDesignStore.formItems.length === 0) {
      ElMessage.error('表单内容不能为空')
      router.push('/design/formDesign')
      return
    }

    // 收集所有数据 - 直接使用扁平化的字段
    const finalData = {
      // 基础设置数据
      basicSettings: {
        iconColor: basicSettingsStore.iconColor,
        selectedIcon: basicSettingsStore.selectedIcon,
        id: basicSettingsStore.id,
        formName: basicSettingsStore.formName,
        formCode: basicSettingsStore.formCode,
        groupId: basicSettingsStore.groupId,
        description: basicSettingsStore.description,
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
    const formId = basicSettingsStore.id
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
      basicSettingsStore.id = result.data.id
    }

    ElMessage({
      type: 'success',
      message: '表单已成功发布',
      duration: 3000
    })

    // 可以添加保存后的逻辑，如跳转到表单列表页
    // router.push('/form/list')
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败: ' + (error.message || '未知错误'))
  } finally {
    // 重置发布状态
    publishing.value = false
  }
}

// 重置所有表单数据
const resetFormData = () => {
  // 重置基本设置
  basicSettingsStore.iconColor = '#FF8800' // 默认值
  basicSettingsStore.selectedIcon = 'Promotion'

  // 重置表单基础信息
  basicSettingsStore.id = ''
  basicSettingsStore.formName = ''
  basicSettingsStore.formCode = ''
  basicSettingsStore.groupId = ''
  basicSettingsStore.description = ''

  basicSettingsStore.initiatorScope = 'all'
  basicSettingsStore.selectedInitiators = []
  basicSettingsStore.adminScope = 'all'
  basicSettingsStore.selectedAdmins = []

  // 重置表单设计
  formDesignStore.formItems = []
  formDesignStore.activeItem = null

  // 重置流程设计
  flowDesignStore.flowData.id = 'flow-' + Date.now()
  flowDesignStore.flowData.name = '未命名流程'
  flowDesignStore.flowData.version = '1.0'
  flowDesignStore.flowData.initiator = {
    id: 1,
    type: FlowNodeType.INITIATOR,
    name: '发起人',
    props: {
      initiator: [],
    },
  }
  flowDesignStore.flowData.nodes = []
  flowDesignStore.selectedNode = null
  flowDesignStore.drawerVisible = false

  // 重置更多设置
  if (moreSettingsStore.settings) {
    moreSettingsStore.settings = {
      // 默认值，根据实际情况调整
      enabled: true,
      options: {}
    }
  }

  console.log('表单数据已重置')
}

// 监听路由变化以处理URL参数
watch(
  () => route.query,
  async (newQuery) => {
    const formId = newQuery.id;
    const formCode = newQuery.code;

    if (formId) {
      try {
        loading.value = true;
        const result = await formApi.getFormDetail(formId);
        if (result && result.data) {
          loadExistingData(result.data);
        }
      } catch (error) {
        console.error('加载表单数据失败:', error);
        ElMessage.error('加载表单数据失败: ' + (error.message || '未知错误'));
      } finally {
        loading.value = false;
      }
    } else if (formCode) {
      try {
        loading.value = true;
        console.log('通过表单编码加载:', formCode);
        const result = await formApi.getFormByCode(formCode);
        if (result && result.data) {
          loadExistingData(result.data);
        }
      } catch (error) {
        console.error('加载表单数据失败:', error);
        ElMessage.error('加载表单数据失败: ' + (error.message || '未知错误'));
      } finally {
        loading.value = false;
      }
    } else {
      // 既没有formId也没有formCode，说明是创建新表单，需要重置所有数据
      resetFormData();
    }
  },
  { immediate: true }
)

// 查看表单JSON数据结构
const viewFormJson = () => {
  const formData = {
    formItems: [...formDesignStore.formItems]
  }
  console.log('=== 表单JSON数据结构 ===')
  console.log(JSON.stringify(formData, null, 2))
  ElMessage.success('表单JSON数据已输出到控制台')
}

// 查看流程JSON数据结构
const viewFlowJson = () => {
  const flowData = flowDesignStore.exportFlowData()
  console.log('=== 流程JSON数据结构 ===')
  console.log(JSON.stringify(flowData, null, 2))
  ElMessage.success('流程JSON数据已输出到控制台')
}

// 页面加载时，检查URL是否包含表单ID或表单编码，如果有则自动加载
onMounted(() => {
  console.log('组件已加载，URL参数:', route.query);
})
</script>

<template>
  <header>
    <el-menu :default-active="activeComponent" active-text-color="#409eff" mode="horizontal" :ellipsis="false">
      <el-menu-item index="basicSettings" @click="activeComponent = 'basicSettings'">基础设置</el-menu-item>
      <el-menu-item index="formDesign" @click="activeComponent = 'formDesign'">表单设计</el-menu-item>
      <el-menu-item index="flowDesign" @click="activeComponent = 'flowDesign'">流程设计</el-menu-item>
      <el-menu-item index="moreSettings" @click="activeComponent = 'moreSettings'">更多设置</el-menu-item>
    </el-menu>
    <div class="publish">
      <el-button size="small" @click="viewFormJson" v-if="isDevMode">查看表单JSON</el-button>
      <el-button size="small" @click="viewFlowJson" v-if="isDevMode">查看流程JSON</el-button>
      <el-button size="small" @click="preview">预览</el-button>
      <el-button size="small" type="primary" :loading="publishing" @click="publish">
        {{ publishing ? '发布中...' : '发布' }}
      </el-button>
    </div>
    <div class="back">
      <div class="back-btn" @click="handleBack">
        <el-icon><arrow-left /></el-icon>
        <span>返回</span>
      </div>
      <div class="form-info">
        <div class="icon-box" :style="{ backgroundColor: basicSettingsStore.iconColor }">
          <el-icon size="20" color="#ffffff">
            <component :is="basicSettingsStore.selectedIcon" />
          </el-icon>
        </div>
        <span class="form-name">{{ basicSettingsStore.formName }}</span>
      </div>
    </div>
  </header>
  <main>
    <BasicSettings v-show="activeComponent === 'basicSettings'" />
    <FormDesign v-show="activeComponent === 'formDesign'" />
    <FlowDesign v-show="activeComponent === 'flowDesign'" />
    <MoreSettings v-show="activeComponent === 'moreSettings'" />
  </main>

  <!-- 全屏预览组件 -->
  <div v-if="showPreview" class="preview-overlay">
    <ApprovalFormView :preview="true" @close-preview="closePreview" />
  </div>
</template>

<style scoped lang="scss">
header {
  background-color: #ffffff;
  position: relative; // 添加相对定位以便子元素使用绝对定位

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

.back {
  position: absolute;
  top: 0px;
  left: 10px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;

  .back-btn {
    display: flex;
    align-items: center;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.3s;
    color: #606266;

    &:hover {
      color: #409eff;
    }

    .el-icon {
      margin-right: 4px;
      font-size: 14px;
    }

    span {
      font-size: 14px;
    }
  }

  .form-info {
    display: flex;
    align-items: center;
    margin-left: 20px;

    .icon-box {
      width: 30px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 6px;
      margin-right: 10px;
    }

    .form-name {
      font-size: 14px;
      font-weight: 500;
      color: #606266;
    }
  }
}

/* 预览覆盖层样式 */
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: #f5f6f6;
  overflow-y: auto;
}

.preview-close {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  background-color: #fff;
  padding: 8px 15px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    background-color: #f2f2f2;
    color: #409EFF;
  }

  .el-icon {
    font-size: 16px;
  }
}
</style>
