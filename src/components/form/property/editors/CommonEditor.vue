<template>
    <div>
        <el-form-item label="标题">
            <el-input v-model="component.label" placeholder="请输入标题" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item v-if="component.hasOwnProperty('placeholder')" label="提示文字">
            <el-input v-model="component.placeholder" placeholder="请输入提示文字" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="是否必填">
            <el-switch v-model="component.required"></el-switch>
        </el-form-item>
        <el-form-item v-if="component.hasOwnProperty('defaultValue')" label="默认值">
            <el-input v-model="component.defaultValue" placeholder="请输入默认值"></el-input>
        </el-form-item>
    </div>
</template>

<script setup>
const props = defineProps({
    component: {
        type: Object,
        required: true
    }
});
</script>