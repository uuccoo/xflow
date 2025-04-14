<template>
  <el-container class="form-design-container">
    <!-- 左侧组件面板 -->
    <el-aside width="280px" class="component-panel">
      <h3>表单组件</h3>
      <el-divider></el-divider>

      <!-- 替换el-menu为自定义组件网格 -->
      <div class="component-list">
        <div class="component-category">
          <h4>基础组件</h4>
          <div class="component-grid">
            <div class="component-item" draggable="true">
              <el-icon>
                <document />
              </el-icon>
              <span>单行文本</span>
            </div>
            <div class="component-item" draggable="true">
              <el-icon><document-copy /></el-icon>
              <span>多行文本</span>
            </div>
            <div class="component-item" draggable="true">
              <el-icon>
                <check />
              </el-icon>
              <span>单选框</span>
            </div>
            <div class="component-item" draggable="true">
              <el-icon><select /></el-icon>
              <span>多选框</span>
            </div>
          </div>
        </div>

        <div class="component-category">
          <h4>高级组件</h4>
          <div class="component-grid">
            <div class="component-item" draggable="true">
              <el-icon>
                <calendar />
              </el-icon>
              <span>日期选择</span>
            </div>
            <div class="component-item" draggable="true">
              <el-icon>
                <upload />
              </el-icon>
              <span>文件上传</span>
            </div>
            <div class="component-item" draggable="true">
              <el-icon>
                <picture />
              </el-icon>
              <span>图片上传</span>
            </div>
          </div>
        </div>
      </div>

    </el-aside>

    <!-- 中间设计区域 -->
    <el-main class="design-area">
      <div class="design-header">
        <h2>表单设计</h2>
        <el-button type="primary" size="small">预览</el-button>
      </div>
      <div class="design-canvas">
        <p class="empty-tip">拖拽左侧组件到此处进行表单设计</p>
        <!-- 此处将放置拖拽的表单控件 -->
      </div>
    </el-main>

    <!-- 右侧属性配置面板 -->
    <el-aside width="280px" class="property-panel">
      <h3>属性设置</h3>
      <el-divider></el-divider>
      <el-form label-position="top" size="small" class="property-form">
        <el-form-item label="字段标题">
          <el-input placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="字段名称">
          <el-input placeholder="请输入字段名"></el-input>
        </el-form-item>
        <el-form-item label="是否必填">
          <el-switch></el-switch>
        </el-form-item>
        <el-form-item label="校验规则">
          <el-select placeholder="请选择校验规则" style="width: 100%">
            <el-option label="无" value="none"></el-option>
            <el-option label="邮箱" value="email"></el-option>
            <el-option label="手机号" value="phone"></el-option>
            <el-option label="身份证" value="id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="默认值">
          <el-input placeholder="请输入默认值"></el-input>
        </el-form-item>
      </el-form>
    </el-aside>
  </el-container>
</template>

<script setup>
// 可以在这里添加逻辑代码
</script>

<style scoped>
.form-design-container {
  height: calc(100vh - 60px);
  overflow: hidden;
}

.component-panel {
  background-color: #ffffff;
  /* 左侧背景颜色为白色 */
  border-right: 1px solid #ebeef5;
  padding: 15px 0;
}

.component-panel h3 {
  padding-left: 20px;
  margin-top: 0;
  color: #606266;
}

/* 删除 .component-menu 相关样式 */

/* 添加新的组件列表样式 */
.component-list {
  padding: 0 10px;
}

.component-category {
  margin-bottom: 15px;
}

.component-category h4 {
  margin: 10px 0;
  color: #909399;
  font-size: 14px;
  font-weight: normal;
}

.component-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* 修改组件项样式，使图标和文字显示在同一行 */
.component-item {
  display: flex;
  flex-direction: row;
  /* 改为横向排列 */
  align-items: center;
  /* 垂直居中 */
  justify-content: flex-start;
  /* 水平靠左 */
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 6px 10px;
  /* 调整内边距 */
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.component-item:hover {
  background-color: #f0f5ff;
  border-color: #a0cfff;
}

.component-item .el-icon {
  font-size: 16px;
  margin-right: 8px;
  /* 增加图标和文字的间距 */
  color: #409eff;
}

.component-item span {
  font-size: 12px;
  /* 小字体 */
  color: #606266;
  /* 更改为深灰色，与系统风格一致 */
  font-weight: 500;
  /* 稍微加粗，增强可读性 */
}

.design-area {
  background-color: #f7f7f7;
  /* 中间部分背景颜色为浅灰色 */
  display: flex;
  flex-direction: column;
}

.design-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.design-header h2 {
  margin: 0;
  font-weight: 500;
  color: #303133;
}

.design-canvas {
  flex: 1;
  padding: 20px;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-tip {
  color: #909399;
  font-size: 14px;
}

.property-panel {
  background-color: #ffffff;
  /* 右侧背景颜色为白色 */
  border-left: 1px solid #ebeef5;
  padding: 15px;
}

.property-panel h3 {
  margin-top: 0;
  color: #606266;
}

.property-form {
  margin-top: 15px;
}
</style>