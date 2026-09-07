<template>
  <div>
    <el-form-item label="标题" :error="getErrorMessage(component.id, FORM_DESIGN_FIELD.LABEL)">
      <el-input v-model="component.label" placeholder="请输入标题" maxlength="50" show-word-limit></el-input>
    </el-form-item>
    <el-form-item label="提示文字">
      <el-input v-model="component.placeholder" placeholder="请输入提示文字" maxlength="50" show-word-limit></el-input>
    </el-form-item>
    <el-form-item label="最小值">
      <el-input-number v-model="component.min" placeholder="不限制" style="width: 100%"></el-input-number>
    </el-form-item>
    <el-form-item label="最大值">
      <el-input-number v-model="component.max" placeholder="不限制" style="width: 100%"></el-input-number>
    </el-form-item>
    <el-form-item label="小数位数">
      <el-input-number v-model="component.precision" :min="0" placeholder="不限制" style="width: 100%"></el-input-number>
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="component.required"></el-switch>
    </el-form-item>
    <el-form-item label="默认值">
      <el-input-number v-model="component.defaultValue" :min="component.min" :max="component.max" :precision="component.precision" style="width: 100%"></el-input-number>
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