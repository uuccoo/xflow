<script setup>
import { ref } from 'vue'

let value = ref('baseSetting')
</script>

<template>
  <header>
    <el-menu :default-active="value" active-text-color="#409eff" mode="horizontal" :ellipsis="false"
      @select="handleSelect">
      <el-menu-item index="baseSetting" @click="to('baseSetting')">基础信息</el-menu-item>
      <el-menu-item index="formSetting" @click="to('formSetting')">表单设计</el-menu-item>
      <el-menu-item index="processDesign" @click="to('processDesign')">流程设计
      </el-menu-item>
      <el-menu-item index="proSetting" @click="to('proSetting')">更多设置</el-menu-item>
    </el-menu>
    <div class="publish">
      <el-button size="mini" @click="preview"><i class="el-icon-view"></i>预览</el-button>
      <el-button size="mini" type="primary" @click="publish"><i class="el-icon-s-promotion"></i>发布</el-button>
    </div>
  </header>
</template>

<style scoped>
header {
  background-color: #ffffff;
}

.el-menu--horizontal {
  display: flex;
  justify-content: center;
  align-items: center;
}

.publish {
  position: absolute;
  top: 15px;
  right: 20px;
}
</style>
