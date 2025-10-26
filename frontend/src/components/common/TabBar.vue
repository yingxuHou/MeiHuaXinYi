<template>
  <div class="tab-bar" :class="{ 'tab-bar--hidden': isHidden }">
    <!-- 毛玻璃背景 -->
    <div class="tab-bar__background"></div>
    
    <!-- 导航按钮容器 -->
    <div class="tab-bar__container">
      <div class="tab-bar__nav">
        <!-- 4个导航按钮，等距分布 -->
        <div
          v-for="(item, index) in tabItems"
          :key="item.name"
          class="tab-bar__item"
          :class="{
            'tab-bar__item--active': isActiveTab(item.path),
            'tab-bar__item--disabled': isTabDisabled(item),
            'tab-bar__item--loading': item.loading
          }"
          @click="handleTabClick(item, $event)"
        >
          <!-- 点击波纹效果 -->
          <div class="tab-bar__ripple" ref="rippleRefs"></div>
          
          <!-- 图标容器 -->
          <div class="tab-bar__icon-container">
            <!-- 加载状态 -->
            <div v-if="item.loading" class="tab-bar__loading-spinner">
              <i class="fas fa-spinner"></i>
            </div>
            
            <!-- 正常图标 -->
            <i v-else :class="item.icon" class="tab-bar__icon"></i>
            
            <!-- 红点徽章 -->
            <div 
              v-if="item.badge && !item.loading" 
              class="tab-bar__badge"
              :class="{ 'tab-bar__badge--dot': item.badge === true }"
            >
              <span v-if="typeof item.badge === 'number'">
                {{ item.badge > 99 ? '99+' : item.badge }}
              </span>
            </div>
          </div>
          
          <!-- 文字标签 -->
          <span class="tab-bar__label">{{ item.label }}</span>
          
          <!-- 活跃状态指示器 -->
          <div v-if="isActiveTab(item.path)" class="tab-bar__indicator"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 路由和状态管理
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const isHidden = ref(false)
const rippleRefs = ref([])
const loadingStates = ref({
  home: false,
  divination: false,
  history: false,
  user: false
})

// TabBar配置
const tabItems = computed(() => [
  {
    name: 'home',
    path: '/',
    icon: 'fas fa-home',
    label: '首页',
    requireAuth: false,
    loading: loadingStates.value.home
  },
  {
    name: 'divination',
    path: '/divination/question',
    icon: 'fas fa-magic',
    label: '占卜',
    requireAuth: true,
    requireFreeCount: true,
    loading: loadingStates.value.divination
  },
  {
    name: 'history',
    path: '/divination/history',
    icon: 'fas fa-history',
    label: '记录',
    requireAuth: true,
    loading: loadingStates.value.history
  },
  {
    name: 'user',
    path: '/user/center',
    icon: 'fas fa-user',
    label: '我的',
    requireAuth: false, // 改为false，让未登录用户也能点击，然后引导登录
    loading: loadingStates.value.user,
    badge: !userStore.isLoggedIn ? true : false // 未登录时显示红点
  }
])

// 计算属性
const isActiveTab = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path.split('?')[0])
}

const isTabDisabled = (item) => {
  if (item.requireAuth && !userStore.isLoggedIn) {
    return false // 不禁用，而是显示登录提示
  }
  if (item.requireFreeCount && userStore.freeCount <= 0) {
    return true // 免费次数用完时禁用
  }
  return false
}

