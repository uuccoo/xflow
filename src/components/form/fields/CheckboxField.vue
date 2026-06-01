<template>
  <el-select
    v-if="!props.component.optionTile"
    :model-value="props.modelValue"
    multiple
    :placeholder="props.component.placeholder || '请选择' + props.component.label"
    style="width: 100%"
    :disabled="props.readonly"
    @update:model-value="onModelValueChange"
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
    :model-value="props.modelValue"
    :disabled="props.readonly"
    @update:model-value="onModelValueChange"
  >
    <el-checkbox
      v-for="option in options"
      :key="option.value"
      :label="option.value"
      :disabled="props.readonly"
    >
      {{ option.label }}
    </el-checkbox>
  </el-checkbox-group>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const options = computed(() => props.component.options || [])

const onModelValueChange = (value) => {
  if (props.readonly) return
  emit('update:modelValue', value)
}
</script>

<style scoped>
.vertical-option-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
</style>
