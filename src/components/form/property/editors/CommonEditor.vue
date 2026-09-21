<template>
    <div>
        <el-form-item label="标题" :error="getErrorMessage(component.id, FORM_DESIGN_FIELD.LABEL)">
            <el-input v-model="component.label" placeholder="请输入标题" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item v-if="component.hasOwnProperty('placeholder')" label="提示文字">
            <el-input v-model="component.placeholder" placeholder="请输入提示文字" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="是否必填">
            <el-switch v-model="component.required"></el-switch>
        </el-form-item>
        <el-form-item v-if="DEFAULT_VALUE_TYPES.includes(component.type)" label="默认值">
            <el-input v-model="component.defaultValue" placeholder="请输入默认值"></el-input>
        </el-form-item>
    </div>
</template>

<script setup>
import { FormComponentType } from '@/enums'
import { FORM_DESIGN_FIELD, getErrorMessage } from '@/validation/formDesignValidator'

// 支持配置默认值的组件类型
const DEFAULT_VALUE_TYPES = [
    FormComponentType.INPUT,
    FormComponentType.TEXTAREA,
]

const props = defineProps({
    component: {
        type: Object,
        required: true
    }
});
</script>