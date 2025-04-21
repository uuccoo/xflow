<template>
  <div class="flow-design-container">
    <div class="flow-canvas">
      <!-- 流程图缩放控制 -->
      <div class="zoom-control">
        <!-- 新增：重置到 100% 的按钮，只在缩放不为100%时显示，且位于放大按钮左边 -->
        <el-button v-if="zoom !== 1" circle @click="resetZoom" class="reset-btn">
          <el-icon>
            <Refresh />
          </el-icon>
        </el-button>
        <el-button circle @click="zoomOut">
          <el-icon>
            <Minus />
          </el-icon>
        </el-button>
        <span class="zoom-text">{{ Math.round(zoom * 100) }}%</span>
        <el-button circle @click="zoomIn">
          <el-icon>
            <Plus />
          </el-icon>
        </el-button>
      </div>

      <!-- 流程图主体 -->
      <div class="flow-chart" :style="zoomStyle">
        <!-- 发起人节点 -->
        <flow-node-renderer :node="{ type: 'initiator' }" :index="-1" />

        <!-- 发起人节点后的添加按钮 - 始终显示 -->
        <node-add-button :position="0" />

        <!-- 动态渲染主流程中的节点 -->
        <template v-for="(node, index) in flowStore.flowData.nodes" :key="node.id">
          <!-- 使用通用节点组件渲染所有节点类型 -->
          <flow-node-renderer :node="node" :index="index" :parentNode="null" />

          <!-- 每个节点后面都有一个添加按钮 -->
          <node-add-button :position="index + 1" />
        </template>

        <!-- 结束节点 -->
        <flow-node-renderer :node="{ type: 'end' }" :index="-2" />
      </div>
    </div>

    <!-- 节点设置抽屉层 -->
    <el-drawer v-model="flowStore.drawerVisible" title="节点设置" size="30%" :destroy-on-close="false" :with-header="true"
      direction="rtl" :before-close="handleDrawerClose">
      <template #header>
        <div class="drawer-header">
          <span class="drawer-title">{{ drawerTitle }}</span>
          <el-button type="text" @click="handleDrawerClose" class="drawer-close">
            <el-icon>
              <Close />
            </el-icon>
          </el-button>
        </div>
      </template>

      <div class="drawer-content" v-if="flowStore.selectedNode">
        <!-- 根据节点类型显示不同的设置表单 -->
        <template v-if="flowStore.selectedNode.node.type === 'initiator'">
          <div class="node-setting-form">
            <h3 class="setting-section-title">发起人设置</h3>
            <el-form label-position="top">
              <el-form-item label="发起人范围">
                <el-select v-model="initiatorScope" placeholder="请选择发起人范围" style="width: 100%">
                  <el-option label="所有人" value="all"></el-option>
                  <el-option label="指定人员" value="specified"></el-option>
                  <el-option label="指定部门" value="department"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-if="initiatorScope !== 'all'" label="选择人员/部门">
                <el-button type="primary" @click="showPersonSelector('initiator')">选择</el-button>
                <div v-if="selectedInitiators.length" class="selected-users">
                  <el-tag v-for="(user, idx) in selectedInitiators" :key="idx" closable
                    @close="removeSelectedItem(idx, 'initiator')">
                    {{ user.name }}
                  </el-tag>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </template>

        <template v-else-if="flowStore.selectedNode.node.type === 'approver'">
          <div class="node-setting-form">
            <h3 class="setting-section-title">审批人设置</h3>
            <el-form label-position="top">
              <el-form-item label="审批人">
                <el-button type="primary" @click="showPersonSelector('approver')">选择审批人</el-button>
                <div v-if="flowStore.selectedNode.node.props.approvers?.length" class="selected-users">
                  <el-tag v-for="(user, idx) in flowStore.selectedNode.node.props.approvers" :key="idx" closable
                    @close="removeUser(idx, 'approvers')">
                    {{ user.name }}
                  </el-tag>
                </div>
              </el-form-item>
              <el-form-item label="审批方式">
                <el-radio-group v-model="approvalMode">
                  <el-radio label="anyone">任意一人通过即可</el-radio>
                  <el-radio label="all">所有人通过</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
        </template>

        <template v-else-if="flowStore.selectedNode.node.type === 'copyTo'">
          <div class="node-setting-form">
            <h3 class="setting-section-title">抄送人设置</h3>
            <el-form label-position="top">
              <el-form-item label="抄送人">
                <el-button type="primary" @click="showPersonSelector('copyTo')">选择抄送人</el-button>
                <div v-if="flowStore.selectedNode.node.props.users?.length" class="selected-users">
                  <el-tag v-for="(user, idx) in flowStore.selectedNode.node.props.users" :key="idx" closable
                    @close="removeUser(idx, 'users')">
                    {{ user.name }}
                  </el-tag>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </template>

        <template v-else-if="flowStore.selectedNode.node.type === 'process'">
          <div class="node-setting-form">
            <h3 class="setting-section-title">办理人设置</h3>
            <el-form label-position="top">
              <el-form-item label="办理人">
                <el-button type="primary" @click="showPersonSelector('process')">选择办理人</el-button>
                <div v-if="flowStore.selectedNode.node.props.processors?.length" class="selected-users">
                  <el-tag v-for="(user, idx) in flowStore.selectedNode.node.props.processors" :key="idx" closable
                    @close="removeUser(idx, 'processors')">
                    {{ user.name }}
                  </el-tag>
                </div>
              </el-form-item>
              <el-form-item label="处理方式">
                <el-radio-group v-model="processMode">
                  <el-radio label="sequential">串行处理</el-radio>
                  <el-radio label="parallel">并行处理</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
        </template>

        <template v-else-if="flowStore.selectedNode.node.type === 'condition'">
          <div class="node-setting-form">
            <h3 class="setting-section-title">条件设置</h3>
            <p class="setting-description">设置条件分支的判断条件</p>

            <div v-if="selectedBranchItem">
              <el-form label-position="top">
                <el-form-item label="条件名称">
                  <el-input v-model="selectedBranchItem.name" placeholder="请输入条件名称"></el-input>
                </el-form-item>
                <el-form-item label="条件表达式" v-if="selectedBranchItem.name !== '默认条件'">
                  <el-input type="textarea" v-model="selectedBranchItem.expression" placeholder="请输入条件表达式" :rows="3">
                  </el-input>
                </el-form-item>
              </el-form>
            </div>
            <div v-else class="branch-list">
              <h4>选择要编辑的条件分支：</h4>
              <el-menu :default-active="activeConditionIndex.toString()">
                <el-menu-item v-for="(condition, idx) in flowStore.selectedNode.node.props.conditions" :key="idx"
                  :index="idx.toString()" @click="selectBranch(condition)">
                  {{ condition.name || `条件${idx + 1}` }}
                </el-menu-item>
              </el-menu>
            </div>
          </div>
        </template>

        <template v-else-if="flowStore.selectedNode.node.type === 'automation'">
          <div class="node-setting-form">
            <h3 class="setting-section-title">自动化设置</h3>
            <p class="setting-description">设置自动执行的系统动作</p>
            <el-form label-position="top">
              <el-form-item label="选择动作类型">
                <el-select v-model="automationAction" placeholder="请选择动作类型" style="width: 100%">
                  <el-option label="系统通知" value="notification"></el-option>
                  <el-option label="自动更新数据" value="update"></el-option>
                  <el-option label="触发外部系统" value="external"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </template>

        <template v-else>
          <div class="node-setting-form">
            <h3 class="setting-section-title">{{ nodeTypeLabel }}设置</h3>
            <p class="setting-description">请配置节点参数</p>

            <!-- 通用设置选项 -->
            <el-form label-position="top">
              <el-form-item label="节点名称">
                <el-input v-model="nodeName" placeholder="请输入节点名称"></el-input>
              </el-form-item>
            </el-form>
          </div>
        </template>

        <!-- 高级设置部分 - 所有节点类型通用 -->
        <div class="node-advanced-settings">
          <el-divider>高级设置</el-divider>
          <el-collapse>
            <el-collapse-item title="超时设置" name="timeout">
              <el-form>
                <el-form-item label="启用超时提醒">
                  <el-switch v-model="enableTimeout"></el-switch>
                </el-form-item>
                <template v-if="enableTimeout">
                  <el-form-item label="超时时间">
                    <el-input-number v-model="timeoutHours" :min="0" :max="168"></el-input-number>
                    <span class="unit-label">小时</span>
                  </el-form-item>
                </template>
              </el-form>
            </el-collapse-item>

            <el-collapse-item title="事件回调" name="callback">
              <el-form>
                <el-form-item label="回调 URL">
                  <el-input v-model="callbackUrl" placeholder="请输入回调地址"></el-input>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 底部操作按钮 -->
        <div class="drawer-footer">
          <el-button @click="handleDrawerClose">取消</el-button>
          <el-button type="primary" @click="saveNodeSettings">确定</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 人员选择组件 -->
    <PersonSelector v-model="personSelectorVisible" :title="personSelectorTitle" :selected-ids="selectedPersonIds"
      @confirm="handlePersonConfirm" />
  </div>
