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
    <el-drawer v-model="flowStore.drawerVisible" :show-close="false" title="节点设置" size="550" :destroy-on-close="false"
      :with-header="true" direction="rtl" :before-close="saveNodeSettings">
      <template #header>
        <div class="drawer-header">
          <div class="drawer-title-container">
            <!-- 只保留节点名称编辑部分，移除节点类型标题 -->
            <div class="node-name-edit">
              <el-input v-if="isEditingName" v-model="tempNodeName" size="medium" placeholder="请输入节点名称"
                ref="nodeNameInput" @blur="finishEditName">
              </el-input>
              <div v-else class="current-node-name" @click="startEditName">
                {{ tempNodeName || '' }}
                <el-icon>
                  <Edit />
                </el-icon>
              </div>
            </div>
          </div>
          <el-icon class="drawer-close" @click="handleDrawerClose">
            <Close />
          </el-icon>
        </div>
      </template>

      <div class="drawer-content" v-if="flowStore.selectedNode">
        <!-- 根据节点类型显示不同的设置表单 -->
        <template v-if="flowStore.selectedNode.node.type === 'initiator'">
          <div class="node-setting-form">
            <!-- <h3 class="setting-section-title">发起人设置</h3> -->
            <el-form label-position="top">
              <el-form-item label="谁可以提交该审批">
                <el-select v-model="initiatorScope" placeholder="请选择发起人范围" style="width: 100%">
                  <el-option label="所有人" value="all"></el-option>
                  <el-option label="指定人员" value="specified"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-if="initiatorScope !== 'all'" label="指定人员" label-position="left" required>
                <el-button class="select-personnel" type="primary" @click="showPersonSelector('initiator')">
                  <el-icon>
                    <Plus />
                  </el-icon>
                  添加</el-button>
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
            <!-- <h3 class="setting-section-title">审批人设置</h3> -->
            <el-form label-position="top">
              <el-form-item label="请选择审批人">
                <el-radio-group v-model="approverType" class="approver-type-selector">
                  <el-radio label="designated">
                    <div class="option-content">指定人员</div>
                  </el-radio>
                  <el-radio label="initiator_select">
                    <div class="option-content">发起人自选</div>
                  </el-radio>
                  <el-radio label="multi_level_manager">
                    <div class="option-content">连续多级主管</div>
                  </el-radio>
                  <el-radio label="department_manager">
                    <div class="option-content">部门主管</div>
                  </el-radio>
                  <el-radio label="role">
                    <div class="option-content">角色</div>
                  </el-radio>
                  <el-radio label="initiator_self">
                    <div class="option-content">发起人自己</div>
                  </el-radio>
                </el-radio-group>
              </el-form-item>

              <!-- 根据选择的审批人类型显示不同的设置 -->
              <el-form-item v-if="approverType === 'designated'" label="指定人员" label-position="left" required>
                <el-button class="select-personnel" type="primary" @click="showPersonSelector('approver')">
                  <el-icon>
                    <Plus />
                  </el-icon>
                  添加</el-button>
                <div v-if="flowStore.selectedNode.node.props.approvers?.length" class="selected-users">
                  <el-tag v-for="(user, idx) in flowStore.selectedNode.node.props.approvers" :key="idx" closable
                    @close="removeUser(idx, 'approvers')">
                    {{ user.name }}
                  </el-tag>
                </div>
              </el-form-item>

              <!-- 新增：发起人自选的子选项 -->
              <el-form-item v-if="approverType === 'initiator_select'" label="选择方式">
                <div class="initiator-select-options">
                  <el-button :class="{ 'active': initiatorSelectMode === 'single' }"
                    @click="initiatorSelectMode = 'single'">
                    自选一个人
                  </el-button>
                  <el-button :class="{ 'active': initiatorSelectMode === 'multiple' }"
                    @click="initiatorSelectMode = 'multiple'">
                    自选多个人
                  </el-button>
                </div>
              </el-form-item>

              <!-- 新增：发起人自选范围类型选择 -->
              <el-form-item v-if="approverType === 'initiator_select'" label="用户可选范围">
                <el-select v-model="rangeType" placeholder="请选择范围" style="width: 100%">
                  <el-option label="所有人" value="all"></el-option>
                  <el-option label="指定人员" value="specified"></el-option>
                </el-select>
              </el-form-item>

              <!-- 新增：发起人自选需要从哪些人中选择 -->
              <el-form-item v-if="approverType === 'initiator_select' && rangeType === 'specified'" label="指定人员"
                label-position="left" required>
                <el-button class="select-personnel" type="primary" @click="showPersonSelector('initiatorSelectRange')">
                  <el-icon>
                    <Plus />
                  </el-icon>
                  添加</el-button>
                <div v-if="flowStore.selectedNode.node.props.selectRange?.length" class="selected-users">
                  <el-tag v-for="(user, idx) in flowStore.selectedNode.node.props.selectRange" :key="idx" closable
                    @close="removeUser(idx, 'selectRange')">
                    {{ user.name }}
                  </el-tag>
                </div>
              </el-form-item>

              <!-- 新增：主管类型选择 -->
              <el-form-item v-if="approverType === 'department_manager'" label="部门主管">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span>发起人的</span>
                  <el-select v-model="managerType" placeholder="请选择主管类型" style="width: 200px;">
                    <el-option v-for="i in 20" :key="i" :label="i === 1 ? '直接主管' : `第${i}级主管`" :value="i"></el-option>
                  </el-select>
                </div>
                <el-checkbox v-model="fallbackToHigherManager">
                  找不到主管时，由上级主管代审批
                  <el-tooltip content="当无法找到指定主管时，自动转交给上级主管处理" placement="top">
                    <el-icon>
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </el-checkbox>
              </el-form-item>

              <el-form-item v-if="approverType === 'initiator_self'" label="发起人自己">
                <span style="color: #909399;">发起人自己作为审批人进行审批</span>
              </el-form-item>
              <el-divider></el-divider>
              <el-form-item label="多人审批时的审批方式">
                <el-radio-group v-model="approvalMode" class="approval-mode-radio-group">
                  <div class="radio-item">
                    <el-radio label="顺序会签 (按选择顺序审批，每个人必须同意)" value="sequential"></el-radio>
                  </div>
                  <div class="radio-item">
                    <el-radio label="会签 (可同时审批，每个人必须同意)" value="parallel"></el-radio>
                  </div>
                  <div class="radio-item">
                    <el-radio label="或签 (有一人同意即可)" value="anyone"></el-radio>
                  </div>
                </el-radio-group>
              </el-form-item>
              <el-divider></el-divider>

              <!-- 高级设置部分 -->
              <div class="advanced-settings-section">
                <div class="section-title">高级设置</div>

                <!-- 审批人为空时 -->
                <div class="setting-item">
                  <div class="setting-label">
                    <span class="icon-user">👤</span> 审批人为空时
                  </div>
                  <div class="setting-options">
                    <el-radio-group v-model="emptyApproverAction">
                      <el-radio label="auto_pass">自动通过</el-radio>
                      <el-radio label="auto_reject">自动驳回</el-radio>
                      <el-radio label="transfer_manager">转交审批管理员</el-radio>
                      <el-radio label="transfer_specific">转交到指定人员</el-radio>
                    </el-radio-group>
                  </div>
                </div>

                <!-- 审批同意时是否需要签字 -->
                <div class="setting-item">
                  <div class="setting-label">
                    <span class="icon-signature">✍️</span> 审批同意时是否需要签字
                  </div>
                  <div class="setting-options">
                    <el-switch v-model="requireSignature" active-text="需要" inactive-text="不用" :active-value="true"
                      :inactive-value="false">
                    </el-switch>
                  </div>
                </div>

                <!-- 审批期限 -->
                <div class="setting-item">
                  <div class="setting-label">
                    <span class="icon-clock">⏱️</span> 审批期限（为 0 则不生效）
                  </div>
                  <div class="setting-options time-limit-input">
                    <el-input-number v-model="approvalTimeLimit" :min="0" controls-position="right"></el-input-number>
                    <el-select v-model="approvalTimeUnit" style="width: 80px;">
                      <el-option label="小时" value="hour"></el-option>
                      <el-option label="天" value="day"></el-option>
                    </el-select>
                  </div>
                </div>

                <!-- 如果审批被驳回 -->
                <div class="setting-item">
                  <div class="setting-label">
                    <span class="icon-reject">👎</span> 如果审批被驳回
                  </div>
                  <div class="setting-options">
                    <el-radio-group v-model="rejectAction">
                      <el-radio label="end_flow">直接结束流程</el-radio>
                      <el-radio label="back_previous">驳回到上一级审批节点</el-radio>
                      <el-radio label="back_specific">驳回到指定节点</el-radio>
                    </el-radio-group>
                  </div>
                </div>
              </div>
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

        <!-- 底部操作按钮 -->
        <div class="drawer-footer">
          <el-button @click="handleDrawerClose">取消</el-button>
          <el-button type="primary" @click="saveNodeSettings">保存</el-button>
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
import { ref, computed, nextTick, watch } from 'vue'
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
const selectedBranchItem = ref(null);
const activeConditionIndex = ref(0);
const isEditingName = ref(false); // 是否正在编辑节点名称
const tempNodeName = ref(''); // 临时存储节点名称
const approverType = ref('designated'); // 审批人类型
const initiatorSelectMode = ref('single'); // 发起人自选模式
const emptyApproverAction = ref('auto_pass'); // 审批人为空时的处理方式
const requireSignature = ref(false); // 审批同意时是否需要签字
const approvalTimeLimit = ref(0); // 审批期限
const approvalTimeUnit = ref('hour'); // 审批时间单位
const rejectAction = ref('end_flow'); // 审批被驳回时的处理方式
const rangeType = ref('all'); // 发起人自选范围类型
const managerType = ref(1); // 主管类型
const fallbackToHigherManager = ref(false); // 是否由上级主管代审批

