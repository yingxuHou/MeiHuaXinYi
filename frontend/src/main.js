import './assets/main.css'
import './assets/styles/mobile.css'

// 引入FontAwesome图标库
import '@fortawesome/fontawesome-free/css/all.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'

// 创建应用实例
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化用户store
const initializeApp = async () => {
  const userStore = useUserStore()
  await userStore.initializeUser()
  console.log('✅ 用户store初始化完成')
}

// 挂载应用并初始化
app.mount('#app')
initializeApp()
