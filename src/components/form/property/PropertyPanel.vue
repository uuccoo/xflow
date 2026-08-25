<template>
    <div class="property-panel">
        <div class="property-header">
            属性设置<span v-if="component" class="component-name">（{{ props.component.name }}）</span>
        </div>

        <el-form v-if="component" label-position="top" class="property-form">
            <!-- 根据组件类型动态选择编辑器组件 -->
            <component :is="getEditorComponent(component.type)" :component="component" />
        </el-form>
        <div v-else class="empty-tip">
            请选择一个组件进行配置
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import ColumnsEditor from './editors/ColumnsEditor.vue'
import TextEditor from './editors/TextEditor.vue'
import NumberEditor from './editors/NumberEditor.vue'
import RadioEditor from './editors/RadioEditor.vue'
import CheckboxEditor from './editors/CheckboxEditor.vue'
import DateEditor from './editors/DateEditor.vue'
import DateRangeEditor from './editors/DateRangeEditor.vue'
import CommonEditor from './editors/CommonEditor.vue'
import { FormComponentType } from '@/enums'

// 接收组件属性
const props = defineProps({
    component: {
        type: Object,
        default: null
    }
})

// 根据组件类型获取对应的编辑器组件
const getEditorComponent = (type) => {
    switch (type) {
        case FormComponentType.COLUMNS:
            return ColumnsEditor
        case FormComponentType.TEXT:
            return TextEditor
        case FormComponentType.NUMBER:
            return NumberEditor
        case FormComponentType.RADIO:
            return RadioEditor
        case FormComponentType.CHECKBOX:
            return CheckboxEditor
        case FormComponentType.DATE:
            return DateEditor
        case FormComponentType.DATERANGE:
            return DateRangeEditor
        default:
            return CommonEditor
    }
}
</script>

<style scoped lang="scss">
.property-panel {
    background-color: #ffffff;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;

    .property-header {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        padding: 10px 16px;
        border-bottom: var(--x-border-base);
    }

    .property-form {
        margin-top: 15px;
        padding: 0 15px;
        flex: 1;
        overflow-y: auto;
    }
}

.empty-tip {
    color: #909399;
    font-size: 14px;
    text-align: center;
    margin: auto;
}
</style>