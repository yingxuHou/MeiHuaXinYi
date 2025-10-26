<template>
  <div class="mobile-navigation" :class="{ 'hidden': !appStore.showMobileNav }">
    <!-- 导航背景 -->
    <div class="nav-background"></div>
    
    <!-- 导航项 -->
    <div class="nav-items">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="nav-item"
        :class="{ 
          'active': isActive(item.path),
          'disabled': item.disabled 
        }"
        @click="handleNavClick(item)"
      >
        <!-- 图标容器 -->
        <div class="nav-icon-container">
          <div class="nav-icon-bg" v-if="isActive(item.path)"></div>
          <i :class="item.icon" class="nav-icon"></i>
          
          <!-- 徽章 -->
          <div 
            v-if="item.badge && item.badge > 0" 
            class="nav-badge"
          >
            {{ item.badge > 99 ? '99+' : item.badge }}
          </div>
        </div>
        
        <!-- 标签 -->
        <span class="nav-label">{{ item.label }}</span>
        
        <!-- 活跃指示器 -->
        <div class="nav-indicator" v-if="isActive(item.path)"></div>
      </router-link>
    </div>
    
    <!-- 中央占卜按钮 -->
    <div class="center-button-container">
      <div 
        class="center-button"
        :class="{ 
          'active': isCenterActive,
          'disabled': !canDivination 
        }"
        @click="handleCenterClick"
      >
        <div class="center-button-bg"></div>
        <div class="center-button-content">
          <i class="fas fa-yin-yang center-icon"></i>
        </div>
        <div class="center-button-ring"></div>
      </div>
      <span class="center-label">占卜</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

// 路由和状态管理
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 导航项配置
const navItems = [
  {
    name: 'home',
    path: '/',
    icon: 'fas fa-home',
    label: '首页',
    disabled: false
  },
  {
    name: 'history',
    path: '/divination/history',
    icon: 'fas fa-history',
    label: '历史',
    disabled: false,
    requireAuth: true
  },
  {
    name: 'placeholder1',
    path: '#',
    icon: '',
    label: '',
    disabled: true,
    hidden: true // 占位符，为中央按钮留空间
  },
  {
    name: 'favorites',
    path: '/divination/history?filter=favorite',
    icon: 'fas fa-heart',
    label: '收藏',
    disabled: false,
    requireAuth: true
  },
  {
    name: 'user',
    path: '/user/center',
    icon: 'fas fa-user',
    label: '我的',
    disabled: false,
    requireAuth: true
  }
]

// 计算属性
const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path.split('?')[0])
}

const isCenterActive = computed(() => {
  return route.path.includes('/divination/question') || 
         route.path.includes('/divination/loading')
})

const canDivination = computed(() => {
  return userStore.isLoggedIn && userStore.freeCount > 0
})

// 方法
const handleNavClick = (item) => {
  if (item.disabled || item.hidden) return
  
  // 检查是否需要登录
  if (item.requireAuth && !userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 如果是当前页面，不进行跳转
  if (isActive(item.path)) return
  
  // 添加点击反馈
  navigator.vibrate && navigator.vibrate(50)
}

const handleCenterClick = () => {
  if (!canDivination.value) {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      router.push('/login')
    } else {
      ElMessage.warning('今日免费次数已用完')
    }
    return
  }
  
  // 添加点击反馈
  navigator.vibrate && navigator.vibrate(100)
  
  // 跳转到占卜页面
  router.push('/divination/question')
}

// 监听路由变化，自动隐藏/显示导航栏
const handleRouteChange = () => {
  const hiddenRoutes = [
    '/login',
    '/register',
    '/profile-setup',
    '/divination/loading'
  ]
  
  const shouldHide = hiddenRoutes.some(hiddenRoute => 
    route.path.startsWith(hiddenRoute)
  )
  
  appStore.setMobileNavVisibility(!shouldHide)
}

