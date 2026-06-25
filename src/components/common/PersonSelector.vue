<template>
    <!-- 人员选择弹窗 -->
    <el-dialog v-model="visible" :title="title" width="600" :close-on-click-modal="false" align-center
        @closed="handleDialogClosed">
        <div class="person-selector-container" v-loading="loading">
            <!-- 显示加载错误提示 -->
            <el-alert
                v-if="loadingError"
                title="组织架构数据加载失败，已使用默认数据"
                type="warning"
                :closable="false"
                show-icon
                style="margin-bottom: 10px;"
            />
            <div class="selector-main">
                <!-- 左侧区域 -->
                <div class="left-panel">
                    <!-- tabs 切换（只有多个 tab 时显示） -->
                    <div v-if="showTabs" class="type-tabs">
                        <div v-if="hasDepartmentTab" class="tab-item"
                            :class="{ active: activeTab === 'department' }"
                            @click="activeTab = 'department'">
                            部门
                        </div>
                        <div v-if="hasRoleTab" class="tab-item"
                            :class="{ active: activeTab === 'role' }"
                            @click="activeTab = 'role'">
                            角色
                        </div>
                    </div>

                    <!-- 内容区域 -->
                    <div class="content-area">
                        <!-- 部门内容 -->
                        <div v-if="activeTab === 'department'" class="department-content">
                            <!-- 部门搜索框 -->
                            <div class="search-box">
                                <el-input v-model="departmentSearchText" placeholder="搜索" :prefix-icon="Search" clearable
                                    @input="watchDepartmentSearch" />
                            </div>

                            <!-- 面包屑导航 -->
                            <div class="breadcrumb-navigation">
                                <el-breadcrumb :separator-icon="ArrowRight">
                                    <el-breadcrumb-item v-for="(item, index) in currentPath" :key="item.id"
                                        @click="navigateToDepartment(index)"
                                        :class="{ 'is-link': index < currentPath.length - 1 }">
                                        {{ item.name }}
                                    </el-breadcrumb-item>
                                </el-breadcrumb>
                            </div>

                            <!-- 上一级按钮和全选按钮放在同一行，全选在左边，上一级在右边 -->
                            <div class="navigation-controls">
                                <div class="department-select-all">
                                    <el-checkbox :model-value="isAllChildrenChecked(currentDepartment)"
                                        :indeterminate="isIndeterminate(currentDepartment) && !isAllChildrenChecked(currentDepartment)"
                                        @change="handleSelectAllChildren">全选</el-checkbox>
                                </div>

                                <div class="level-nav" v-if="currentPath.length > 1" @click="handleGoToParent">
                                    <div class="icon-text-container">
                                        <el-icon class="chevron-icon">
                                            <ArrowLeft />
                                        </el-icon>
                                        <span>上级</span>
                                        <el-icon style="visibility: hidden;" class="chevron-icon">
                                            <ArrowRight />
                                        </el-icon>
                                    </div>
                                </div>
                            </div>

                            <!-- 部门节点列表 -->
                            <div class="department-list">
                                <div v-for="item in displayNodes" :key="item.id" class="department-item">
                                    <el-checkbox v-model="item.checked"
                                        :disabled="!hasSelectableType(item.type)"
                                        :indeterminate="item.type === 'department' && isIndeterminate(item)" 
                                        @change="handleNodeCheckChange(item, $event)">
                                        <span class="department-name">{{ item.name }}</span>
                                    </el-checkbox>
                                    <div v-if="item.type === 'department' && item.children && item.children.length > 0"
                                        class="department-next" :class="{ disabled: item.checked }" @click="handleNavigateToChild(item)">
                                        <div class="icon-text-container">
                                            <el-icon style="visibility: hidden;" class="chevron-icon">
                                                <ArrowLeft />
                                            </el-icon>
                                            <span>下级</span>
                                            <el-icon class="chevron-icon">
                                                <ArrowRight />
                                            </el-icon>
                                        </div>
                                    </div>
                                    <span v-if="isDepartmentSearchMode" class="node-path">{{ getNodePathText(item.id) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 角色内容 -->
                        <div v-if="activeTab === 'role'" class="role-content">
                            <!-- 角色搜索框 -->
                            <div class="search-box">
                                <el-input v-model="roleSearchText" placeholder="搜索" :prefix-icon="Search" clearable
                                    @input="watchRoleSearch" />
                            </div>

                            <!-- 角色列表 -->
                            <div class="role-list">
                                <div v-for="role in displayRoleList" :key="role.id" class="role-item">
                                    <el-checkbox v-model="role.checked"
                                        @change="handleNodeCheckChange(role, $event)">
                                        <el-icon class="role-icon">
                                            <Key />
                                        </el-icon>
                                        <span class="role-name">{{ role.name }}</span>
                                    </el-checkbox>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧已选列表 -->
                <div class="selected-list">
                    <div class="selected-list-header">
                        <span>已选 {{ selectedUsers.length }} 项</span>
                        <div class="clear-btn" @click="clearSelected">清空</div>
                    </div>

                    <div class="selected-list-content">
                        <div v-for="item in selectedUsers" :key="item.id" class="selected-item">
                            <el-icon>
                                <component :is="getItemIcon(item.type)" />
                            </el-icon>
                            <span>{{ item.name }}</span>
                            <el-icon class="remove-icon" @click="removeSelected(item)">
                                <Close />
                            </el-icon>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleCancel">取 消</el-button>
                <el-button type="primary" @click="handleConfirm">确 定</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowRight, Close, Search, User, Folder, ArrowLeft, Key } from '@element-plus/icons-vue'
import { userApi } from '@/api'

const props = defineProps({
    // 控制弹窗是否显示
    modelValue: {
        type: Boolean,
        default: false
    },
    // 弹窗标题
    title: {
        type: String,
        default: '选择人员'
    },
    // 已选择的人员/部门ID列表
    selectedIds: {
        type: Array,
        default: () => []
    },
    // 单选模式 - 只能选择一项（不区分人员或部门）
    singleMode: {
        type: Boolean,
        default: false
    },
    // 可选类型列表：支持组合选择，默认['user', 'department']
    selectableTypes: {
        type: Array,
        default: () => ['user', 'department'],
        validator: (value) => {
            const validTypes = ['user', 'department', 'role']
            return value.every(type => validTypes.includes(type))
        }
    },
    // 筛选条件，仅返回指定的部门和用户
    filter: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// 内部可见性状态
const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

// 部门搜索相关
const departmentSearchText = ref('')
const filteredNodesFlat = ref([])
const isDepartmentSearchMode = computed(() => departmentSearchText.value.trim().length > 0)

// 角色搜索相关
const roleSearchText = ref('')

// 加载状态
const loading = ref(false)
const loadingError = ref(false)

// tabs 相关
const activeTab = ref('department')
// 是否有部门tab（user或department类型都显示部门tab）
const hasDepartmentTab = computed(() => {
    return hasSelectableType('user', 'department')
})
// 是否有角色tab
const hasRoleTab = computed(() => {
    return hasSelectableType('role')
})
const showTabs = computed(() => {
    // 当有多个 tab 时显示
    return hasDepartmentTab.value + hasRoleTab.value > 1
})

// 组织机构数据
const companyDepartments = ref(null)

// 角色列表数据（当 selectableTypes 只包含 'role' 时使用）
const roleList = ref([])

// 显示的角色列表（根据搜索过滤）
const displayRoleList = computed(() => {
    if (!roleSearchText.value.trim()) {
        return roleList.value
    }
    const keyword = roleSearchText.value.toLowerCase()
    return roleList.value.filter(role => 
        role.name.toLowerCase().includes(keyword) ||
        (role.roleCode && role.roleCode.toLowerCase().includes(keyword))
    )
})

// 转换API返回的数据格式为组件需要的格式
const transformApiData = (apiData) => {
    if (!apiData) {
        return null
    }

    const organization = apiData
    
    // 递归转换数据结构
    const transformNode = (node) => {
        const result = {
            id: node.id,
            name: node.name,
            checked: false,
            indeterminate: false,
            type: node.type,
            children: []
        }

        // 如果有子节点，递归转换
        if (node.children && Array.isArray(node.children)) {
            result.children = node.children.map(transformNode)
        }

        return result
    }

    return transformNode(organization)
}

// 从API获取组织架构数据
const fetchOrganizationData = async () => {
    loading.value = true
    loadingError.value = false
    
    try {
        const requestData = props.filter

        const orgTreeData = await userApi.getCurrentUserOrgTree(requestData)

        if (orgTreeData) {
            const transformedData = transformApiData(orgTreeData)
            if (transformedData) {
                return transformedData
            }
        }
        
        throw new Error('组织架构数据格式不正确')
    } catch (error) {
        console.error('获取组织架构数据失败:', error)
        loadingError.value = true
        
        return {
            id: 'empty',
            name: '组织架构',
            checked: false,
            indeterminate: false,
            type: 'organization',
            children: []
        }
    } finally {
        loading.value = false
    }
}

// 从API获取角色列表
const fetchRoleList = async () => {
    loading.value = true
    loadingError.value = false
    
    try {
        const roleData = await userApi.getRoleList()
        // request.js已经将响应处理为res.data，所以直接使用roleData
        if (roleData && Array.isArray(roleData)) {
            // 将角色列表转换为树形结构
            roleList.value = roleData.map(role => ({
                id: role.id,
                name: role.roleName,
                roleCode: role.roleCode,
                checked: false,
                type: 'role'
            }))
        }
    } catch (error) {
        console.error('获取角色列表失败:', error)
        loadingError.value = true
        roleList.value = []
    } finally {
        loading.value = false
    }
}

// 获取默认激活的 tab
const getDefaultActiveTab = () => {
    if (hasDepartmentTab.value) {
        return 'department'
    } else if (hasRoleTab.value) {
        return 'role'
    }
}

// 初始化数据
const initOrganizationData = async () => {
    // 默认选中部门 tab（如果可用）
    activeTab.value = getDefaultActiveTab()
    
    // 根据可选类型加载数据
    if (hasDepartmentTab.value) {
        companyDepartments.value = await fetchOrganizationData()
        // 初始化部门路径
        if (companyDepartments.value) {
            currentPath.value = [companyDepartments.value]
        }
    }
    if (hasRoleTab.value) {
        await fetchRoleList()
    }
}

// 当前浏览的部门路径
const currentPath = ref([])

// 当前显示的部门内容
const currentDepartment = computed(() => {
    return currentPath.value[currentPath.value.length - 1] || {}
})

// 扁平化处理所有树形数据，找出所有节点
const getAllNodesFlat = (node) => {
    let result = [node]
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
            result = result.concat(getAllNodesFlat(child))
        })
    }
    return result
}

