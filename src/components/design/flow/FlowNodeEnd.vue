<template>
    <div class="flow-end">
        <div class="end-node">
            <span>流程结束</span>
        </div>
    </div>
</template>

<script setup>
// 无需额外逻辑
</script>

<style scoped lang="scss">
.flow-end {
    position: relative;
    padding-top: 15px;

    /* 连接线 */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        height: 15px;
        border-left: 1px dashed #c0c4cc;
    }

    .end-node {
        padding: 6px 12px;
        /* 减小内边距 */
        background-color: #f5f7fa;
        border-radius: 10px;
        /* 减小边框圆角 */
        font-size: 14px;
        color: #909399;
        border: 1px solid #e4e7ed;
        text-align: center;
        max-width: 100px;
        /* 限制最大宽度 */
        margin: 0 auto;
        /* 居中显示 */
    }
}
</style>