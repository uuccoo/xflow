<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { formGroupApi } from '@/api'

// 组件接收的props
const props = defineProps({
  // 控制对话框显示
  visible: {
    type: Boolean,
    required: true
  },
  // 按钮文本
  buttonText: {
    type: String,
    default: '新建分组'
  },
  // 是否内联显示按钮（作为其他组件的一部分）
  inline: {
    type: Boolean,
    default: false
  }
})

// 向父组件发送事件的emit
const emit = defineEmits(['update:visible', 'group-created'])

// 新建分组名称
const newGroupName = ref('')
// 保存按钮加载状态
const groupNameLoading = ref(false)

// 打开新建分组对话框
const openGroupCreator = () => {
  newGroupName.value = ''
  emit('update:visible', true)
}

// 关闭对话框
const closeDialog = () => {
  emit('update:visible', false)
}

// 保存新建分组
const saveNewGroup = async () => {
  if (!newGroupName.value.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }
  
  groupNameLoading.value = true
  try {
    const newGroup = await formGroupApi.createFormGroup({
      name: newGroupName.value.trim(),
      sortOrder: 0
    })
    
    ElMessage.success('分组创建成功')
    emit('group-created', newGroup)
    closeDialog()
  } catch (error) {
    console.error('创建分组失败:', error)
  } finally {
    groupNameLoading.value = false
  }
}
</script>

<template>
  <!-- 如果是内联模式，只展示按钮，对话框由父组件控制 -->
  <el-button v-if="inline" type="primary" @click="openGroupCreator" size="large">
    <el-icon><Plus /></el-icon>
    {{ buttonText }}
  </el-button>
  
  <!-- 新建分组对话框 -->
  <el-dialog
    :modelValue="visible"
    @update:modelValue="$emit('update:visible', $event)"
    title="新建分组"
    width="500px"
    center
    append-to-body
    destroy-on-close
  >
    <div class="new-group-dialog">
      <el-input
        v-model="newGroupName"
        maxlength="50"
        placeholder="请输入新的分组名"
        clearable
        @keyup.enter="saveNewGroup"
      />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveNewGroup" :loading="groupNameLoading">
          提交
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.new-group-dialog {
  padding: 10px 0 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>