// 方法
const handleTabClick = async (item, event) => {
  // 防止重复点击当前页面
  if (isActiveTab(item.path)) return

  // 检查权限
  if (item.requireAuth && !userStore.isLoggedIn) {
    ElMessage({
      message: '请先登录',
      type: 'warning',
      duration: 2000
    })
    router.push('/login')
    return
  }

  // 检查免费次数
  if (item.requireFreeCount && userStore.freeCount <= 0) {
    ElMessage({
      message: '今日免费次数已用完',
      type: 'warning',
      duration: 2000
    })
    return
  }

  // 添加点击动画效果
  createRippleEffect(event)

  // 添加触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }

  // 设置加载状态
  loadingStates.value[item.name] = true

  try {
    // 路由跳转
    await router.push(item.path)
  } catch (error) {
    console.error('路由跳转失败:', error)
    ElMessage({
      message: '页面跳转失败，请重试',
      type: 'error',
      duration: 2000
    })
  } finally {
    // 延迟取消加载状态，确保用户能看到反馈
    setTimeout(() => {
      loadingStates.value[item.name] = false
    }, 300)
  }
}

// 创建波纹效果
const createRippleEffect = (event) => {
  const button = event.currentTarget
  const ripple = button.querySelector('.tab-bar__ripple')
  
  if (!ripple) return
  
  // 清除之前的动画
  ripple.classList.remove('tab-bar__ripple--active')
  
  // 计算波纹位置
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2
  
  // 设置波纹样式
  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = x + 'px'
  ripple.style.top = y + 'px'
  
  // 触发动画
  nextTick(() => {
    ripple.classList.add('tab-bar__ripple--active')
  })
}

// 滚动隐藏逻辑
let lastScrollY = 0
const handleScroll = () => {
  const currentScrollY = window.scrollY
  
  // 向下滚动超过100px时隐藏，向上滚动时显示
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    isHidden.value = true
  } else if (currentScrollY < lastScrollY) {
    isHidden.value = false
  }
  
  lastScrollY = currentScrollY
}

// 路由变化时的处理
const handleRouteChange = () => {
  // 在某些页面隐藏TabBar
  const hiddenRoutes = [
    '/login',
    '/register',
    '/profile-setup',
    '/divination/loading'
  ]

  const shouldHide = hiddenRoutes.some(hiddenRoute =>
    route.path.startsWith(hiddenRoute)
  )

  isHidden.value = shouldHide

  // 调试信息
  console.log('TabBar路由变化:', {
    currentPath: route.path,
    shouldHide,
    hiddenRoutes,
    isHidden: isHidden.value
  })
}

// 生命周期
onMounted(() => {
  console.log('TabBar组件已挂载')
  handleRouteChange()
  window.addEventListener('scroll', handleScroll, { passive: true })

  // 调试信息
  console.log('TabBar初始状态:', {
    isHidden: isHidden.value,
    currentRoute: route.path,
    tabItems: tabItems.value
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 监听路由变化
router.afterEach(() => {
  handleRouteChange()
})
</script>

<style scoped>
/* ===== TabBar 主容器 ===== */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 1000;
  transition: transform 0.3s ease;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-bar--hidden {
  transform: translateY(100%);
}

/* ===== 毛玻璃背景 ===== */
.tab-bar__background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

/* ===== 容器和导航 ===== */
.tab-bar__container {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
}

.tab-bar__nav {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-around; /* 等距分布 */
  max-width: 400px; /* 限制最大宽度 */
}

/* ===== TabBar 项目 ===== */
.tab-bar__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.tab-bar__item:active {
  transform: scale(0.95);
}

.tab-bar__item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.tab-bar__item--loading {
  pointer-events: none;
}

/* ===== 波纹效果 ===== */
.tab-bar__ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.3);
  transform: scale(0);
  pointer-events: none;
  z-index: 1;
}

.tab-bar__ripple--active {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    transform: scale(2);
    opacity: 0;
  }
}

/* ===== 图标容器 ===== */
.tab-bar__icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
  z-index: 2;
}

.tab-bar__icon {
  font-size: 20px;
  color: #999999;
  transition: all 0.3s ease;
}

.tab-bar__item--active .tab-bar__icon {
  color: #fbbf24;
  transform: scale(1.1);
}