// 当selectedNode变化时初始化表单数据
const initFormData = () => {
  if (!flowStore.selectedNode) return;

  const { node } = flowStore.selectedNode;

  // 初始化节点名称
  nodeName.value = node.name || '';
  tempNodeName.value = node.name || '';

  // 根据节点类型初始化其他表单数据
  if (node.type === 'approver' && node.props) {
    approvalMode.value = node.props.mode || 'anyone';
    approverType.value = node.props.approverType || 'designated';
    initiatorSelectMode.value = node.props.initiatorSelectMode || 'single';
    emptyApproverAction.value = node.props.emptyApproverAction || 'auto_pass';
    requireSignature.value = node.props.requireSignature || false;
    approvalTimeLimit.value = node.props.approvalTimeLimit || 0;
    approvalTimeUnit.value = node.props.approvalTimeUnit || 'hour';
    rejectAction.value = node.props.rejectAction || 'end_flow';
    rangeType.value = node.props.rangeType || 'all';
    managerType.value = node.props.managerType || 1;
    fallbackToHigherManager.value = node.props.fallbackToHigherManager || false;
  } else if (node.type === 'process' && node.props) {
    processMode.value = node.props.mode || 'sequential';
  } else if (node.type === 'initiator' && node.props) {
    initiatorScope.value = node.props.initiatorScope || 'all';
    selectedInitiators.value = node.props.initiators || [];
  } else if (node.type === 'automation' && node.props) {
    automationAction.value = node.props.actionType || 'notification';
  }
}

