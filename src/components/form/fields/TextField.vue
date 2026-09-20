<template>
  <el-form-item class="text-form-item">
    <div class="text-field">{{ component.content || '' }}</div>
  </el-form-item>
</template>

<script setup>
defineModel()

defineProps({
  component: { type: Object, required: true },
})
</script>

<style scoped>
.text-field {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  color: #606266;
  line-height: 1.5;
  background-color: #f8f8f8;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
</style>