</template>

<script setup>
import {
  Connection,
  Document,
  Edit,
  Money,
  Setting,
  Sort,
  TurnOff,
  User,
  Plus,
  Minus,
  Refresh,
  Close
} from '@element-plus/icons-vue'
import NodeAddButton from './NodeAddButton.vue'
import FlowNodeRenderer from './flow/FlowNodeRenderer.vue'
import PersonSelector from '../common/PersonSelector.vue'
import { useFlowDesignStore } from '../../stores/flowDesignStore'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 使用 Pinia store
const flowStore = useFlowDesignStore()

// 将图标对象注入到 nodeOptions 中
// 注意：Pinia store 中我们保存的是图标名称字符串
// 这里进行转换，将图标组件对象赋值给 nodeOptions
flowStore.nodeOptions.forEach(option => {
  const iconMap = {
    'User': User,
    'Document': Document,
    'Edit': Edit,
    'TurnOff': TurnOff,
    'Setting': Setting,
    'Connection': Connection,
    'Sort': Sort,
    'Money': Money
  }
  option.icon = iconMap[option.icon] || null
})

// 缩放相关逻辑
const zoom = ref(1)
const zoomStyle = computed(() => ({
  transform: `scale(${zoom.value})`,
  transformOrigin: 'center top',
  margin: '0 auto'  // 保证水平居中
}))

const zoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.1, 2)
}

const zoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.1, 0.5)
}

const resetZoom = () => {
  zoom.value = 1
}

// 抽屉层相关
// 获取抽屉标题
const drawerTitle = computed(() => {
  if (!flowStore.selectedNode) return '节点设置';

  const node = flowStore.selectedNode.node;

  // 根据节点类型返回对应的标题
  if (node.type === 'initiator') return '发起人设置';
  if (node.type === 'approver') return '审批人设置';
  if (node.type === 'copyTo') return '抄送人设置';
  if (node.type === 'process') return '办理人设置';
  if (node.type === 'condition') return '条件分支设置';
  if (node.type === 'automation') return '自动化设置';
  if (node.type === 'connector') return '连接器设置';
  if (node.type === 'payment') return '付款人设置';

  return '节点设置';
});

// 获取节点类型标签
const nodeTypeLabel = computed(() => {
  if (!flowStore.selectedNode) return '';

  const option = flowStore.nodeOptions.find(opt => opt.type === flowStore.selectedNode.node.type);
  return option ? option.label : '节点';
});

// 表单数据
const initiatorScope = ref('all');
const approvalMode = ref('anyone');
const processMode = ref('sequential');
const automationAction = ref('notification');
const nodeName = ref('');
const enableTimeout = ref(false);
const timeoutHours = ref(24);
const callbackUrl = ref('');
const selectedBranchItem = ref(null);
const activeConditionIndex = ref(0);

// 发起人数据
const selectedInitiators = ref([]);

// 抽屉关闭处理
const handleDrawerClose = () => {
  flowStore.closeDrawer();
  // 重置表单状态
  selectedBranchItem.value = null;
  activeConditionIndex.value = 0;
}

// 选择分支条件
const selectBranch = (branch) => {
  selectedBranchItem.value = branch;
}

// 人员选择器相关状态
const personSelectorVisible = ref(false);
const personSelectorTitle = ref('选择人员');
const personSelectorType = ref(''); // 当前选择的类型：审批人、抄送人等
const selectedPersonIds = ref([]);

