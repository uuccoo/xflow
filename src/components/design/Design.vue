<script setup>
import { ref } from 'vue'

let defaultActive = ref('basicSettings')
</script>

<template>
  <header>
    <el-menu :default-active="defaultActive" active-text-color="#409eff" mode="horizontal" :ellipsis="false"
      :router="true">
      <el-menu-item index="basicSettings" route="/design/basicSettings">基础信息</el-menu-item>
      <el-menu-item index="formDesign" route="/design/formDesign">表单设计</el-menu-item>
      <el-menu-item index="flowDesign" route="/design/flowDesign">流程设计</el-menu-item>
      <el-menu-item index="moreSettings" route="/design/moreSettings">更多设置</el-menu-item>
    </el-menu>
    <div class="publish">
      <el-button size="mini" @click="preview">预览</el-button>
      <el-button size="mini" type="primary" @click="publish">发布</el-button>
    </div>
  </header>
  <el-container>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped lang="scss">
header {
  background-color: #ffffff;

  .el-menu {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.publish {
  position: absolute;
  top: 0px;
  right: 30px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;

  .el-button {
    border-radius: 8px;

    .el-icon {
      margin-right: 7px;
    }
  }
}
</style>
