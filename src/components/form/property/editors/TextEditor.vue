<template>
    <div>
        <el-form-item label="标题" :error="getErrorMessage(component.id, FORM_DESIGN_FIELD.LABEL)">
            <el-input v-model="component.label" placeholder="请输入标题" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="内容">
            <el-input type="textarea" v-model="component.content" placeholder="请输入说明文字内容" :rows="4"></el-input>
        </el-form-item>
    </div>
</template>

<script setup>
import { FORM_DESIGN_FIELD, getErrorMessage } from '@/validation/formDesignValidator'

const props = defineProps({
    component: {
        type: Object,
        required: true
    }
});
</script>