// 打开人员选择器
const showPersonSelector = (type) => {
  personSelectorType.value = type;

  let title = '选择人员';
  let currentIds = [];

  // 根据不同类型，设置标题和当前已选ID
  switch (type) {
    case 'approver':
      title = '选择审批人';
      if (flowStore.selectedNode.node.props.approvers) {
        currentIds = flowStore.selectedNode.node.props.approvers.map(user => user.id);
      }
      break;
    case 'copyTo':
      title = '选择抄送人';
      if (flowStore.selectedNode.node.props.users) {
        currentIds = flowStore.selectedNode.node.props.users.map(user => user.id);
      }
      break;
    case 'process':
      title = '选择办理人';
      if (flowStore.selectedNode.node.props.processors) {
        currentIds = flowStore.selectedNode.node.props.processors.map(user => user.id);
      }
      break;
    case 'initiator':
      title = '选择发起人范围';
      currentIds = selectedInitiators.value.map(user => user.id);
      break;
  }

  personSelectorTitle.value = title;
  selectedPersonIds.value = currentIds;
  personSelectorVisible.value = true;
}

// 处理人员选择确认
const handlePersonConfirm = (result) => {
  if (!flowStore.selectedNode || !flowStore.selectedNode.node) return;

  const { node } = flowStore.selectedNode;

  // 根据不同类型处理选择结果
  switch (personSelectorType.value) {
    case 'approver':
      node.props.approvers = result.selectedUsers;
      ElMessage.success('审批人设置成功');
      break;
    case 'copyTo':
      node.props.users = result.selectedUsers;
      ElMessage.success('抄送人设置成功');
      break;
    case 'process':
      node.props.processors = result.selectedUsers;
      ElMessage.success('办理人设置成功');
      break;
    case 'initiator':
      // 处理发起人范围设置
      selectedInitiators.value = result.selectedUsers;
      ElMessage.success('发起人范围设置成功');
      break;
  }
}

// 删除用户
const removeUser = (index, propName) => {
  if (!flowStore.selectedNode || !flowStore.selectedNode.node) return;
  if (!flowStore.selectedNode.node.props[propName]) return;

  flowStore.selectedNode.node.props[propName].splice(index, 1);
}

// 删除已选择的项目（发起人等）
const removeSelectedItem = (index, type) => {
  if (type === 'initiator') {
    selectedInitiators.value.splice(index, 1);
  }
}

// 保存节点设置
const saveNodeSettings = () => {
  if (!flowStore.selectedNode) return;
  
  const { node } = flowStore.selectedNode;
  
  // 根据不同节点类型保存不同设置
  if (node.type === 'approver') {
    node.props.mode = approvalMode.value;
  } else if (node.type === 'process') {
    node.props.mode = processMode.value;
  } else if (node.type === 'initiator') {
    // 更新发起人范围设置
    node.props.initiatorScope = initiatorScope.value;
    if (initiatorScope.value !== 'all') {
      node.props.initiators = selectedInitiators.value;
    }
  }
  
  // 更新节点名称
  if (nodeName.value) {
    node.name = nodeName.value;
  }
  
  // 关闭抽屉
  ElMessage.success('节点设置已保存');
  handleDrawerClose();
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
  padding-top: 60px;
  padding-bottom: 50px;
}

/* 流程图缩放控制样式 */
.zoom-control {
  position: fixed;
  top: 80px;
  right: 40px;
  /* 增加与页面右侧的距离 */
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 100;
  /* 移除了背景色和阴影 */

  .zoom-text {
    font-size: 14px;
    color: #606266;
    min-width: 40px;
    text-align: center;
  }
}

/* 抽屉层样式 */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  border-bottom: 1px solid #e4e7ed;

  .drawer-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }

  .drawer-close {
    font-size: 20px;
    color: #909399;
  }
}

.drawer-content {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.node-setting-form {
  margin-bottom: 20px;

  .setting-section-title {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }

  .setting-description {
    color: #909399;
    font-size: 14px;
    margin-bottom: 20px;
  }
}

.selected-users {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.node-advanced-settings {
  margin-top: 30px;

  .unit-label {
    margin-left: 8px;
    color: #606266;
  }
}

.drawer-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 10px 20px;
  text-align: right;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  border-top: 1px solid #e4e7ed;
  margin: 0 -20px;
}

.branch-list {
  margin: 15px 0;

  h4 {
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: normal;
    color: #606266;}
}
</style>