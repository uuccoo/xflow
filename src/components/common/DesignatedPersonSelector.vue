<template>
    <div class="personnel-selector">
        <!-- 添加按钮 -->
        <el-button class="select-personnel" type="primary" @click="handleOpenSelector">
            <el-icon>
                <Plus />
            </el-icon>
            {{ buttonText }}
        </el-button>

        <!-- 已选人员列表 -->
        <div v-if="modelValue.length" class="selected-users">
            <el-tag v-for="(user, idx) in modelValue" :key="user.id" closable @close="handleRemove(idx)">
                {{ user.name }}
            </el-tag>
        </div>

        <!-- 集成的PersonSelector组件 -->
        <person-selector
            v-model="selectorVisible"
            :title="title"
            :selected-ids="selectedIds"
            :single-mode="singleMode"
            :only-select-users="onlySelectUsers"
            @confirm="handleConfirm"
            @cancel="handleCancel"
            ref="personSelectorRef"
        />
    </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import { ElMessage } from 'element-plus'
import PersonSelector from './PersonSelector.vue'

// 使用 store
const flowStore = useFlowDesignStore()

// 定义组件属性
const props = defineProps({
    // 已选人员列表，通过v-model绑定
    modelValue: {
        type: Array,
        default: () => []
    },
    // 选择器标题
    title: {
        type: String,
        default: '选择人员'
    },
    // 按钮文本
    buttonText: {
        type: String,
        default: '添加'
    },
    // 是否必填
    required: {
        type: Boolean,
        default: false
    },
    // 选择器类型，用于区分不同场景
    selectorType: {
        type: String,
        default: 'default'
    },
    // 透传给 PersonSelector 的单选模式
    singleMode: {
        type: Boolean,
        default: false
    },
    // 透传给 PersonSelector 的仅可选用户
    onlySelectUsers: {
        type: Boolean,
        default: false
    }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'change'])

// 选择器可见状态
const selectorVisible = ref(false)

// PersonSelector组件引用
const personSelectorRef = ref(null)

// 选中的人员ID列表（用于传递给PersonSelector）
const selectedIds = computed(() => {
    return props.modelValue.map(user => user.id)
})

// 打开人员选择器
const handleOpenSelector = () => {
    selectorVisible.value = true
}

// 处理确认选择
const handleConfirm = (result) => {
    // 更新人员列表
    emit('update:modelValue', result.selectedUsers)
    // 触发change事件
    emit('change', result.selectedUsers)

    ElMessage.success('人员已选择，请点击保存生效')

    // 关闭选择器
    selectorVisible.value = false
}

// 处理取消选择
const handleCancel = () => {
    selectorVisible.value = false
}

// 删除已选人员
const handleRemove = (index) => {
    const newList = [...props.modelValue]
    newList.splice(index, 1)

    // 更新人员列表
    emit('update:modelValue', newList)
    // 触发change事件
    emit('change', newList)
}

// 暴露方法，允许父组件手动触发选择器初始化
defineExpose({
    openSelector: handleOpenSelector,
    clearSelected: () => {
        if (personSelectorRef.value) {
            personSelectorRef.value.clearSelected()
        }
        emit('update:modelValue', [])
        emit('change', [])
    }
})
</script>

<style scoped lang="scss">
.personnel-selector {
    display: flex;
    align-items: flex-start;
}

.select-personnel.el-button {
    margin-right: 10px;

    .el-icon {
        margin-right: 4px;
        vertical-align: middle;
    }
}

.selected-users {
    align-self: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
</style>