// 已选择的用户和部门列表（通过计算属性从勾选状态得出）
const selectedUsers = computed(() => {
    const selected = []
    
    // 使用 getAllNodesFlat 扁平化后筛选
    if (companyDepartments.value) {
        const allNodes = getAllNodesFlat(companyDepartments.value)
        allNodes.forEach(node => {
            if (node.checked && hasSelectableType(node.type)) {
                selected.push({
                    id: node.id,
                    name: node.name,
                    type: node.type
                })
            }
        })
    }
    
    // 从角色列表中收集已勾选的角色
    roleList.value.forEach(role => {
        if (role.checked) {
            selected.push({
                id: role.id,
                name: role.name,
                type: 'role'
            })
        }
    })
    
    return selected
})

// 计算部门节点的 indeterminate 状态
const isIndeterminate = (node) => {
    if (!node.children || node.children.length === 0) {
        return false
    }
    const someChecked = node.children.some(child => child.checked || isIndeterminate(child))
    return someChecked && !node.checked
}

// 判断部门节点的所有可选类型子节点是否都已勾选
const isAllChildrenChecked = (node) => {
    if (!node.children || node.children.length === 0) {
        return false
    }
    const selectableChildren = node.children.filter(child => hasSelectableType(child.type))
    if (selectableChildren.length === 0) {
        return false
    }
    return selectableChildren.every(child => child.checked)
}

