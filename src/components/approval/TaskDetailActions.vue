<template>
  <div>
    <!-- 固定在底部的操作按钮 -->
    <div class="detail-actions-fixed" v-if="taskDetail">
      <!-- 情况1：待我审批页面，展示完整操作（独立模板） -->
      <template v-if="isPendingApproval">
        <button
          class="action-button"
          :class="{'disabled': !taskDetail?.permissions?.canTransfer}"
          @click="taskDetail?.permissions?.canTransfer && handleTransfer()"
          title="转交审批"
        >
          <span class="action-icon">
            <el-icon><Position /></el-icon>
          </span>
          <span class="action-text">转交</span>
        </button>

        <button
          class="action-button"
          :class="{'disabled': !taskDetail?.permissions?.canAddApprover}"
          @click="taskDetail?.permissions?.canAddApprover && handleAddApprover()"
          title="加签"
        >
          <span class="action-icon">
            <el-icon><UserFilled /></el-icon>
          </span>
          <span class="action-text">加签</span>
        </button>

        <button
          class="action-button"
          :class="{'disabled': !taskDetail?.permissions?.canReturn}"
          @click="taskDetail?.permissions?.canReturn && handleReturn()"
          title="退回流程"
        >
          <span class="action-icon">
            <el-icon><ArrowLeft /></el-icon>
          </span>
          <span class="action-text">退回</span>
        </button>

        <el-dropdown>
          <button class="action-button">
            <span class="action-icon">
              <el-icon><MoreFilled /></el-icon>
            </span>
            <span class="action-text">更多</span>
          </button>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                @click="taskDetail?.permissions?.canWithdraw && handleWithdraw()"
                :disabled="!taskDetail?.permissions?.canWithdraw"
              >
                <el-icon><Back /></el-icon>
                <span>撤销</span>
              </el-dropdown-item>
              <el-dropdown-item
                @click="taskDetail?.permissions?.canComment && handleComment()"
                :disabled="!taskDetail?.permissions?.canComment"
              >
                <el-icon><ChatDotRound /></el-icon>
                <span>评论</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 右侧的拒绝和同意按钮 -->
        <div class="approval-actions">
          <!-- 需要填写表单时,只显示提交按钮 -->
          <template v-if="taskDetail?.fillForm">
            <el-button
              size="medium"
              type="primary"
              @click="handleSubmitForm"
            >
              提交
            </el-button>
          </template>
          
          <!-- 审批操作按钮 -->
          <template v-else>
            <el-button
              size="medium"
              @click="taskDetail?.permissions?.canApprove && showApprovalDialog(taskDetail, 'reject')"
              plain
              :disabled="!taskDetail?.permissions?.canApprove"
            >
              拒绝
            </el-button>
            <el-button
              size="medium"
              type="primary"
              @click="taskDetail?.permissions?.canApprove && showApprovalDialog(taskDetail, 'approve')"
              :disabled="!taskDetail?.permissions?.canApprove"
            >
              同意
            </el-button>
          </template>
        </div>
      </template>

      <!-- 情况2：其它3个Tab，仅展示撤销和评论（独立模板） -->
      <template v-else>
        <button
          class="action-button"
          :class="{'disabled': !taskDetail?.permissions?.canWithdraw}"
          @click="taskDetail?.permissions?.canWithdraw && handleWithdraw()"
          title="撤销流程"
        >
          <span class="action-icon">
            <el-icon><Back /></el-icon>
          </span>
          <span class="action-text">撤销</span>
        </button>

        <button
          class="action-button"
          :class="{'disabled': !taskDetail?.permissions?.canComment}"
          @click="taskDetail?.permissions?.canComment && handleComment()"
          title="评论"
        >
          <span class="action-icon">
            <el-icon><ChatDotRound /></el-icon>
          </span>
          <span class="action-text">评论</span>
        </button>
      </template>
    </div>

    <!-- 审批对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="currentAction === 'approve' ? '同意审批' : '拒绝审批'"
      width="500px"
      @close="closeDialog"
    >
      <div class="form-item" style="display: flex; flex-direction: column;">
        <label style="margin-bottom: 10px;">审批意见：</label>
        <el-input
          v-model="approvalComment"
          type="textarea"
          :rows="4"
          placeholder="请输入审批意见"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button
            :type="currentAction === 'approve' ? 'primary' : 'danger'"
            @click="confirmApproval"
          >
            {{ currentAction === 'approve' ? '同意' : '拒绝' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 退回对话框 -->
    <el-dialog
      v-model="showReturnDialog"
      title="退回"
      width="500px"
      @close="closeReturnDialog"
    >
      <div class="form-item" style="display: flex; align-items: center;">
        <label>退回到：</label>
        <div v-if="returnNodeError" class="error-message">
          {{ returnNodeError }}
        </div>
        <div v-else style="flex: 1;">
          <el-select
            v-model="returnTargetNode"
            :disabled="returnNodeOptions.length === 0"
            placeholder="请选择退回节点"
            style="width: 100%;"
          >
            <el-option v-if="returnNodeOptions.length === 0" label="暂无可回退节点" value="" />
            <el-option
              v-for="option in returnNodeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
      </div>
      <div class="form-item" style="display: flex; flex-direction: column;">
        <label style="margin-bottom: 10px;">退回原因：</label>
        <el-input
          v-model="approvalComment"
          type="textarea"
          :rows="5"
          placeholder="请输入退回原因"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeReturnDialog">取消</el-button>
          <el-button
            type="primary"
            @click="confirmReturn"
            :disabled="returnNodeOptions.length === 0 || !returnTargetNode"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 转交对话框 -->
    <el-dialog
      v-model="showTransferDialog"
      title="转交"
      width="500px"
      @close="closeTransferDialog"
    >
      <div class="form-item">
        <label style="margin-bottom: 10px; display: block;">转交给：</label>
        <div class="transfer-tip">
          <span>选择要转交的人员，任务将转交给该人员处理</span>
        </div>
        <DesignatedPersonSelector
          v-model="transferSelectedUsers"
          title="选择转交人员"
          button-text="选择人员"
          :single-mode="true"
          :only-select-users="true"
        />
      </div>
      <div class="form-item">
        <label style="margin-bottom: 10px; display: block;">转交原因：</label>
        <el-input
          v-model="transferReason"
          type="textarea"
          :rows="4"
          placeholder="请输入转交原因"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeTransferDialog">取消</el-button>
          <el-button
            type="primary"
            @click="confirmTransfer"
            :disabled="transferSelectedUsers.length === 0 || transferLoading"
          >
            {{ transferLoading ? '转交中...' : '确定' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 加签对话框 -->
    <el-dialog
      v-model="showAddApproverDialog"
      title="加签"
      width="500px"
      @close="closeAddApproverDialog"
    >
      <div class="form-item">
        <label style="margin-bottom: 10px; display: block;">加签人员：</label>
        <div class="transfer-tip">
          <span>选择需要加入当前审批节点的人员</span>
        </div>
        <DesignatedPersonSelector
          v-model="addApproverSelectedUsers"
          title="选择加签人员"
          button-text="选择人员"
          :single-mode="false"
          :only-select-users="true"
        />
      </div>
      <div class="form-item">
        <label style="margin-bottom: 10px; display: block;">加签原因：</label>
        <el-input
          v-model="addApproverReason"
          type="textarea"
          :rows="4"
          placeholder="请输入加签原因"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAddApproverDialog">取消</el-button>
          <el-button
            type="primary"
            @click="confirmAddApprover"
            :disabled="addApproverSelectedUsers.length === 0 || addApproverLoading"
          >
            {{ addApproverLoading ? '提交中...' : '确定' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 评论对话框 -->
    <el-dialog
      v-model="showCommentDialog"
      title="评论"
      width="500px"
      @close="closeCommentDialog"
    >
      <div class="form-item">
        <label style="margin-bottom: 10px; display: block;">评论内容：</label>
        <el-input
          v-model="commentContent"
          type="textarea"
          :rows="5"
          placeholder="请输入评论内容"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeCommentDialog">取消</el-button>
          <el-button type="primary" @click="confirmComment">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { flowProcessApi } from '@/api';
import { ElMessage, ElLoading } from 'element-plus';
import DesignatedPersonSelector from '@/components/common/DesignatedPersonSelector.vue';
import { ApprovalCenterTab } from '@/enums';

// Props
const props = defineProps({
  taskDetail: {
    type: Object,
    required: true
  },
  // 审批中心Tab类型，用于区分操作面板展示逻辑
  tabType: {
    type: String,
    default: ''
  }
});

// Emits
const emit = defineEmits(['approve', 'reject', 'revoke', 'submit-form', 'refresh', 'refresh-detail', 'close'])

// 是否为“待我审批”Tab（情况1）
const isPendingApproval = computed(() => props.tabType === ApprovalCenterTab.PENDING_APPROVAL);

// 审批对话框相关数据
const showDialog = ref(false);
const currentAction = ref('');
const approvalComment = ref('');

// 退回对话框相关数据
const showReturnDialog = ref(false);
const returnTargetNode = ref('');
const returnNodeOptions = ref([]);
const returnNodeError = ref('');

// 转交对话框相关数据
const showTransferDialog = ref(false);
const transferSelectedUsers = ref([]);
const transferReason = ref('');
const transferLoading = ref(false);

// 加签对话框相关数据
const showAddApproverDialog = ref(false);
const addApproverSelectedUsers = ref([]);
const addApproverReason = ref('');
const addApproverLoading = ref(false);

// 评论对话框相关数据
const showCommentDialog = ref(false);
const commentContent = ref('');

// 显示审批对话框
const showApprovalDialog = (item, action) => {
  currentAction.value = action;
  approvalComment.value = ''; // 不自动赋值，让用户自己输入
  showDialog.value = true;
};

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false;
  currentAction.value = '';
  approvalComment.value = '';
};

// 确认审批
const confirmApproval = () => {
  handleApproval(props.taskDetail, currentAction.value);
  closeDialog();
};

// 审批处理
const handleApproval = async (item, action) => {
  try {
    const approvalData = {
      taskId: item.taskId,
      approved: action === 'approve',
      comment: approvalComment.value.trim() || ''
    };

    await flowProcessApi.approveTask(approvalData);
    ElMessage.success(`${action === 'approve' ? '同意' : '拒绝'}成功`);
    emit('refresh');
    emit('close');
  } catch (error) {
    // 拦截器已处理错误提示，这里只需执行清理逻辑
    console.error('审批处理失败', error);
  }
};

// 处理撤销操作
const handleWithdraw = () => {
  if (!props.taskDetail) {
    ElMessage.warning('无法获取流程信息');
    return;
  }

  ElMessageBox.confirm(
    '确定要撤销该审批吗？撤销后流程将被终止。',
    '撤销',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(async () => {
      try {
        await flowProcessApi.cancelFlow(props.taskDetail.formInstanceId);
        ElMessage.success('流程撤销成功');
        emit('refresh');
        emit('close');
      } catch (error) {
        console.error('撤销流程失败', error);
      }
    });
};

// 处理转交操作
const handleTransfer = async () => {
  if (!props.taskDetail || !props.taskDetail.taskId) {
    ElMessage.warning('无法获取任务信息');
    return;
  }

  transferSelectedUsers.value = [];
  transferReason.value = '';
  transferLoading.value = false;
  showTransferDialog.value = true;
};

// 确认转交
const confirmTransfer = async () => {
  if (!transferSelectedUsers.value || transferSelectedUsers.value.length === 0) {
    ElMessage.warning('请选择转交人员');
    return;
  }

  const targetUser = transferSelectedUsers.value[0];

  transferLoading.value = true;

  try {
    const transferData = {
      taskId: props.taskDetail.taskId,
      targetUserId: targetUser.id,
      reason: transferReason.value || ''
    };

    await flowProcessApi.transferTask(transferData);
    ElMessage.success(`任务已成功转交给 ${targetUser.name}`);
    emit('refresh');
    closeTransferDialog();
    emit('close');
  } catch (error) {
    console.error('转交任务失败', error);
  } finally {
    transferLoading.value = false;
  }
};

// 关闭转交对话框
const closeTransferDialog = () => {
  showTransferDialog.value = false;
  transferSelectedUsers.value = [];
  transferReason.value = '';
  transferLoading.value = false;
};

// 处理退回操作
const handleReturn = async () => {
  if (!props.taskDetail) {
    ElMessage.warning('无法获取流程信息');
    return;
  }

  currentAction.value = 'return';
  returnTargetNode.value = '';
  returnNodeOptions.value = [];
  returnNodeError.value = '';
  approvalComment.value = '';
  showReturnDialog.value = true;

  await fetchReturnableNodes();
};

// 获取可回退节点列表
const fetchReturnableNodes = async () => {
  returnNodeError.value = '';

  try {
    const returnableNodeList = await flowProcessApi.getReturnableTasks(props.taskDetail.taskId);

    if (!returnableNodeList || returnableNodeList.length === 0) {
      returnNodeOptions.value = [];
      returnTargetNode.value = '';
    } else {
      returnNodeOptions.value = returnableNodeList.map(node => {
        const approverNames = (node.handlerUsers && Array.isArray(node.handlerUsers))
          ? node.handlerUsers.map(user => user.realName || user.name || '未知用户').join('、')
          : '';
        return {
          value: node.nodeId,
          label: `${node.name}${approverNames ? ` (${approverNames})` : ''}`
        };
      });
      returnTargetNode.value = returnableNodeList[0].nodeId;
    }
  } catch (error) {
    console.error('获取可回退节点失败', error);
    returnNodeError.value = error.message || '获取可回退节点失败';
    returnNodeOptions.value = [];
    returnTargetNode.value = '';
  }
};

// 确认退回操作
const confirmReturn = async () => {
  if (!returnTargetNode.value) {
    ElMessage.warning('请选择退回节点');
    return;
  }

  try {
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '退回处理中...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    await flowProcessApi.returnTask({
      currentTaskId: props.taskDetail.taskId,
      targetNodeId: returnTargetNode.value,
      reason: approvalComment.value.trim()
    });

    loadingInstance.close();
    ElMessage.success('流程退回成功');
    emit('refresh');
    closeReturnDialog();
    emit('close');
  } catch (error) {
    console.error('退回流程失败', error);
  }
};

// 关闭退回对话框
const closeReturnDialog = () => {
  showReturnDialog.value = false;
  returnTargetNode.value = '';
  returnNodeOptions.value = [];
  returnNodeError.value = '';
  approvalComment.value = '';
};

// 处理加签操作
const handleAddApprover = () => {
  if (!props.taskDetail || !props.taskDetail.taskId) {
    ElMessage.warning('无法获取任务信息');
    return;
  }

  addApproverSelectedUsers.value = [];
  addApproverReason.value = '';
  addApproverLoading.value = false;
  showAddApproverDialog.value = true;
};

// 关闭加签对话框
const closeAddApproverDialog = () => {
  showAddApproverDialog.value = false;
  addApproverSelectedUsers.value = [];
  addApproverReason.value = '';
  addApproverLoading.value = false;
};

// 确认加签
const confirmAddApprover = async () => {
  if (!addApproverSelectedUsers.value || addApproverSelectedUsers.value.length === 0) {
    ElMessage.warning('请选择加签人员');
    return;
  }

  const userIds = addApproverSelectedUsers.value
    .map((u) => u?.id)
    .filter((id) => !!id);

  if (!userIds.length) {
    ElMessage.warning('请选择加签人员');
    return;
  }

  addApproverLoading.value = true;
  try {
    await flowProcessApi.addSignTask({
      taskId: props.taskDetail.taskId,
      userIds,
      reason: addApproverReason.value?.trim() || ''
    });

    ElMessage.success('加签成功');
    closeAddApproverDialog();

    // 刷新当前详情（用于更新日志/处理人展示等）
    emit('refresh-detail');
  } catch (error) {
    console.error('加签失败', error);
  } finally {
    addApproverLoading.value = false;
  }
};

// 处理评论操作
const handleComment = () => {
  if (!props.taskDetail || !props.taskDetail.formInstanceId) {
    ElMessage.warning('无法获取表单实例信息');
    return;
  }

  commentContent.value = '';
  showCommentDialog.value = true;
};

// 关闭评论对话框
const closeCommentDialog = () => {
  showCommentDialog.value = false;
  commentContent.value = '';
};

// 确认提交评论
const confirmComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空');
    return;
  }

  try {
    await flowProcessApi.commentTask({
      formInstanceId: props.taskDetail.formInstanceId,
      comment: commentContent.value.trim()
    });

    ElMessage.success('评论提交成功');
    closeCommentDialog();
    emit('refresh-detail');
  } catch (error) {
    console.error('评论提交失败', error);
  }
};

// 处理提交表单操作
const handleSubmitForm = () => {
  ElMessageBox.confirm('确定要提交此审批表单吗？', '提交确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  })
    .then(() => {
      emit('submit-form');
    });
};
</script>

<style scoped>
/* 固定在底部的操作按钮 */
.detail-actions-fixed {
  background: #ffffff;
  border-top: var(--x-border-base);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 3;
  height: auto;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

/* 左侧操作按钮组 */
.action-button {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  outline: none;
  color: #666;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: #f5f5f5;
  color: #333;
}

.action-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.disabled:hover {
  background-color: transparent;
  color: #666;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  color: inherit;
  font-size: 18px;
}

.el-icon {
  margin: 0;
}

.action-text {
  font-size: 11px;
  line-height: 1;
  color: inherit;
}

/* 定制Element UI的下拉菜单样式 */
:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
}

:deep(.el-dropdown-menu__item.is-disabled) {
  cursor: not-allowed;
  color: #c0c4cc;
}

:deep(.el-dropdown-menu__item.is-disabled:hover) {
  background-color: transparent;
}

/* 右侧审批操作按钮 */
.approval-actions {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 响应式设计 - 小屏幕适配 */
@media (max-width: 768px) {
  .detail-actions-fixed {
    padding: 8px 12px;
  }

  .action-button {
    min-width: 36px;
    height: 36px;
    padding: 3px 6px;
  }

  .action-text {
    font-size: 10px;
  }

  .action-icon {
    font-size: 16px;
  }
}

/* 对话框内表单项样式 */
.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: inline-block;
  width: 80px;
  font-weight: 500;
  color: #333;
}

.error-message {
  color: #f5222d;
  font-size: 14px;
  padding: 8px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
}

.transfer-tip {
  margin-bottom: 12px;
  padding: 8px 12px;
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.transfer-tip span {
  display: inline-block;
}

.submit-tip {
  margin-top: 15px;
  padding: 12px;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-size: 13px;
  color: #1890ff;
  text-align: center;
}
</style>
