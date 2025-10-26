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
                <!-- 左侧部门列表 -->
                <div class="department-list">
                    <!-- 搜索框 - 已移动到此处 -->
                    <div class="search-box">
                        <el-input v-model="searchText" placeholder="搜索人员，支持拼音、姓名" :prefix-icon="Search" clearable
                            @input="watchSearchText" @clear="filteredNodesFlat = []" />
                    </div>

                    <div class="department-list-content">
                        <!-- 替换公司名称为面包屑导航 -->
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
                                <el-checkbox v-model="currentDepartment.checked"
                                    :disabled="props.onlySelectUsers"
                                    :indeterminate="currentDepartment.indeterminate" @change="(val) => {
                                        updateChildrenStatus(currentDepartment, val);
                                        updateParentStatus(currentDepartment);
                                        updateSelectedList();
                                    }">全选</el-checkbox>
                            </div>

                            <div class="level-nav">
                                <div class="level-nav-item" v-if="currentPath.length > 1" @click="() => {
                                    currentPath.pop();
                                    updateSelectedList();
                                }">
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
                        </div>

                        <div v-for="item in displayNodes" :key="item.id" class="department-item">
                            <el-checkbox v-model="item.checked"
                                :disabled="item.type === 'department' && props.onlySelectUsers"
                                :indeterminate="item.type === 'department' && item.indeterminate" 
                                @change="(val) => {
                                    if (props.singleMode && val) {
                                        // 单选模式下，清除之前选中的所有项
                                        handleSingleSelection(item);
                                    } else if (item.children && item.children.length > 0) {
                                        updateChildrenStatus(item, val);
                                    }
                                    updateParentStatus(currentDepartment);
                                    updateSelectedList();
                                }">
                                <span class="department-name">{{ item.name }}</span>
                            </el-checkbox>
                            <div v-if="item.type === 'department' && item.children && item.children.length > 0"
                                class="department-next" @click="() => {
                                    currentPath.push(item);
                                    updateSelectedList();
                                }">
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
                            <span v-if="isSearchMode" class="node-path">{{ getNodePathText(item.id) }}</span>
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
                                <component :is="item.type === 'user' ? User : Folder" />
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
import { ref, computed, watch, onMounted } from 'vue'
import { ArrowRight, Close, Search, User, Folder, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
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
    // 只能选择人员，部门不可勾选
    onlySelectUsers: {
        type: Boolean,
        default: false
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

// 搜索相关
const searchText = ref('')
const filteredNodesFlat = ref([])
const isSearchMode = computed(() => searchText.value.trim().length > 0)

// 加载状态
const loading = ref(false)
const loadingError = ref(false)

// 组织机构数据
const companyDepartments = ref(null)

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

// 初始化组织架构数据
const initOrganizationData = async () => {
    // 从API获取数据
    companyDepartments.value = await fetchOrganizationData()
    
    // 初始化当前路径
    if (companyDepartments.value) {
        currentPath.value = [companyDepartments.value]
    }
}

// 当前浏览的部门路径
const currentPath = ref([])

// 当前显示的部门内容
const currentDepartment = computed(() => {
    return currentPath.value[currentPath.value.length - 1] || {}
})

// 已选择的用户和部门列表
const selectedUsers = ref([])

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

// 更新已选列表
const updateSelectedList = () => {
    // 从树形结构中找出所有直接勾选的节点（不包括因父节点勾选而自动勾选的子节点）
    const allNodes = getAllNodesFlat(companyDepartments.value)
    
    // 收集所有父节点，用于判断哪些节点是因为父节点的勾选而自动勾选的
    const checkedParentIds = new Set()
    
    // 找到所有被勾选的父节点
    allNodes.forEach(node => {
        if (node.checked && node.children && node.children.length > 0) {
            // 判断是否所有子节点都被选中
            const allChildrenChecked = node.children.every(child => child.checked)
            if (allChildrenChecked) {
                // 如果所有子节点都被选中，我们认为这是一个勾选的父节点
                checkedParentIds.add(node.id)
            }
        }
    })
    
    // 过滤出用户直接勾选的节点（不包括因父节点勾选而自动勾选的子节点）
    const filteredNodes = allNodes
        .filter(item => {
            // 排除根公司节点
            if (item.id === 'company-1' || !item.checked) {
                return false
            }
            
            // 获取当前节点的所有父节点
            const nodePath = getNodePath(item.id)
            if (!nodePath || nodePath.length <= 1) {
                // 节点没有父节点或只有根节点作为父节点
                return item.checked
            }
            
            // 检查是否有父节点被勾选。如果有，则说明当前节点是因父节点勾选而自动勾选的
            for (let i = 0; i < nodePath.length - 1; i++) {
                if (checkedParentIds.has(nodePath[i].id)) {
                    return false
                }
            }
            
            // 通过上述检查，说明该节点是用户直接勾选的
            return true
        })
        .map(item => ({
            id: item.id,
            name: item.name,
            type: item.type
        }))
    
    // 使用 Map 确保没有重复项（根据 id 去重）
    const uniqueNodesMap = new Map()
    filteredNodes.forEach(node => {
        uniqueNodesMap.set(node.id, node)
    })
    
    // 转换回数组
    selectedUsers.value = Array.from(uniqueNodesMap.values())
}

// 更新父节点的状态
const updateParentStatus = (node) => {
    if (!node.children || node.children.length === 0) return

    // 检查是否有被选中的子节点（用户或部门）
    const someChecked = node.children.some(child => {
        return child.checked || child.indeterminate
    })
    
    // 不再自动勾选部门，即使所有子节点都被勾选
    // 只设置 indeterminate 状态
    node.indeterminate = someChecked && !node.checked

    // 递归向上更新所有父节点的状态
    if (currentPath.value.length > 1) {
        for (let i = currentPath.value.length - 2; i >= 0; i--) {
            const parent = currentPath.value[i]
            const childrenStatus = parent.children.map(child => ({
                checked: child.checked,
                indeterminate: child.indeterminate
            }))

            // 同样，不自动勾选父部门
            const someChildrenChecked = childrenStatus.some(s => s.checked || s.indeterminate)
            parent.indeterminate = someChildrenChecked && !parent.checked
        }
    }
}

// 更新子节点的状态
const updateChildrenStatus = (node, checked) => {
    if (!node.children) return

    node.children.forEach(child => {
        // 在只选择用户模式下，部门节点不可选
        if (props.onlySelectUsers && child.type === 'department') {
            child.checked = false;
        } else {
            child.checked = checked;
        }
        child.indeterminate = false

        if (child.children && child.children.length > 0) {
            updateChildrenStatus(child, checked)
        }
    })
}

// 从已选列表中移除
const removeSelected = (itemToRemove) => {
    // 在整个树结构中查找并取消勾选对应节点
    const findAndUncheck = (node) => {
        if (node.id === itemToRemove.id) {
            node.checked = false
            if (node.type === 'department') {
                node.indeterminate = false
                // 如果是部门，则取消其下所有子节点的勾选
                updateChildrenStatus(node, false)
            }
            return true
        }

        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                if (findAndUncheck(child)) {
                    // 更新父节点的状态
                    updateParentStatus(node)
                    return true
                }
            }
        }

        return false
    }

    findAndUncheck(companyDepartments.value)

    // 更新已选人员列表
    updateSelectedList()
}

