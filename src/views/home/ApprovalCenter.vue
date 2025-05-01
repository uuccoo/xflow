<template>
  <div class="approval-center">
    <h2>审批中心</h2>
    
    <!-- 切换标签 -->
    <div class="tabs">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.name }}
      </div>
    </div>
    
    <!-- 待办列表 -->
    <div v-if="activeTab === 'todo'" class="approval-list">
      <div class="list-header">
        <span class="col title">申请标题</span>
        <span class="col applicant">申请人</span>
        <span class="col date">提交时间</span>
        <span class="col status">状态</span>
        <span class="col action">操作</span>
      </div>
      <div v-if="todoList.length === 0" class="empty-list">
        暂无待办审批
      </div>
      <div 
        v-for="(item, index) in todoList" 
        :key="index"
        class="list-item"
      >
        <span class="col title">{{ item.title }}</span>
        <span class="col applicant">{{ item.applicant }}</span>
        <span class="col date">{{ item.date }}</span>
        <span class="col status">{{ item.status }}</span>
        <span class="col action">
          <button class="btn approve" @click="handleApproval(item, 'approve')">同意</button>
          <button class="btn reject" @click="handleApproval(item, 'reject')">拒绝</button>
        </span>
      </div>
    </div>
    
    <!-- 已办列表 -->
    <div v-if="activeTab === 'done'" class="approval-list">
      <div class="list-header">
        <span class="col title">申请标题</span>
        <span class="col applicant">申请人</span>
        <span class="col date">提交时间</span>
        <span class="col status">状态</span>
        <span class="col action">操作</span>
      </div>
      <div v-if="doneList.length === 0" class="empty-list">
        暂无已办审批
      </div>
      <div 
        v-for="(item, index) in doneList" 
        :key="index"
        class="list-item"
      >
        <span class="col title">{{ item.title }}</span>
        <span class="col applicant">{{ item.applicant }}</span>
        <span class="col date">{{ item.date }}</span>
        <span class="col status">{{ item.status }}</span>
        <span class="col action">
          <button class="btn view" @click="viewDetail(item)">查看</button>
        </span>
      </div>
    </div>
    
    <!-- 我发起的列表 -->
    <div v-if="activeTab === 'mine'" class="approval-list">
      <div class="list-header">
        <span class="col title">申请标题</span>
        <span class="col date">提交时间</span>
        <span class="col status">状态</span>
        <span class="col action">操作</span>
      </div>
      <div v-if="myList.length === 0" class="empty-list">
        暂无我发起的审批
      </div>
      <div 
        v-for="(item, index) in myList" 
        :key="index"
        class="list-item"
      >
        <span class="col title">{{ item.title }}</span>
        <span class="col date">{{ item.date }}</span>
        <span class="col status">{{ item.status }}</span>
        <span class="col action">
          <button class="btn view" @click="viewDetail(item)">查看</button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 标签页定义
const tabs = [
  { name: '待我审批', key: 'todo' },
  { name: '我已审批', key: 'done' },
  { name: '我发起的', key: 'mine' }
];
const activeTab = ref('todo');

// 模拟数据
const todoList = ref([
  { id: 1, title: '张三的请假申请', applicant: '张三', date: '2025-04-28', status: '待审批' },
  { id: 2, title: '李四的报销申请', applicant: '李四', date: '2025-04-29', status: '待审批' },
  { id: 3, title: '王五的出差申请', applicant: '王五', date: '2025-04-30', status: '待审批' },
]);

const doneList = ref([
  { id: 4, title: '赵六的采购申请', applicant: '赵六', date: '2025-04-25', status: '已批准' },
  { id: 5, title: '钱七的请假申请', applicant: '钱七', date: '2025-04-26', status: '已拒绝' },
]);

const myList = ref([
  { id: 6, title: '出差申请', date: '2025-04-20', status: '进行中' },
  { id: 7, title: '报销申请', date: '2025-04-15', status: '已完成' },
  { id: 8, title: '请假申请', date: '2025-04-10', status: '已拒绝' },
]);

// 审批处理
const handleApproval = (item, action) => {
  console.log(`${action === 'approve' ? '同意' : '拒绝'}了 ${item.title}`);
  // 这里可以调用API进行审批操作
  // 然后从待办列表中移除该项，并添加到已办列表
  todoList.value = todoList.value.filter(i => i.id !== item.id);
  doneList.value.unshift({
    ...item,
    status: action === 'approve' ? '已批准' : '已拒绝'
  });
};

// 查看详情
const viewDetail = (item) => {
  console.log(`查看审批详情: ${item.title}`);
  // 这里可以跳转到详情页面或打开详情弹窗
};
</script>

<style scoped>
.approval-center {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  font-weight: 500;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.tab {
  padding: 10px 20px;
  cursor: pointer;
  position: relative;
}

.tab.active {
  color: #1890ff;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #1890ff;
}

.approval-list {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.list-header {
  display: flex;
  padding: 12px 15px;
  background-color: #f5f5f5;
  font-weight: bold;
}

.list-item {
  display: flex;
  padding: 15px;
  border-top: 1px solid #e0e0e0;
}

.col {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col.title {
  flex: 3;
}

.col.applicant {
  flex: 1;
}

.col.date {
  flex: 1;
}

.col.status {
  flex: 1;
}

.col.action {
  flex: 2;
  text-align: center;
}

.btn {
  margin: 0 5px;
  padding: 5px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn.approve {
  background-color: #52c41a;
  color: white;
}

.btn.reject {
  background-color: #f5222d;
  color: white;
}

.btn.view {
  background-color: #1890ff;
  color: white;
}

.empty-list {
  padding: 30px;
  text-align: center;
  color: #999;
}
</style>