<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    :width="size" 
    :height="size" 
    viewBox="0 0 24 24"
    :style="{ color: color }"
  >
    <path 
      fill="currentColor" 
      d="M4 6a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1m0 4a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1m0 4a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1m0 4a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1"
    />
  </svg>
</template>

<script setup>
defineProps({
  // 图标大小，默认24px
  size: {
    type: [String, Number],
    default: 24
  },
  // 图标颜色，默认继承父元素颜色
  color: {
    type: String,
    default: 'currentColor'
  }
});
</script>