// 监听抽屉显示状态，初始化表单数据
watch(() => flowStore.drawerVisible, (visible) => {
  if (visible) {
    initFormData();
    isEditingName.value = false; // 重置编辑状态
  }
}, { immediate: true });

// 监听selectedNode变化，初始化表单数据
watch(() => flowStore.selectedNode, (node) => {
  if (node) {
    initFormData();
  }
});

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
    case 'initiatorSelectRange':
      title = '选择发起人自选范围';
      if (flowStore.selectedNode.node.props.selectRange) {
        currentIds = flowStore.selectedNode.node.props.selectRange.map(user => user.id);
      }
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
    case 'initiatorSelectRange':
      node.props.selectRange = result.selectedUsers;
      ElMessage.success('发起人自选范围设置成功');
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
    node.props.approverType = approverType.value;

    // 确保节点props中有approverType字段
    if (!node.props) {
      node.props = {};
    }
    node.props.approverType = approverType.value;

    // 如果选择了"指定人员"但没有选择人员，提醒用户
    if (approverType.value === 'designated' && (!node.props.approvers || node.props.approvers.length === 0)) {
      ElMessage.warning('请选择至少一名审批人');
      return;
    }

    // 保存发起人自选模式
    if (approverType.value === 'initiator_select') {
      node.props.initiatorSelectMode = initiatorSelectMode.value;
      node.props.rangeType = rangeType.value;
    }

    // 保存主管类型和上级主管代审批设置
    if (approverType.value === 'department_manager') {
      node.props.managerType = managerType.value;
      node.props.fallbackToHigherManager = fallbackToHigherManager.value;
    }

    // 保存高级设置
    node.props.emptyApproverAction = emptyApproverAction.value;
    node.props.requireSignature = requireSignature.value;
    node.props.approvalTimeLimit = approvalTimeLimit.value;
    node.props.approvalTimeUnit = approvalTimeUnit.value;
    node.props.rejectAction = rejectAction.value;
  } else if (node.type === 'process') {
    node.props.mode = processMode.value;
  } else if (node.type === 'initiator') {
    // 更新发起人范围设置
    node.props.initiatorScope = initiatorScope.value;
    if (initiatorScope.value !== 'all') {
      node.props.initiators = selectedInitiators.value;
    }
  }

  // 更新节点名称 - 使用临时保存的名称
  if (tempNodeName.value) {
    node.name = tempNodeName.value;
  }

  // 关闭抽屉
  ElMessage.success('节点设置已保存');
  handleDrawerClose();
}

