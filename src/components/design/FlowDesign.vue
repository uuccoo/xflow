<template>
  <div class="flow-design-container">
    <div class="flow-canvas">
      <!-- 流程图主体 -->
      <div class="flow-chart">
        <!-- 发起人节点 -->
        <div class="flow-node initiator">
          <div class="node-header">
            <span class="node-icon"><el-icon>
                <User />
              </el-icon></span>
            <span class="node-title">发起人</span>
          </div>
          <div class="node-content">
            <div class="node-item" @click="showPersonSelector">
              <span>所有人</span>
              <el-icon class="chevron-icon">
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>

        <!-- 添加节点按钮 -->
        <div class="node-add-btn">
          <el-button circle class="add-btn" @click="showAddNodeMenu = !showAddNodeMenu">
            <el-icon>
              <Plus />
            </el-icon>
          </el-button>
          <!-- 添加条件菜单 -->
          <div v-show="showAddNodeMenu" class="add-condition-menu">
            <div class="menu-title">添加条件</div>
            <div class="condition-options">
              <el-button class="option-btn" @click="addCondition('条件1')">条件1</el-button>
              <div class="option-tips">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
                <span>设置条件</span>
              </div>
              <div class="condition-inputs">
                <div class="input-row">
                  <div>请设置条件</div>
                </div>
              </div>
            </div>
            <div class="menu-action">
              <el-button type="primary" @click="saveCondition">确定</el-button>
              <el-button @click="showAddNodeMenu = false">取消</el-button>
            </div>
          </div>
        </div>

        <!-- 条件分支 -->
        <div class="flow-branch">
          <!-- 分支条件1 -->
          <div class="branch-item">
            <div class="branch-header">
              <span>优先级1</span>
            </div>
            <div class="flow-node condition">
              <div class="node-header">
                <span class="node-title">条件1</span>
                <el-dropdown trigger="click">
                  <span class="el-dropdown-link">
                    <el-icon>
                      <More />
                    </el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>编辑条件</el-dropdown-item>
                      <el-dropdown-item>删除条件</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="node-content">
                <div class="condition-content">
                  请设置条件
                </div>
              </div>
            </div>

            <!-- 条件1的添加节点按钮 -->
            <div class="node-add-btn">
              <el-button circle class="add-btn">
                <el-icon>
                  <Plus />
                </el-icon>
              </el-button>
            </div>
          </div>

          <!-- 分支条件2 -->
          <div class="branch-item">
            <div class="branch-header">
              <span>优先级2</span>
            </div>
            <div class="flow-node condition">
              <div class="node-header">
                <span class="node-title">条件2</span>
                <el-dropdown trigger="click">
                  <span class="el-dropdown-link">
                    <el-icon>
                      <More />
                    </el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>编辑条件</el-dropdown-item>
                      <el-dropdown-item>删除条件</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="node-content">
                <div class="condition-content">
                  其他条件进入此流程
                </div>
              </div>
            </div>

            <!-- 条件2下的审批人节点 -->
            <div class="flow-node approver">
              <div class="node-header">
                <span class="node-icon"><el-icon>
                    <User />
                  </el-icon></span>
                <span class="node-title">审批人</span>
                <el-dropdown trigger="click">
                  <span class="el-dropdown-link">
                    <el-icon>
                      <More />
                    </el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>编辑节点</el-dropdown-item>
                      <el-dropdown-item>删除节点</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="node-content">
                <div class="node-item">
                  <span>请选择审批人</span>
                  <el-icon class="chevron-icon">
                    <ArrowRight />
                  </el-icon>
                </div>
              </div>
            </div>

            <!-- 添加节点按钮 -->
            <div class="node-add-btn">
              <el-button circle class="add-btn">
                <el-icon>
                  <Plus />
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 结束节点 -->
        <div class="flow-end">
          <div class="end-node">
            <span>流程结束</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧组件面板 -->
    <div class="component-panel">
      <div class="panel-header">
        <h3>组件</h3>
      </div>
      <div class="component-list">
        <div class="component-item" @click="addNode('approver')">
          <div class="component-icon approver-icon">
            <el-icon>
              <User />
            </el-icon>
          </div>
          <div class="component-name">审批人</div>
        </div>
        <div class="component-item" @click="addNode('copyTo')">
          <div class="component-icon copyto-icon">
            <el-icon>
              <Document />
            </el-icon>
          </div>
          <div class="component-name">抄送人</div>
        </div>
        <div class="component-item" @click="addNode('process')">
          <div class="component-icon process-icon">
            <el-icon>
              <Edit />
            </el-icon>
          </div>
          <div class="component-name">办理</div>
        </div>
        <div class="component-item" @click="addNode('condition')">
          <div class="component-icon condition-icon">
            <el-icon>
              <TurnOff />
            </el-icon>
          </div>
          <div class="component-name">条件分支</div>
        </div>
        <div class="component-item" @click="addNode('automation')">
          <div class="component-icon automation-icon">
            <el-icon>
              <Setting />
            </el-icon>
          </div>
          <div class="component-name">自动化</div>
        </div>
        <div class="component-item" @click="addNode('connector')">
          <div class="component-icon connector-icon">
            <el-icon>
              <Connection />
            </el-icon>
          </div>
          <div class="component-name">连接器</div>
        </div>
        <div class="component-item" @click="addNode('parallel')">
          <div class="component-icon parallel-icon">
            <el-icon>
              <Sort />
            </el-icon>
          </div>
          <div class="component-name">并行分支</div>
        </div>
        <div class="component-item" @click="addNode('payment')">
          <div class="component-icon payment-icon">
            <el-icon>
              <Money />
            </el-icon>
          </div>
          <div class="component-name">付款人</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  User,
  ArrowRight,
  Plus,
  More,
  QuestionFilled,
  Document,
  Edit,
  Connection,
  Sort,
  TurnOff,
  Setting,
  Money
} from '@element-plus/icons-vue'