// 单选模式下处理选择逻辑
const handleSingleSelection = (selectedItem) => {
    // 先清除所有选中状态
    const clearAllSelections = (node) => {
        node.checked = false
        node.indeterminate = false

        if (node.children && node.children.length > 0) {
            node.children.forEach(clearAllSelections)
        }
    }

    clearAllSelections(companyDepartments.value)
    
    // 只选中当前项
    selectedItem.checked = true
    
    // 更新父节点状态
    const nodePath = getNodePath(selectedItem.id)
    if (nodePath && nodePath.length > 1) {
        // 更新路径上所有父节点的状态
        for (let i = nodePath.length - 2; i >= 0; i--) {
            const parent = nodePath[i]
            // 只设置 indeterminate 状态，不自动勾选父部门
            parent.indeterminate = true
            parent.checked = false
        }
    }
}

// 清空所有已选
const clearSelected = () => {
    // 递归清空所有选中状态
    const clearCheckedStatus = (node) => {
        node.checked = false
        node.indeterminate = false

        if (node.children && node.children.length > 0) {
            node.children.forEach(clearCheckedStatus)
        }
    }

    clearCheckedStatus(companyDepartments.value)

    // 更新已选人员列表
    updateSelectedList()
}

// 搜索过滤函数
const handleSearch = () => {
    if (!searchText.value.trim()) {
        filteredNodesFlat.value = []
        return
    }

    // 在整个树中搜索匹配的节点
    const keyword = searchText.value.toLowerCase().trim()
    const allNodes = getAllNodesFlat(companyDepartments.value)

    // 过滤匹配的节点，不包括根节点
    filteredNodesFlat.value = allNodes.filter(node =>
        node.id !== 'company-1' &&
        node.name.toLowerCase().includes(keyword)
    )
}