// 开始编辑节点名称
const startEditName = () => {
  isEditingName.value = true;
  nextTick(() => {
    if (nodeNameInput.value) {
      nodeNameInput.value.focus();
    }
  });
}

// 完成编辑节点名称
const finishEditName = () => {
  isEditingName.value = false;
  // 仅修改临时存储的名称，不立即同步到节点
  // 点击抽屉底部的确定按钮时才会保存
}

// 节点名称输入框引用
const nodeNameInput = ref(null);
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

.select-personnel.el-button .el-icon {
  margin-right: 4px;
  vertical-align: middle;
}

/* 抽屉层样式 */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  border-bottom: 1px solid #e4e7ed;

  .drawer-title-container {
    display: flex;
    align-items: center;
    gap: 10px;

    .drawer-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .node-name-edit {
      display: flex;
      align-items: center;
      gap: 5px;

      .current-node-name {
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        color: #303133;
        /* 修改为正常文本颜色，不再使用蓝色 */
        padding: 4px 8px;
        border-radius: 4px;
        transition: color 0.3s;

        &:hover {
          color: #409EFF;

          .el-icon {
            color: #409EFF;
          }
        }

        .el-icon {
          font-size: 14px;
          color: #909399;
          /* 图标使用灰色 */
          transition: color 0.3s;
        }
      }
    }
  }

  .drawer-close {
    font-size: 20px;
    color: #909399;
  }
}

.drawer-content {
  padding: 20px;
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
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 10px 20px;
  text-align: right;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  border-top: 1px solid #e4e7ed;
  z-index: 10;
}

.branch-list {
  margin: 15px 0;

  h4 {
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: normal;
    color: #606266;
  }
}

.approver-type-selector {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 0px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  .el-radio {
    margin-right: 0;
    padding: 10px;
    width: 33.33%;
    height: 40px;
    display: flex;
    align-items: center;

    .option-content {
      margin-left: 5px;
    }
  }
}

.initiator-select-options {
  display: flex;
  gap: 10px;

  .el-button {
    padding: 8px 16px;
    border-radius: 4px;
    transition: background-color 0.3s, color 0.3s;

    &.active {
      background-color: #409EFF;
      color: #fff;
    }
  }
}

.approval-mode-radio-group {
  display: block;
  /* 确保整个组是块级元素 */
}

.advanced-settings-section {
  padding-top: 20px;

  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 15px;
  }

  .setting-item {
    margin-bottom: 20px;

    .setting-label {
      font-size: 14px;
      color: #606266;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 5px;

      .icon-user,
      .icon-signature,
      .icon-clock,
      .icon-reject {
        font-size: 16px;
      }
    }

    .setting-options {
      display: flex;
      align-items: center;
      gap: 10px;

      .time-limit-input {
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }
  }
}
</style>