<template>
  <div class="flow-branch-container parallel-container">
    <!-- 并行分支顶部按钮 -->
    <div class="branch-add-btn">
      <el-button size="small" type="primary" plain round @click="$emit('add-branch', node)">添加分支</el-button>
      <el-button v-if="showDeleteBtn" size="small" type="danger" plain round icon="Delete" @click="$emit('delete', node, index)" />
    </div>

    <!-- 并行分支内容 -->
    <div class="flow-branch">
      <div class="branch-item" v-for="(branch, branchIndex) in node.props.branches" :key="branchIndex">
        <!-- 分支项头部 -->
        <div class="flow-node parallel-branch">
          <div class="branch-header">
            {{ branch.name }}
            <!-- 删除分支按钮 -->
            <el-icon v-if="node.props.branches.length > 2" class="branch-delete" @click="$emit('delete-branch', node, branchIndex)">
              <Delete />
            </el-icon>
          </div>
          
          <!-- 分支标题点击可编辑 -->
          <div class="node-content branch-content" @click="$emit('edit-branch', node, branchIndex, branch)">
            <span>{{ branch.name }}</span>
            <el-icon class="chevron-icon">
              <Edit />
            </el-icon>
          </div>
        </div>

        <!-- 分支内的节点列表 -->
        <div class="branch-nodes" v-if="branch.nodes && branch.nodes.length > 0">
          <flow-node-basic
            v-for="(branchNode, nodeIdx) in branch.nodes"
            :key="branchNode.id"
            :node="branchNode"
            :index="nodeIdx"
            :node-options="nodeOptions"
            @delete="handleDeleteBranchNode(node, branchIndex, nodeIdx)"
            @select-approvers="$emit('select-approvers', $event)"
            @select-users="$emit('select-users', $event)"
            @select-processors="$emit('select-processors', $event)"
            @configure="$emit('configure', $event)"
          />
        </div>

        <!-- 为每个并行分支添加节点按钮 -->
        <slot :branch="branch" :branch-index="branchIndex"></slot>
      </div>
    </div>

    <!-- 并行分支汇合点 -->
    <div class="branch-join">
      <div class="join-node">
        <span>{{ getJoinStrategyText(node.props.joinStrategy) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete, Edit } from '@element-plus/icons-vue'
import FlowNodeBasic from './FlowNodeBasic.vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  nodeOptions: {
    type: Array,
    required: true
  },
  showDeleteBtn: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'delete',
  'delete-branch',
  'add-branch', 
  'edit-branch',
  'select-approvers', 
  'select-users',
  'select-processors',
  'configure'
])

// 处理删除分支内节点
const handleDeleteBranchNode = (parentNode, branchIndex, nodeIdx) => {
  // 传递一个特殊的路径标识，表示这是并行分支内的节点
  const parentPath = `${props.index}-p${branchIndex}-${nodeIdx}`
  emit('delete', parentNode.props.branches[branchIndex].nodes[nodeIdx], nodeIdx, parentPath)
}

// 获取汇合策略文本
const getJoinStrategyText = (strategy) => {
  const strategies = {
    'all': '全部完成后继续',
    'any': '任一完成后继续',
    'majority': '多数完成后继续'
  }
  return strategies[strategy] || '全部完成后继续'
}
</script>

<style scoped lang="scss">
/* 分支容器样式 */
.parallel-container {
  width: 100%;
  margin-bottom: 15px;
  position: relative;
}

/* 分支顶部按钮样式 */
.branch-add-btn {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 10px 0 20px;

  .el-button {
    background-color: white;
    font-size: 13px;
    padding: 8px 20px;
    height: auto;
  }
}

/* 分支样式 */
.flow-branch {
  width: 100%;
  display: flex;
  gap: 30px;
  position: relative;
  padding: 30px 0 0;
  margin-bottom: 15px;

  /* 分支上方连接线 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    height: 15px;
    border-left: 1px dashed #c0c4cc;
    transform: translateX(-50%);
  }

  /* 分支顶部横线 */
  &::after {
    content: '';
    position: absolute;
    top: 15px;
    left: 20%;
    width: 60%;
    border-top: 1px dashed #c0c4cc;
  }

  .branch-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    /* 分支顶部竖线 */
    &::before {
      content: '';
      position: absolute;
      top: -15px;
      left: 50%;
      height: 15px;
      border-left: 1px dashed #c0c4cc;
    }
  }
}

.branch-header {
  display: flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 13px;
  color: #333;
  margin-bottom: 0;
  background-color: white;
  border: 1px solid #e4e7ed;
  z-index: 1;
  position: relative;
  
  .branch-delete {
    margin-left: 8px;
    color: #f56c6c;
    cursor: pointer;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover .branch-delete {
    opacity: 1;
  }
}

.parallel-branch {
  width: 100%;
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  background-color: white;
  border-left: 3px solid #1890ff;

  .branch-content {
    padding: 14px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #606266;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }
    
    .chevron-icon {
      color: #c0c4cc;
    }
  }
}

.branch-nodes {
  width: 100%;
  margin-top: 5px;
}

/* 并行分支汇合点样式 */
.branch-join {
  position: relative;
  padding-top: 15px;
  margin-bottom: 15px;
  
  /* 连接线 - 多条线汇合 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    height: 15px;
    border-left: 1px dashed #c0c4cc;
    transform: translateX(-50%);
  }
  
  /* 横线，连接所有分支 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 20%;
    width: 60%;
    border-top: 1px dashed #c0c4cc;
  }
  
  .join-node {
    margin: 0 auto;
    padding: 8px 16px;
    background-color: #e6f7ff;
    border-radius: 15px;
    font-size: 13px;
    color: #1890ff;
    border: 1px solid #91d5ff;
    text-align: center;
    max-width: 180px;
  }
}
</style>