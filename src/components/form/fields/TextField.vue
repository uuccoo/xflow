<template>
  <el-form-item :label="component.label">
    <div class="text-field">{{ component.content || '' }}</div>
  </el-form-item>
</template>

<script setup>
defineProps({
  component: { type: Object, required: true },
})
</script>

<style scoped>
.text-field {
  padding: 10px;
  color: #606266;
  background-color: #f8f8f8;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
</style>