// 发起人信息
const initiator = ref('zc企业')

// 控制添加节点菜单的显示
const showAddNodeMenu = ref(false)

// 存储流程节点
const flowNodes = reactive([
  {
    id: 1,
    type: 'initiator',
    name: '发起人',
    props: {
      initiator: 'zc企业'
    }
  }
])

// 添加节点
const addNode = (type) => {
  console.log(`添加节点类型: ${type}`)
  // 实际项目中可以弹出对话框进行配置
}

// 添加条件分支
const addCondition = (conditionName) => {
  console.log(`添加条件: ${conditionName}`)
  // 添加条件逻辑
}

// 保存条件
const saveCondition = () => {
  console.log('保存条件')
  showAddNodeMenu.value = false
}

// 显示人员选择器
const showPersonSelector = () => {
  console.log('显示人员选择器')
}
</script>

<style scoped lang="scss">
.flow-design-container {
  display: flex;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.flow-canvas {
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
  overflow: auto;
  position: relative;
}

.flow-chart {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 50px;
}

/* 节点通用样式 */
.flow-node {
  width: 220px;
  /* 将宽度从260px调整为220px */
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  margin-bottom: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-left: auto;
  margin-right: auto;
  /* 居中显示 */
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
  border-radius: 4px 4px 0 0;

  .node-icon {
    margin-right: 5px;
    color: #606266;
  }

  .node-title {
    flex-grow: 1;
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }

  .node-arrow {
    color: #909399;
  }
}

.node-content {
  padding: 10px 12px;

  .node-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #606266;
    font-size: 14px;

    .chevron-icon {
      color: #c0c4cc;
    }
  }
}

