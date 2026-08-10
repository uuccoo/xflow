<template>
  <div>
    <el-form-item label="标题">
      <el-input v-model="component.label" placeholder="请输入标题" maxlength="50" show-word-limit></el-input>
    </el-form-item>
    <el-form-item label="提示文字">
      <el-input v-model="component.placeholder" placeholder="请输入提示文字" maxlength="50" show-word-limit></el-input>
    </el-form-item>
    <el-form-item label="选项设置">
      <OptionListEditor v-model="component.options" @remove="handleOptionRemove" />
    </el-form-item>
    <el-form-item label="选项平铺">
      <el-switch v-model="component.optionTile"></el-switch>
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="component.required"></el-switch>
    </el-form-item>
    <el-form-item label="默认值">
      <el-select v-model="component.defaultValue" placeholder="请选择默认值" style="width: 100%">
        <el-option v-for="option in component.options" :key="option.value" :label="option.label"
          :value="option.value"></el-option>
      </el-select>
    </el-form-item>
  </div>
</template>

<script setup>
import OptionListEditor from '@/components/form/property/OptionListEditor.vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
});

// 删除选项时，若该选项是当前默认值，则清空默认值
const handleOptionRemove = (removedOption) => {
  if (props.component.defaultValue === removedOption.value) {
    props.component.defaultValue = ''
  }
}
</script>