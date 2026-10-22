<template>
    <div class="user-avatar-wrapper" :class="{ 'horizontal': layout === 'horizontal' }">
        <el-avatar
            :size="size"
            :src="user.avatar"
            :shape="shape"
            class="user-avatar">
            {{ getAvatarText }}
        </el-avatar>
        <span v-if="showName" class="user-name">{{ getUserName }}</span>
    </div>
</template>

<script setup>
import { computed } from 'vue';

// Props 定义
const props = defineProps({
    // 用户对象
    user: {
        type: Object,
        required: true,
        default: () => ({})
    },
    // 头像大小
    size: {
        type: Number,
        default: 30
    },
    // 头像形状: circle(圆形) / square(方形)
    shape: {
        type: String,
        default: 'circle',
        validator: (value) => ['circle', 'square'].includes(value)
    },
    // 布局方式: vertical(竖直) / horizontal(水平)
    layout: {
        type: String,
        default: 'vertical',
        validator: (value) => ['vertical', 'horizontal'].includes(value)
    },
    // 是否显示名字
    showName: {
        type: Boolean,
        default: true
    }
});

// 获取用户名
const getUserName = computed(() => {
    return props.user.realName || props.user.name || '未命名';
});

// 获取头像文字(取名字首字)
const getAvatarText = computed(() => {
    const name = getUserName.value;
    return name.substring(0, 1) || '未';
});
</script>

<style scoped lang="scss">
.user-avatar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    &.horizontal {
        flex-direction: row;
        gap: 8px;
    }
}

.user-avatar {
    border: 1px solid #d9ecff;
    background-color: #409EFF;
    color: #fff;
}

.user-name {
    font-size: 13px;
    margin-top: 4px;
    text-align: center;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    .horizontal & {
        margin-top: 0;
        max-width: 100px;
    }
    
    .user-avatar-wrapper:not(.horizontal) & {
        max-width: 50px;
    }
}
</style>
