<template>
  <div>
    <el-form-item label="标题">
      <el-input v-model="component.title" placeholder="请输入标题" maxlength="50" show-word-limit></el-input>
    </el-form-item>
    <el-form-item label="编码">
      <el-input v-model="component.field" placeholder="请输入字段名" disabled></el-input>
    </el-form-item>
    <el-form-item label="提示文字">
      <el-input v-model="component.placeholder" placeholder="请输入提示文字" maxlength="50" show-word-limit></el-input>
    </el-form-item>
    <el-form-item label="最小值">
      <el-input-number v-model="component.min" :step="1" style="width: 100%"></el-input-number>
    </el-form-item>
    <el-form-item label="最大值">
      <el-input-number v-model="component.max" :step="1" style="width: 100%"></el-input-number>
    </el-form-item>
    <el-form-item label="步长">
      <el-input-number v-model="component.step" :step="0.1" :precision="1" style="width: 100%"></el-input-number>
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="component.required"></el-switch>
    </el-form-item>
    <el-form-item label="默认值">
      <el-input-number v-model="component.defaultValue" :step="1" style="width: 100%"></el-input-number>
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