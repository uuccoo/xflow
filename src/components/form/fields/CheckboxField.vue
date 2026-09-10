<template>
  <el-form-item
    :label="component.label"
    :required="component.required"
    :error="error?.message || ''"
  >
    <el-select
      v-if="!component.optionTile"
      v-model="component.defaultValue"
      multiple
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
    <el-checkbox-group
      v-else
      class="vertical-option-group"
      v-model="component.defaultValue"
      :disabled="readonly"
    >
      <el-checkbox
        v-for="option in options"
        :key="option.value"
        :label="option.value"
        :disabled="readonly"
      >
        {{ option.label }}
      </el-checkbox>
    </el-checkbox-group>
  </el-form-item>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
  error: {
    type: Object,
    default: null,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const options = computed(() => props.component.options || [])
</script>

<style scoped>
.vertical-option-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
</style>
