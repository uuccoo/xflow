<template>
  <div>
    <el-form-item label="标题" :error="getErrorMessage(component.id, FORM_DESIGN_FIELD.LABEL)">
      <el-input v-model="component.label" placeholder="请输入标题" maxlength="50" show-word-limit></el-input>
    </el-form-item>
    <el-form-item label="提示文字">
      <el-input v-model="component.placeholder" placeholder="请输入提示文字" maxlength="50" show-word-limit></el-input>
    </el-form-item>
    <el-form-item label="选项设置">
      <OptionListEditor v-model="component.options" :component-id="component.id" @remove="handleOptionRemove" />
    </el-form-item>
    <el-form-item label="选项平铺">
      <el-switch v-model="component.optionTile"></el-switch>
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="component.required"></el-switch>
    </el-form-item>
    <el-form-item label="默认值">
      <el-select v-model="component.defaultValue" multiple placeholder="请选择默认值" style="width: 100%">
        <el-option v-for="option in component.options" :key="option.value" :label="option.label"
          :value="option.value"></el-option>
      </el-select>
    </el-form-item>
  </div>
</template>

<script setup>
import OptionListEditor from '@/components/form/property/OptionListEditor.vue'
import { FORM_DESIGN_FIELD, getErrorMessage } from '@/validation/formDesignValidator'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
});

// 删除选项时，从默认值数组中移除该选项
const handleOptionRemove = (removedOption) => {
  const idx = props.component.defaultValue.indexOf(removedOption.value)
  if (idx > -1) {
    props.component.defaultValue.splice(idx, 1)
  }
}
</script>