// 处理全选/取消全选
const handleSelectAllChildren = (checked) => {
    currentDepartment.value.children.forEach(child => {
        if (hasSelectableType(child.type)) {
            child.checked = checked
        }
    })
}

// 处理部门/用户节点勾选
const handleNodeCheckChange = (item, checked) => {
    if (props.singleMode && checked) {
        // 单选模式下，清除之前选中的所有项
        handleSingleSelection(item)
    }
}

// 进入下级部门
const handleNavigateToChild = (item) => {
    if (!item.checked) {
        currentPath.value.push(item)
    }
}

// 返回上级
const handleGoToParent = () => {
    currentPath.value.pop()
}

// 根据类型获取图标组件
const getItemIcon = (type) => {
    switch (type) {
        case 'user':
            return User
        case 'role':
            return Key
        case 'department':
        default:
            return Folder
    }
}

// 判断某类型是否可选，支持传入多个类型，只要包含其中一个则为true
const hasSelectableType = (...types) => {
    return types.some(type => props.selectableTypes.includes(type))
}

// 从已选列表中移除（通过取消勾选实现）
const removeSelected = (itemToRemove) => {
    // 如果是角色，在角色列表中查找并取消勾选
    if (itemToRemove.type === 'role') {
        const role = roleList.value.find(r => r.id === itemToRemove.id)
        if (role) {
            role.checked = false
        }
    } else if (itemToRemove.type === 'department' || itemToRemove.type === 'user') {
        // 使用 getAllNodesFlat 将部门树扁平化后查找
        if (companyDepartments.value) {
            const allNodes = getAllNodesFlat(companyDepartments.value)
            const nodeToUncheck = allNodes.find(node => node.id === itemToRemove.id)
            if (nodeToUncheck) {
                nodeToUncheck.checked = false
            }
        }
    }
}

