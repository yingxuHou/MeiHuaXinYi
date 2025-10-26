<template>
  <div class="simple-tab-bar">
    <!-- 毛玻璃背景 -->
    <div class="tab-bar-bg"></div>
    
    <!-- 导航按钮 -->
    <div class="tab-nav">
      <div
        v-for="item in tabs"
        :key="item.name"
        class="tab-item"
        :class="{ 'active': isActive(item.path) }"
        @click="handleClick(item)"
      >
        <i :class="item.icon" class="tab-icon"></i>
        <span class="tab-label">{{ item.label }}</span>
        <div v-if="item.badge" class="tab-badge"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const tabs = computed(() => [
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
])

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleClick = (item) => {
  if (item.requireAuth && !userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  router.push(item.path)
}
</script>

<style scoped>
.simple-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-bar-bg {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.tab-nav {
  position: relative;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: space-around;
  padding: 0 16px;
}

.tab-item {
  position: relative;
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
}

.tab-item:active {
  transform: scale(0.95);
}

.tab-icon {
  font-size: 20px;
  color: #999999;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.tab-item.active .tab-icon {
  color: #fbbf24;
  transform: scale(1.1);
}

.tab-label {
  font-size: 10px;
  font-weight: 500;
  color: #999999;
  transition: all 0.3s ease;
}

.tab-item.active .tab-label {
  color: #fbbf24;
  font-weight: 600;
}

.tab-badge {
  position: absolute;
  top: 8px;
  right: 20px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* 移动端适配 */
@media (max-width: 375px) {
  .simple-tab-bar {
    height: 56px;
  }
  
  .tab-icon {
    font-size: 18px;
  }
  
  .tab-label {
    font-size: 9px;
  }
}

/* 桌面端隐藏 */
@media (min-width: 768px) {
  .simple-tab-bar {
    display: none;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .tab-bar-bg {
    background: rgba(15, 23, 42, 0.9);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
