<template>
    <div>
        <el-form-item label="标题">
            <el-input v-model="component.label" placeholder="请输入标题" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="提示文字">
            <el-input v-model="component.placeholder" placeholder="请输入提示文字" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="日期格式">
            <el-select v-model="component.format" style="width: 100%">
                <el-option label="年-月-日 时:分:秒" value="YYYY-MM-DD HH:mm:ss"></el-option>
                <el-option label="年-月-日" value="YYYY-MM-DD"></el-option>
                <el-option label="年/月/日" value="YYYY/MM/DD"></el-option>
                <el-option label="年年年年-月月-日日" value="YYYY-MM-DD"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="分隔符">
            <el-input v-model="component.rangeSeparator" placeholder="请输入日期区间分隔符"></el-input>
        </el-form-item>
        <el-form-item label="是否必填">
            <el-switch v-model="component.required"></el-switch>
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