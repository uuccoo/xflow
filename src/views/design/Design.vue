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
import FormPreview from '@/components/form/FormPreview.vue'

const route = useRoute()
const router = useRouter()
const basicSettingsStore = useBasicSettingsStore()
const basicSettings = basicSettingsStore.basicSettings
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
    // 加载表单元信息（ID/编码/版本）
    basicSettingsStore.loadFormMeta(data.id, data.formCode, data.formVersion)

    // 加载基础设置（全量覆盖，避免字段缺失导致旧数据残留）
    basicSettingsStore.loadBasicSettings(data.basicSettings)

    // 加载表单设计数据（全量覆盖）
    formDesignStore.loadFormDesign(data.formDesign)

    // 加载流程设计数据
    flowDesignStore.loadFlowDesign(data.flowDesign)

    // 加载更多设置数据
    // 更多设置页面功能尚未实现，当前 loadMoreSettings 允许空对象兜底
    moreSettingsStore.loadMoreSettings(data.moreSettings)

    ElMessage.success('数据加载成功')
    return true
  } catch (error) {
    console.error('加载数据失败:', error)
    return false
  } finally {
    loading.value = false
  }
}

// 预览和发布功能
const preview = () => {
  // 收集所有表单数据
  const previewData = {
    id: basicSettingsStore.id,
    formCode: basicSettingsStore.formCode,
    formVersion: basicSettingsStore.formVersion,

    // 基础设置数据
    basicSettings: basicSettingsStore.toPayload(),

    // 表单设计数据
    formDesign: formDesignStore.toPayload(),

    // 流程设计数据
    flowDesign: flowDesignStore.toPayload(),

    // 更多设置数据
    moreSettings: moreSettingsStore.toPayload(),
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
    if (!basicSettings.formName) {
      ElMessage.error('请设置表单名称')
      router.push('/design/basicSettings')
      return
    }

    if (formDesignStore.toPayload().formItems.length === 0) {
      ElMessage.error('表单内容不能为空')
      router.push('/design/formDesign')
      return
    }

    // 收集所有数据 - 直接使用扁平化的字段
    const finalData = {
      // 基础设置数据
      basicSettings: basicSettingsStore.toPayload(),

      // 表单编码（顶层字段）
      formCode: basicSettingsStore.formCode,

      // 表单设计数据
      formDesign: formDesignStore.toPayload(),

      // 流程设计数据
      flowDesign: flowDesignStore.toPayload(),

      // 更多设置数据
      moreSettings: moreSettingsStore.toPayload(),

      // 表单版本
      formVersion: basicSettingsStore.formVersion
    }

    // 使用API发布表单
    const formId = basicSettingsStore.id
    let publishedForm

    if (formId) {
      publishedForm = await formApi.updateForm(formId, finalData)
    } else {
      publishedForm = await formApi.saveForm(finalData)
    }

    // 更新表单ID
    if (publishedForm && publishedForm.id) {
      basicSettingsStore.id = publishedForm.id
    }

    ElMessage({
      type: 'success',
      message: '表单已成功发布',
      duration: 3000
    })
  } catch (error) {
    console.error('发布失败:', error)
  } finally {
    publishing.value = false
  }
}

// 重置所有表单数据
const resetFormData = () => {
  // 重置表单元信息（ID/编码/版本）
  basicSettingsStore.resetFormMeta()

  // 重置基本设置
  basicSettingsStore.resetBasicSettings()

  // 重置表单设计
  formDesignStore.resetFormDesign()

  // 重置流程设计
  flowDesignStore.resetFlowDesign()

  // 重置更多设置
  moreSettingsStore.resetMoreSettings()

  console.log('表单数据已重置')
}

// 监听路由变化以处理URL参数
watch(
  () => route.query,
  async (newQuery) => {
    const formId = newQuery.id;
    const formCode = newQuery.code;

    resetFormData();
    if (formId) {
      try {
        loading.value = true;
        const formDetailData = await formApi.getFormDetail(formId);
        if (formDetailData) {
          loadExistingData(formDetailData);
        }
      } catch (error) {
        console.error('加载表单数据失败:', error);
      } finally {
        loading.value = false;
      }
    } else if (formCode) {
      try {
        loading.value = true;
        console.log('通过表单编码加载:', formCode);
        const formDetailData = await formApi.getFormByCode(formCode);
        if (formDetailData) {
          loadExistingData(formDetailData);
        }
      } catch (error) {
        console.error('加载表单数据失败:', error);
      } finally {
        loading.value = false;
      }
    }
  },
  { immediate: true }
)

// 查看表单JSON数据结构
const viewFormJson = () => {
  const formData = formDesignStore.toPayload()
  console.log('=== 表单JSON数据结构 ===')
  console.log(JSON.stringify(formData, null, 2))
  ElMessage.success('表单JSON数据已输出到控制台')
}

// 查看流程JSON数据结构
const viewFlowJson = () => {
  const flowData = flowDesignStore.toPayload()
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
        <div class="icon-box" :style="{ backgroundColor: basicSettings.iconColor }">
          <el-icon size="20" color="#ffffff">
            <component :is="basicSettings.selectedIcon" />
          </el-icon>
        </div>
        <span class="form-name">{{ basicSettings.formName }}</span>
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
    <FormPreview @close-preview="closePreview" />
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
