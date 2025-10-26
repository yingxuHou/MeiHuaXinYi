<template>
  <div class="tabbar-debug" v-if="showDebug">
    <div class="debug-panel">
      <h3>TabBar 调试信息</h3>
      
      <div class="debug-section">
        <h4>设备检测</h4>
        <div class="debug-item">
          <span class="label">isMobile:</span>
          <span class="value" :class="{ 'true': appStore.isMobile, 'false': !appStore.isMobile }">
            {{ appStore.isMobile }}
          </span>
        </div>
        <div class="debug-item">
          <span class="label">屏幕宽度:</span>
          <span class="value">{{ appStore.deviceInfo.screenWidth }}px</span>
        </div>
        <div class="debug-item">
          <span class="label">屏幕高度:</span>
          <span class="value">{{ appStore.deviceInfo.screenHeight }}px</span>
        </div>
        <div class="debug-item">
          <span class="label">UserAgent包含移动端:</span>
          <span class="value">{{ isMobileUA }}</span>
        </div>
      </div>

      <div class="debug-section">
        <h4>路由信息</h4>
        <div class="debug-item">
          <span class="label">当前路由:</span>
          <span class="value">{{ $route.path }}</span>
        </div>
        <div class="debug-item">
          <span class="label">TabBar应该隐藏:</span>
          <span class="value">{{ shouldHideTabBar }}</span>
        </div>
      </div>

      <div class="debug-section">
        <h4>用户状态</h4>
        <div class="debug-item">
          <span class="label">已登录:</span>
          <span class="value" :class="{ 'true': userStore.isLoggedIn, 'false': !userStore.isLoggedIn }">
            {{ userStore.isLoggedIn }}
          </span>
        </div>
        <div class="debug-item">
          <span class="label">免费次数:</span>
          <span class="value">{{ userStore.freeCount }}</span>
        </div>
      </div>

      <div class="debug-actions">
        <button @click="toggleMobileMode" class="debug-btn">
          {{ appStore.isMobile ? '切换到桌面模式' : '切换到移动模式' }}
        </button>
        <button @click="refreshDeviceInfo" class="debug-btn">
          刷新设备信息
        </button>
      </div>
    </div>
    
    <button @click="showDebug = false" class="close-btn">×</button>
  </div>
  
  <!-- 调试按钮 -->
  <button v-if="!showDebug" @click="showDebug = true" class="debug-toggle">
    🐛
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const showDebug = ref(false)

const isMobileUA = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

const shouldHideTabBar = computed(() => {
  const hiddenRoutes = [
    '/login',
    '/register',
    '/profile-setup',
    '/divination/loading'
  ]
  
  return hiddenRoutes.some(hiddenRoute => 
    route.path.startsWith(hiddenRoute)
  )
})

const toggleMobileMode = () => {
  // 强制切换移动模式
  appStore.deviceInfo.isMobile = !appStore.deviceInfo.isMobile
}

const refreshDeviceInfo = () => {
  appStore.updateDeviceInfo()
}
</script>

<style scoped>
.tabbar-debug {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 20px;
  border-radius: 8px;
  font-size: 12px;
  max-width: 300px;
  backdrop-filter: blur(10px);
}

.debug-panel h3 {
  margin: 0 0 15px 0;
  color: #fbbf24;
  font-size: 14px;
}

.debug-section {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.debug-section h4 {
  margin: 0 0 8px 0;
  color: #cbd5e1;
  font-size: 12px;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.label {
  color: #94a3b8;
}

.value {
  font-weight: bold;
}

.value.true {
  color: #10b981;
}

.value.false {
  color: #ef4444;
}

.debug-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.debug-btn {
  padding: 4px 8px;
  background: #fbbf24;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
}

.debug-btn:hover {
  background: #f59e0b;
}

.close-btn {
  position: absolute;
  top: 5px;
  right: 8px;
  background: none;
  border: none;
  color: #ef4444;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
}

.debug-toggle {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 9998;
  background: #fbbf24;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.debug-toggle:hover {
  background: #f59e0b;
}
</style>
