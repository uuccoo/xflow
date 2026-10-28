<template>
  <el-dialog
    v-model="visible"
    title="选择登录用户"
    width="560px"
    :close-on-click-modal="false"
    align-center
    append-to-body
  >
    <div v-loading="loading" class="user-switch-dialog">
      <el-input
        v-model="searchText"
        placeholder="搜索姓名、用户名或部门"
        :prefix-icon="Search"
        clearable
      />

      <el-alert
        v-if="loadError"
        title="用户列表加载失败，请关闭后重试"
        type="error"
        :closable="false"
        show-icon
      />

      <div v-else-if="filteredUsers.length" class="user-list">
        <button
          v-for="user in filteredUsers"
          :key="user.id"
          type="button"
          class="user-option"
          :class="{ selected: selectedUser?.id === user.id }"
          :aria-pressed="selectedUser?.id === user.id"
          @click="selectedUser = user"
        >
          <UserAvatar :user="user" :size="36" :show-name="false" layout="horizontal" />
          <span class="user-details">
            <span class="user-heading">
              <span class="user-name">{{ user.name }}</span>
              <span v-if="user.username" class="username">{{ user.username }}</span>
              <el-tag v-if="isCurrentUser(user)" size="small" effect="plain">当前用户</el-tag>
            </span>
            <span class="department-path">{{ user.departmentPath }}</span>
          </span>
          <el-icon v-if="selectedUser?.id === user.id" class="selected-icon"><Check /></el-icon>
        </button>
      </div>

      <el-empty
        v-else-if="!loading && !loadError"
        :description="searchText ? '没有匹配的用户' : '暂无可切换用户'"
        :image-size="64"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedUser || isCurrentUser(selectedUser)" @click="confirmSelection">
          切换
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Check, Search } from '@element-plus/icons-vue'
import { userApi } from '@/api'
import UserAvatar from '@/components/common/UserAvatar.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentUserId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const loadError = ref(false)
const searchText = ref('')
const users = ref([])
const selectedUser = ref(null)

const filteredUsers = computed(() => {
  const keyword = searchText.value.trim().toLocaleLowerCase()
  if (!keyword) return users.value

  return users.value.filter((user) =>
    [user.name, user.username, user.departmentPath]
      .join(' ')
      .toLocaleLowerCase()
      .includes(keyword)
  )
})

const isCurrentUser = (user) => String(user?.id) === String(props.currentUserId)

const flattenUsers = (node, parentPath = []) => {
  if (!node) return []

  if (Array.isArray(node)) {
    return node.flatMap((item) => flattenUsers(item, parentPath))
  }

  if (node.type === 'user') {
    const name = String(node.realName || node.name || node.username || '')
    return [{
      ...node,
      name,
      username: node.username || '',
      realName: node.realName || name,
      departmentPath: parentPath.join(' / ') || '未归属部门'
    }]
  }

  const nextPath = node.name ? [...parentPath, node.name] : parentPath
  const children = node.children || []
  const orderedChildren = [
    ...children.filter((child) => child.type === 'user'),
    ...children.filter((child) => child.type !== 'user')
  ]

  return orderedChildren.flatMap((child) => flattenUsers(child, nextPath))
}

const loadUsers = async () => {
  loading.value = true
  loadError.value = false
  searchText.value = ''

  try {
    const organizationTree = await userApi.getCurrentUserOrgTree([])
    users.value = flattenUsers(organizationTree)
    selectedUser.value = users.value.find((user) => isCurrentUser(user)) || null
  } catch (error) {
    console.error('获取可切换用户失败:', error)
    users.value = []
    selectedUser.value = null
    loadError.value = true
  } finally {
    loading.value = false
  }
}

const confirmSelection = () => {
  if (!selectedUser.value || isCurrentUser(selectedUser.value)) return

  emit('confirm', {
    selectedIds: [selectedUser.value.id],
    selectedUsers: [selectedUser.value]
  })
  visible.value = false
}

watch(visible, (isVisible) => {
  if (isVisible) loadUsers()
})
</script>

<style scoped>
.user-switch-dialog {
  min-height: 220px;
}

.user-switch-dialog :deep(.el-alert) {
  margin-top: 12px;
}

.user-list {
  max-height: 360px;
  overflow-y: auto;
  margin-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.user-option {
  width: 100%;
  min-height: 68px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: transparent;
  color: var(--el-text-color-primary);
  text-align: left;
  cursor: pointer;
}

.user-option:hover {
  background: var(--el-fill-color-light);
}

.user-option.selected {
  background: var(--el-color-primary-light-9);
}

.user-details {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-heading {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name,
.username,
.department-path {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
}

.username,
.department-path {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.username {
  min-width: 0;
}

.department-path {
  display: block;
}

.selected-icon {
  flex: 0 0 auto;
  color: var(--el-color-primary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>