// 监听滚动，实现导航栏自动隐藏
let lastScrollY = 0
const handleScroll = () => {
  const currentScrollY = window.scrollY
  
  // 向下滚动隐藏，向上滚动显示
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    appStore.setMobileNavVisibility(false)
  } else if (currentScrollY < lastScrollY) {
    appStore.setMobileNavVisibility(true)
  }
  
  lastScrollY = currentScrollY
}

// 组件挂载时初始化
onMounted(() => {
  handleRouteChange()
  
  // 监听滚动事件
  window.addEventListener('scroll', handleScroll, { passive: true })
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 监听路由变化
router.afterEach(() => {
  handleRouteChange()
})
</script>

<style scoped>
.mobile-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  z-index: 1000;
  transition: transform 0.3s ease;
  padding-bottom: env(safe-area-inset-bottom);
}

.mobile-navigation.hidden {
  transform: translateY(100%);
}

.nav-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-items {
  position: relative;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: space-around;
  padding: 0 1rem;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  border-radius: 12px;
  min-width: 50px;
  position: relative;
  flex: 1;
  max-width: 80px;
}

.nav-item.hidden {
  visibility: hidden;
  pointer-events: none;
}

.nav-item.disabled {
  opacity: 0.3;
  pointer-events: none;
}

.nav-item.active {
  color: #fbbf24;
}

.nav-item:not(.disabled):not(.active):hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
}

.nav-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-bottom: 0.25rem;
}

.nav-icon-bg {
  position: absolute;
  inset: 0;
  background: rgba(251, 191, 36, 0.2);
  border-radius: 50%;
  animation: pulse-glow 2s ease-in-out infinite;
}

.nav-icon {
  font-size: 1.25rem;
  z-index: 2;
  transition: transform 0.3s ease;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #ffffff;
  font-size: 0.625rem;
  font-weight: bold;
  padding: 0.125rem 0.25rem;
  border-radius: 8px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #fbbf24;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
}

/* 中央占卜按钮 */
.center-button-container {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.center-button {
  position: relative;
  width: 60px;
  height: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.center-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.center-button:not(.disabled):hover {
  transform: scale(1.05);
}

.center-button:not(.disabled):active {
  transform: scale(0.95);
}

.center-button-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  box-shadow: 
    0 4px 20px rgba(251, 191, 36, 0.4),
    0 0 0 4px rgba(15, 23, 42, 1),
    0 0 0 6px rgba(255, 255, 255, 0.1);
}

.center-button-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.center-icon {
  font-size: 1.75rem;
  color: #1e3a8a;
  animation: rotate 20s linear infinite;
}

.center-button-ring {
  position: absolute;
  inset: -8px;
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 50%;
  animation: pulse-ring 2s ease-in-out infinite;
}

.center-button.active .center-button-ring {
  border-color: rgba(251, 191, 36, 0.6);
  animation-duration: 1s;
}

.center-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #fbbf24;
  margin-top: 0.25rem;
}

/* 动画定义 */
@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .mobile-navigation {
    height: 65px;
  }
  
  .center-button {
    width: 55px;
    height: 55px;
    top: -22px;
  }
  
  .center-icon {
    font-size: 1.5rem;
  }
  
  .nav-icon {
    font-size: 1.125rem;
  }
  
  .nav-label {
    font-size: 0.7rem;
  }
}

/* 横屏适配 */
@media (max-width: 768px) and (orientation: landscape) {
  .mobile-navigation {
    height: 60px;
  }
  
  .center-button {
    width: 50px;
    height: 50px;
    top: -20px;
  }
  
  .center-icon {
    font-size: 1.375rem;
  }
}

/* 性能优化 */
@media (prefers-reduced-motion: reduce) {
  .nav-icon,
  .center-icon,
  .nav-icon-bg,
  .center-button-ring {
    animation: none;
  }
  
  .nav-item,
  .center-button {
    transition: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .nav-background {
    background: #000000;
    border-top-color: #ffffff;
  }
  
  .nav-item {
    color: #ffffff;
  }
  
  .nav-item.active {
    color: #ffff00;
  }
}
</style>
