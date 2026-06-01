<template>
    <div>
        <el-form-item label="标题1">
            <el-input v-model="component.startLabel" placeholder="请输入标题1" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="标题2">
            <el-input v-model="component.endLabel" placeholder="请输入标题2" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="提示文字">
            <el-input v-model="component.placeholder" placeholder="请输入提示文字" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="日期类型">
            <el-select v-model="component.dateType" style="width: 100%">
                <el-option label="年-月-日" value="date"></el-option>
                <el-option label="年-月-日 时:分" value="datetime"></el-option>
                <el-option label="年-月-日 上午/下午" value="datetimeAmPm"></el-option>
                <el-option label="年-月" value="month"></el-option>
            </el-select>
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