// 单选模式下处理选择逻辑
const handleSingleSelection = (selectedItem) => {
    // 使用 getAllNodesFlat 将部门树扁平化后清除所有选中状态
    if (companyDepartments.value) {
        const allNodes = getAllNodesFlat(companyDepartments.value)
        allNodes.forEach(node => {
            node.checked = false
            node.indeterminate = false
        })
    }
    
    // 只选中当前项
    selectedItem.checked = true
}

// 清空所有已选（通过取消所有勾选实现）
const clearSelected = () => {
    // 使用 getAllNodesFlat 将部门树扁平化后清空所有选中状态
    if (companyDepartments.value) {
        const allNodes = getAllNodesFlat(companyDepartments.value)
        allNodes.forEach(node => {
            node.checked = false
            node.indeterminate = false
        })
    }

    // 清空角色列表中的选中状态
    roleList.value.forEach(role => {
        role.checked = false
    })
}

// 部门搜索过滤函数
const handleDepartmentSearch = () => {
    if (!departmentSearchText.value.trim()) {
        filteredNodesFlat.value = []
        return
    }

    // 在整个树中搜索匹配的节点
    const keyword = departmentSearchText.value.toLowerCase().trim()
    const allNodes = getAllNodesFlat(companyDepartments.value)

    // 过滤匹配的节点，只显示用户和部门类型
    filteredNodesFlat.value = allNodes.filter(node =>
        (node.type === 'user' || node.type === 'department') &&
        node.name.toLowerCase().includes(keyword)
    )
}

