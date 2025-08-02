<template>
    <div>
        <el-form-item label="标题">
            <el-input v-model="component.title" placeholder="请输入标题" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="内容">
            <el-input type="textarea" v-model="component.content" placeholder="请输入说明文字内容" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="字体大小">
            <el-select v-model="component.fontSize" style="width: 100%">
                <el-option label="小" value="12px"></el-option>
                <el-option label="中" value="14px"></el-option>
                <el-option label="大" value="16px"></el-option>
                <el-option label="超大" value="18px"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="文字颜色">
            <el-color-picker v-model="component.color"></el-color-picker>
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