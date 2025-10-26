<script setup>
import { onMounted, computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import Loading from '@/components/common/Loading.vue'
import { ElMessage } from 'element-plus'

// 状态管理
const userStore = useUserStore()
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

// 移动端检测
const showMobileTabBar = computed(() => {
  try {
    return appStore.isMobile || (typeof window !== 'undefined' && window.innerWidth <= 768)
  } catch (error) {
    console.warn('移动端检测失败:', error)
    return false
  }
})

// 移动端TabBar配置
const mobileTabItems = computed(() => {
  try {
    return [
      {
        name: 'home',
        path: '/',
        icon: 'fas fa-home',
        label: '首页'
      },
      {
        name: 'divination',
        path: '/divination/question',
        icon: 'fas fa-magic',
        label: '占卜',
        requireAuth: true
      },
      {
        name: 'history',
        path: '/divination/history',
        icon: 'fas fa-history',
        label: '记录',
        requireAuth: true
      },
      {
        name: 'user',
        path: '/user/center',
        icon: 'fas fa-user',
        label: '我的',
        badge: !userStore.isLoggedIn
      }
    ]
  } catch (error) {
    console.warn('TabBar配置失败:', error)
    return []
  }
})

// TabBar方法
const isCurrentRoute = (path) => {
  try {
    if (!route || !route.path) return false
    if (path === '/') {
      return route.path === '/'
    }
    return route.path.startsWith(path)
  } catch (error) {
    console.warn('路由检测失败:', error)
    return false
  }
}

const navigateToTab = (tab) => {
  try {
    if (!tab || !tab.path) return

    if (tab.requireAuth && !userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }

    if (route.path !== tab.path) {
      router.push(tab.path)
    }
  } catch (error) {
    console.error('导航失败:', error)
  }
}

// 应用初始化
onMounted(() => {
  try {
    console.log('🚀 App正在初始化...')

    // 初始化应用状态
    if (appStore && appStore.initializeApp) {
      appStore.initializeApp()
      console.log('✅ 应用状态初始化完成')
    }

    // 初始化用户状态（从本地存储恢复）
    if (userStore && userStore.initializeUser) {
      userStore.initializeUser()
      console.log('✅ 用户状态初始化完成')
    }

    // 如果有token，尝试获取用户信息
    if (userStore && userStore.token && userStore.fetchUserInfo) {
      userStore.fetchUserInfo().catch(error => {
        console.error('获取用户信息失败:', error)
        // 如果获取失败，清除无效的token
        if (userStore.logout) {
          userStore.logout()
        }
      })
    }

    // 调试信息
    console.log('📱 移动端检测:', {
      isMobile: appStore?.isMobile,
      screenWidth: typeof window !== 'undefined' ? window.innerWidth : 'unknown',
      showTabBar: showMobileTabBar.value
    })

    console.log('✅ App初始化完成')
  } catch (error) {
    console.error('❌ App初始化失败:', error)
  }
})
</script>

<template>
  <div id="app">
    <!-- 全局加载状态 -->
    <Loading
      v-if="appStore.isLoading"
      :fullscreen="true"
      :overlay="true"
      type="taiji"
      :text="appStore.loadingText"
    />

    <!-- 主要内容区域 -->
    <div class="app-content">
      <!-- 路由视图 -->
      <RouterView />
    </div>

    <!-- 移动端TabBar导航栏 - 强制显示 -->
    <div class="mobile-tab-bar" style="display: block !important;">
      <div class="tab-bar-background"></div>
      <div class="tab-bar-nav">
        <div
          class="tab-bar-item"
          :class="{ 'active': route.path === '/' }"
          @click="router.push('/')"
        >
          <span class="tab-icon">🏠</span>
          <span class="tab-label">首页</span>
        </div>
        <div
          class="tab-bar-item"
          :class="{ 'active': route.path.startsWith('/divination') }"
          @click="router.push('/divination/question')"
        >
          <span class="tab-icon">✨</span>
          <span class="tab-label">占卜</span>
        </div>
        <div
          class="tab-bar-item"
          :class="{ 'active': route.path.startsWith('/history') }"
          @click="router.push('/divination/history')"
        >
          <span class="tab-icon">📚</span>
          <span class="tab-label">记录</span>
        </div>
        <div
          class="tab-bar-item"
          :class="{ 'active': route.path.startsWith('/user') }"
          @click="router.push('/user/center')"
        >
          <span class="tab-icon">👤</span>
          <span class="tab-label">我的</span>
          <div v-if="!userStore.isLoggedIn" class="tab-badge"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a;
  color: #ffffff;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  width: 100%;
  position: relative;
}

.app-content {
  min-height: 100vh;
  width: 100%;
  position: relative;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-content {
    padding-bottom: 60px; /* 为TabBar留出空间 */
  }
}

/* iOS安全区域适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  @media (max-width: 768px) {
    .app-content {
      padding-bottom: calc(60px + env(safe-area-inset-bottom));
    }
  }
}

/* ===== 内联TabBar样式 ===== */
.mobile-tab-bar {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  height: 60px !important;
  z-index: 9999 !important;
  padding-bottom: env(safe-area-inset-bottom);
  display: block !important;
  visibility: visible !important;
}

.tab-bar-background {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.tab-bar-nav {
  position: relative;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: space-around;
  padding: 0 16px;
}

.tab-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  user-select: none;
  position: relative;
}

.tab-bar-item:active {
  transform: scale(0.95);
}

.tab-icon {
  font-size: 20px !important;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  display: block !important;
  line-height: 1 !important;
  filter: grayscale(1) opacity(0.6);
}

.tab-bar-item.active .tab-icon {
  filter: grayscale(0) opacity(1);
  transform: scale(1.1);
}

.tab-label {
  font-size: 10px !important;
  font-weight: 500;
  color: #999999 !important;
  transition: all 0.3s ease;
}

.tab-bar-item.active .tab-label {
  color: #fbbf24 !important;
  font-weight: 600;
}

.tab-badge {
  position: absolute;
  top: 8px;
  right: 20px;
  width: 8px;
  height: 8px;
  background: #ef4444 !important;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* 桌面端也显示TabBar（用于测试） */
@media (min-width: 769px) {
  .mobile-tab-bar {
    display: block !important;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .tab-bar-background {
    background: rgba(15, 23, 42, 0.9) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(251, 191, 36, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(251, 191, 36, 0.7);
}

/* Firefox滚动条 */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(251, 191, 36, 0.5) rgba(255, 255, 255, 0.1);
}

/* 选择文本样式 */
::selection {
  background: rgba(251, 191, 36, 0.3);
  color: #ffffff;
}

/* 焦点样式 */
:focus-visible {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
}

/* 链接样式 */
a {
  color: #fbbf24;
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: #f59e0b;
}

/* 禁用状态 */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 工具类 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.hidden {
  display: none !important;
}

.visible {
  display: block !important;
}

/* 响应式工具类 */
@media (max-width: 768px) {
  .mobile-hidden {
    display: none !important;
  }

  .mobile-visible {
    display: block !important;
  }
}

@media (min-width: 769px) {
  .desktop-hidden {
    display: none !important;
  }

  .desktop-visible {
    display: block !important;
  }
}

/* 动画性能优化 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  :root {
    --primary-color: #ffffff;
    --secondary-color: #000000;
    --background-color: #000000;
    --text-color: #ffffff;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
  }
}
</style>
