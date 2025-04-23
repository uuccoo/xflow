import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// 导入 ElMessage 及其样式
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'

import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

// 全局挂载 ElMessage
app.config.globalProperties.$message = ElMessage

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)

app.mount('#app')