// 监听部门搜索文本变化
const debouncedDepartmentSearch = ref(null)
const watchDepartmentSearch = () => {
    if (debouncedDepartmentSearch.value) {
        clearTimeout(debouncedDepartmentSearch.value)
    }
    debouncedDepartmentSearch.value = setTimeout(() => {
        handleDepartmentSearch()
    }, 300)
}

// 当前显示的节点列表（根据是否在搜索模式切换）
const displayNodes = computed(() => {
    if (isDepartmentSearchMode.value) {
        return filteredNodesFlat.value
    } else {
        return currentDepartment.value.children || []
    }
})

// 获取节点的父路径
const getNodePath = (targetId, node = companyDepartments.value, path = []) => {
    // 如果当前节点匹配，返回路径
    if (node.id === targetId) {
        return [...path, node]
    }

    // 如果没有子节点，返回空
    if (!node.children || node.children.length === 0) {
        return null
    }

    // 遍历所有子节点
    for (const child of node.children) {
        const result = getNodePath(targetId, child, [...path, node])
        if (result) {
            return result
        }
    }

    // 没有找到匹配的路径
    return null
}

// 获取节点的路径文本表示
const getNodePathText = (nodeId) => {
    const path = getNodePath(nodeId)
    if (!path) return ''

    // 返回除了目标节点以外的路径名称
    return path.slice(0, -1).map(node => node.name).join(' / ')
}

// 初始化方法，在打开弹窗前调用
const initSelector = () => {
    // 根据selectedIds的值初始化选中状态
    const selectedIds = props.selectedIds || []

    // 使用 getAllNodesFlat 将树扁平化后设置选中状态
    if (companyDepartments.value) {
        const allNodes = getAllNodesFlat(companyDepartments.value)
        allNodes.forEach(node => {
            node.checked = selectedIds.includes(node.id)
            node.indeterminate = false
        })
    }

    // 初始化角色列表的选中状态
    roleList.value.forEach(role => {
        role.checked = selectedIds.includes(role.id)
    })

    // 重置路径到根节点
    currentPath.value = [companyDepartments.value]

    // 清空搜索
    departmentSearchText.value = ''
    roleSearchText.value = ''
    filteredNodesFlat.value = []
}

// 导航到指定的部门层级
const navigateToDepartment = (index) => {
    if (index < currentPath.value.length - 1) {
        // 截取到指定层级
        currentPath.value = currentPath.value.slice(0, index + 1);
    }
}

// 处理确认按钮点击
const handleConfirm = () => {
    const selectedIds = selectedUsers.value.map(item => item.id)
    emit('confirm', {
        selectedIds,
        selectedUsers: selectedUsers.value
    })
    visible.value = false
}

// 处理取消按钮点击
const handleCancel = () => {
    emit('cancel')
    visible.value = false
}

// 监听visible变化，当打开弹窗时初始化
watch(() => visible.value, async (newVal) => {
    if (newVal) {
        // 当弹窗显示时初始化组织数据
        await initOrganizationData()
        // 然后初始化选择状态
        initSelector()
    }
})


// 暴露方法给父组件
defineExpose({
    initSelector, // 允许外部手动初始化
    clearSelected, // 允许外部清空选择
    getSelectedUsers: () => selectedUsers.value // 获取当前选中的所有用户/部门
})
</script>

