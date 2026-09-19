<template>
  <el-form-item
    :prop="component.id"
    :rules="rules"
    :label="component.label"
    :required="component.required"
  >
    <el-select
      v-if="!component.optionTile"
      v-model="component.defaultValue"
      :placeholder="component.placeholder || '请选择' + component.label"
      style="width: 100%"
      :disabled="readonly"
    >
      <el-option
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
    <el-radio-group
      v-else
      class="vertical-option-group"
      v-model="component.defaultValue"
      :disabled="readonly"
    >
      <el-radio
        v-for="option in options"
        :key="option.value"
        :label="option.value"
        :disabled="readonly"
      >
        {{ option.label }}
      </el-radio>
    </el-radio-group>
  </el-form-item>
</template>

<script setup>
import { computed } from 'vue'

const { component, readonly } = defineProps({
  component: {
    type: Object,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const options = computed(() => component.options || [])
const rules = computed(() => [{
  required: component.required,
  message: `${component.label || '字段'} 为必填项`,
  trigger: ['blur', 'change'],
}])
</script>

<style scoped>
.vertical-option-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
</style>