// 监听搜索文本变化
const debouncedSearch = ref(null)
const watchSearchText = () => {
    if (debouncedSearch.value) {
        clearTimeout(debouncedSearch.value)
    }
    debouncedSearch.value = setTimeout(() => {
        handleSearch()
    }, 300)
}

// 当前显示的节点列表（根据是否在搜索模式切换）
const displayNodes = computed(() => {
    if (isSearchMode.value) {
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

    // 递归设置所有节点的选中状态
    const setNodeCheckedState = (node) => {
        if (selectedIds.includes(node.id)) {
            node.checked = true
        } else {
            node.checked = false
            node.indeterminate = false
        }

        if (node.children && node.children.length > 0) {
            node.children.forEach(setNodeCheckedState)

            // 更新父节点状态
            const someChecked = node.children.some(child => child.checked || child.indeterminate)

            // 不自动勾选部门，即使所有子节点都被勾选
            if (someChecked && !node.checked) {
                node.indeterminate = true
            }
        }
    }

    setNodeCheckedState(companyDepartments.value)

    // 重置路径到根节点
    currentPath.value = [companyDepartments.value]

    // 清空搜索
    searchText.value = ''
    filteredNodesFlat.value = []

    // 更新已选列表
    updateSelectedList()
}

// 导航到指定的部门层级
const navigateToDepartment = (index) => {
    if (index < currentPath.value.length - 1) {
        // 截取到指定层级
        currentPath.value = currentPath.value.slice(0, index + 1);
        updateSelectedList();
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

// 处理弹窗关闭事件
const handleDialogClosed = () => {
    // 弹窗关闭时重置状态
    searchText.value = ''
    filteredNodesFlat.value = []
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

        .department-list,
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

                .level-nav {
                    font-size: 14px;

                    .level-nav-item {
                        color: #909399;
                        text-decoration: none;
                        display: flex;
                        align-items: center;

                        .back-icon {
                            margin-right: 4px;
                            font-size: 12px;
                        }

                        &:hover {
                            color: #409EFF;
                        }
                    }
                }

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

            .level-nav {
                font-size: 14px;

                .level-nav-item {
                    color: #909399;
                    text-decoration: none;
                    display: flex;
                    align-items: center;

                    .back-icon {
                        margin-right: 4px;
                        font-size: 12px;
                    }

                    &:hover {
                        color: #409EFF;
                    }
                }
            }
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
            cursor: pointer;

            .chevron-icon {
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
                color: #909399;
            }

            span {
                font-size: 14px;
                line-height: 1;
                display: inline-block;
                vertical-align: middle;
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
            }

            .chevron-icon {
                color: #c0c4cc;
                font-size: 14px;
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