<style lang="scss" scoped>
/* 人员选择弹窗样式 */
.person-selector-container {
    display: flex;
    flex-direction: column;
    height: 450px;

    .search-box {
        margin: 10px 15px;
    }

    .selector-main {
        display: flex;
        flex: 1;
        gap: 20px;
        min-height: 380px;

        .left-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 100%;

            .type-tabs {
                display: flex;
                justify-content: center;
                margin-bottom: 8px;
                
                .tab-item {
                    padding: 8px 20px;
                    cursor: pointer;
                    color: #606266;
                    font-size: 14px;
                    border-bottom: 2px solid transparent;
                    transition: all 0.3s;
                    
                    &:hover {
                        color: #409EFF;
                    }
                    
                    &.active {
                        color: #409EFF;
                        border-bottom-color: #409EFF;
                    }
                }
            }

            .content-area {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                border: 1px solid #e4e7ed;
                border-radius: 4px;
            }
        }

        .selected-list {
            flex: 1;
            border: 1px solid #e4e7ed;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            height: 100%;

            &-header {
                padding: 10px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .clear-btn {
                    color: #F56C6C;
                    font-size: 14px;
                    text-decoration: none;
                    cursor: pointer;

                    &:hover {
                        opacity: 0.8;
                    }
                }
            }

            &-content {
                flex: 1;
                overflow-y: auto;
                padding: 8px 0;
            }
        }

        // 部门内容样式
        .department-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;

            .department-list {
                flex: 1;
                overflow-y: auto;
                padding: 8px 0;
            }
        }

        // 角色内容样式
        .role-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;

            .role-list {
                flex: 1;
                overflow-y: auto;
                padding: 8px 0;

                .role-item {
                    padding: 5px 15px;
                    display: flex;
                    align-items: center;

                    &:hover {
                        background-color: #f5f7fa;
                    }

                    .role-icon {
                        margin-right: 8px;
                        color: #409EFF;
                    }

                    .role-name {
                        font-size: 14px;
                    }
                }
            }
        }

        .breadcrumb-navigation {
            padding: 5px 15px;
            margin-bottom: 5px;

            :deep(.el-breadcrumb__item) {
                .el-breadcrumb__inner {
                    font-weight: 500;
                    font-size: 12px;
                    /* 添加较小的字体大小 */

                    &.is-link {
                        color: #409EFF;
                        cursor: pointer;

                        &:hover {
                            color: #66b1ff;
                        }
                    }
                }

                &:last-child .el-breadcrumb__inner {
                    color: #606266;
                    font-weight: 600;
                }
            }
        }

        /* 导航控制区样式 */
        .navigation-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 15px;
        }

        .level-nav {
            cursor: pointer;
        }

        .department-select-all {
            font-weight: 500;
            color: #606266;
            font-size: 14px;
        }

        /* 全局图标文本容器样式 - 提升层级并加强优先级 */
        .icon-text-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;

            .chevron-icon {
                color: var(--x-text-color-secondary);
            }

            &:hover {

                .chevron-icon,
                span {
                    color: #409EFF;
                }
            }
        }

        .department-item {
            padding: 5px 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: background-color 0.2s;
            flex-wrap: wrap;

            &:hover {
                background-color: #f5f7fa;
            }

            .department-name {
                margin-left: 5px;
            }

            .department-next {
                cursor: pointer;

                &.disabled {
                    cursor: not-allowed;

                    .icon-text-container {
                        opacity: 0.4;
                        pointer-events: none;
                    }
                }
            }

            .node-path {
                flex-basis: 100%;
                margin-left: 24px;
                font-size: 12px;
                color: #909399;
                margin-top: 4px;
            }
        }

        .selected-item {
            padding: 7px 15px;
            display: flex;
            align-items: center;
            background-color: #f0f9ff;
            margin: 0 8px 8px;
            border-radius: 3px;

            .el-icon {
                color: #67c23a;
                margin-right: 8px;
            }

            span {
                flex: 1;
                color: #606266;
            }

            .remove-icon {
                cursor: pointer;
                color: #909399;

                &:hover {
                    color: #F56C6C;
                }
            }
        }
    }
}

/* 覆盖 Element Plus 弹窗样式 */
:deep(.el-dialog__header) {
    margin-right: 0;
    padding: 15px 20px;
    border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__headerbtn) {
    top: 15px;
    right: 15px;
}

:deep(.el-dialog__title) {
    font-weight: 500;
    font-size: 16px;
}

:deep(.el-dialog__body) {
    padding: 20px;
}

:deep(.el-dialog__footer) {
    border-top: 1px solid #e4e7ed;
    padding: 15px 20px;
}
</style>