/* 发起人节点样式调整 */
.initiator {
  border-left: 3px solid #409eff;

  .node-header {
    background-color: #ecf5ff;
    padding: 8px 12px;
    display: flex;
    align-items: center;

    .node-icon {
      margin-right: 5px;
      color: #409eff;
      display: flex;
      align-items: center;
    }

    .node-title {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }

  .node-content {
    padding: 0;

    .node-item {
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #606266;
      font-size: 14px;
      cursor: pointer;
      border-top: 1px solid #ebeef5;

      &:hover {
        background-color: #f5f7fa;
      }

      .chevron-icon {
        color: #c0c4cc;
        font-size: 12px;
      }
    }
  }
}

.approver {
  border-left: 3px solid #67c23a;

  .node-header {
    background-color: #f0f9eb;
  }
}

.condition {
  border-left: 3px solid #e6a23c;

  .node-header {
    background-color: #fdf6ec;
  }
}

/* 添加节点按钮 */
.node-add-btn {
  position: relative;
  margin: 15px 0;
  display: flex;
  justify-content: center;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -15px;
    left: 50%;
    height: 15px;
    border-left: 1px dashed #c0c4cc;
    z-index: -1;
  }

  .add-btn {
    background-color: #fff;
    border: 1px dashed #c0c4cc;
    color: #409eff;
    transition: all 0.3s;

    &:hover {
      color: #fff;
      background-color: #409eff;
      border-color: #409eff;
    }
  }
}

/* 添加条件菜单 */
.add-condition-menu {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 100;

  .menu-title {
    padding: 12px;
    font-size: 14px;
    font-weight: 500;
    border-bottom: 1px solid #e4e7ed;
  }

  .condition-options {
    padding: 12px;

    .option-btn {
      width: 100%;
      margin-bottom: 10px;
    }

    .option-tips {
      display: flex;
      align-items: center;
      color: #909399;
      font-size: 12px;
      margin-bottom: 10px;

      .el-icon {
        margin-right: 5px;
        color: #e6a23c;
      }
    }

    .condition-inputs {
      background-color: #f5f7fa;
      padding: 10px;
      border-radius: 4px;

      .input-row {
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .menu-action {
    padding: 12px;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #e4e7ed;

    .el-button {
      margin-left: 10px;
    }
  }
}

/* 分支样式 */
.flow-branch {
  width: 100%;
  display: flex;
  gap: 15px;
  position: relative;
  padding-top: 30px;
  margin-bottom: 15px;

  /* 分支上方连接线 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    height: 30px;
    border-left: 1px dashed #c0c4cc;
  }

  /* 分支顶部横线 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
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
      top: 0;
      left: 50%;
      height: 30px;
      border-left: 1px dashed #c0c4cc;
    }
  }

  .branch-header {
    background-color: #f5f7fa;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    color: #909399;
    margin-bottom: 15px;
    border: 1px solid #e4e7ed;
    z-index: 1;
  }
}

/* 流程结束点 */
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
    padding: 10px 20px;
    background-color: #f5f7fa;
    border-radius: 15px;
    font-size: 14px;
    color: #909399;
    border: 1px solid #e4e7ed;
    text-align: center;
  }
}

/* 右侧组件面板 */
.component-panel {
  width: 280px;
  background-color: #fff;
  border-left: 1px solid #e4e7ed;
  overflow-y: auto;

  .panel-header {
    padding: 15px;
    border-bottom: 1px solid #e4e7ed;

    h3 {
      font-size: 16px;
      color: #303133;
      margin: 0;
    }
  }

  .component-list {
    padding: 15px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .component-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 0;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }

    .component-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 8px;

      .el-icon {
        font-size: 20px;
        color: #fff;
      }
    }

    .component-name {
      font-size: 12px;
      color: #606266;
    }
  }

  /* 组件图标背景颜色 */
  .approver-icon {
    background-color: #67c23a;
  }

  .copyto-icon {
    background-color: #409eff;
  }

  .process-icon {
    background-color: #e6a23c;
  }

  .condition-icon {
    background-color: #f56c6c;
  }

  .automation-icon {
    background-color: #909399;
  }

  .connector-icon {
    background-color: #9254de;
  }

  .parallel-icon {
    background-color: #1890ff;
  }

  .payment-icon {
    background-color: #52c41a;
  }
}
</style>