/* ===== 加载状态 ===== */
.tab-bar__loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.tab-bar__loading-spinner i {
  font-size: 18px;
  color: #fbbf24;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ===== 徽章 ===== */
.tab-bar__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.tab-bar__badge--dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  padding: 0;
  border-radius: 50%;
  top: -2px;
  right: -2px;
}

/* ===== 文字标签 ===== */
.tab-bar__label {
  font-size: 10px;
  font-weight: 500;
  color: #999999;
  transition: all 0.3s ease;
  z-index: 2;
  line-height: 1;
}

.tab-bar__item--active .tab-bar__label {
  color: #fbbf24;
  font-weight: 600;
}

/* ===== 活跃指示器 ===== */
.tab-bar__indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #fbbf24;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
  z-index: 2;
}

/* ===== 响应式适配 ===== */
/* 小屏手机 (320px-375px) */
@media (max-width: 375px) {
  .tab-bar {
    height: 56px;
  }

  .tab-bar__icon {
    font-size: 18px;
  }

  .tab-bar__label {
    font-size: 9px;
  }

  .tab-bar__icon-container {
    width: 28px;
    height: 28px;
  }
}

/* 大屏手机 (414px+) */
@media (min-width: 414px) {
  .tab-bar {
    height: 64px;
  }

  .tab-bar__icon {
    font-size: 22px;
  }

  .tab-bar__label {
    font-size: 11px;
  }

  .tab-bar__icon-container {
    width: 36px;
    height: 36px;
  }
}

/* 平板和桌面端隐藏 */
@media (min-width: 768px) {
  .tab-bar {
    display: none;
  }
}

/* 横屏适配 */
@media (max-width: 768px) and (orientation: landscape) {
  .tab-bar {
    height: 52px;
  }

  .tab-bar__icon {
    font-size: 16px;
  }

  .tab-bar__label {
    font-size: 8px;
  }

  .tab-bar__icon-container {
    width: 24px;
    height: 24px;
    margin-bottom: 2px;
  }
}

/* ===== 性能优化 ===== */
/* 减少动画（用户偏好） */
@media (prefers-reduced-motion: reduce) {
  .tab-bar__item,
  .tab-bar__icon,
  .tab-bar__label,
  .tab-bar__ripple {
    transition: none !important;
    animation: none !important;
  }

  .tab-bar__loading-spinner i {
    animation: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .tab-bar__background {
    background: #ffffff;
    border-top: 2px solid #000000;
  }

  .tab-bar__icon {
    color: #000000;
  }

  .tab-bar__item--active .tab-bar__icon {
    color: #0066cc;
  }

  .tab-bar__label {
    color: #000000;
  }

  .tab-bar__item--active .tab-bar__label {
    color: #0066cc;
  }

  .tab-bar__indicator {
    background: #0066cc;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .tab-bar__background {
    background: rgba(15, 23, 42, 0.9);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tab-bar__icon {
    color: rgba(255, 255, 255, 0.6);
  }

  .tab-bar__item--active .tab-bar__icon {
    color: #fbbf24;
  }

  .tab-bar__label {
    color: rgba(255, 255, 255, 0.6);
  }

  .tab-bar__item--active .tab-bar__label {
    color: #fbbf24;
  }
}

/* ===== 触摸优化 ===== */
.tab-bar__item {
  /* 增大触摸区域 */
  min-height: 44px;
  min-width: 44px;
}

/* iOS安全区域适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .tab-bar {
    padding-bottom: calc(env(safe-area-inset-bottom) + 8px);
  }
}

/* Android导航栏适配 */
@supports (padding-bottom: env(keyboard-inset-height)) {
  .tab-bar {
    padding-bottom: calc(env(keyboard-inset-height) + 8px);
  }
}

/* ===== 性能优化提示 ===== */
.tab-bar__item,
.tab-bar__icon,
.tab-bar__label {
  /* 启用硬件加速 */
  will-change: transform, color;
  transform: translateZ(0);
}

/* 防止文本选择 */
.tab-bar * {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
