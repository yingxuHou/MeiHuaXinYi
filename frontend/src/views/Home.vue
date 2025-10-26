<template>
  <div class="starry-bg">
    <!-- 星座装饰元素 -->
    <div class="constellation-decoration"></div>

    <!-- 星座符号装饰 -->
    <div class="zodiac-symbol">♈</div>
    <div class="zodiac-symbol">♌</div>
    <div class="zodiac-symbol">♐</div>
    <div class="zodiac-symbol">♓</div>

    <div class="oriental-home-container">
      <!-- 顶部用户信息区 -->
      <div class="top-user-section" v-if="userStore.isLoggedIn">
        <div class="user-info-header">
          <!-- 左侧用户信息 -->
          <div class="user-profile-info">
            <div class="user-avatar">
              <div class="avatar-circle">
                <i class="fas fa-yin-yang"></i>
              </div>
            </div>
            <div class="user-details">
              <div class="user-name">{{ userStore.userInfo.nickname || '易学爱好者' }}</div>
              <div class="user-status">✧ 今日运势：大吉 ✧</div>
            </div>
          </div>

          <!-- 右侧图标 -->
          <div class="header-actions">
            <div class="action-icon notification-icon" @click="showNotifications">
              <i class="fas fa-bell"></i>
              <span class="notification-badge" v-if="notificationCount > 0">{{ notificationCount }}</span>
            </div>
            <div class="action-icon user-icon" @click="goToUserCenter">
              <i class="fas fa-user-circle"></i>
            </div>
          </div>
        </div>

        <!-- 免费占卜次数卡片 -->
        <div class="free-count-section">
          <div class="free-count-card">
            <!-- 装饰星星 -->
            <div class="card-decoration top-star">⭐</div>

            <div class="card-content">
              <!-- 左侧内容 -->
              <div class="count-info">
                <div class="count-title">
                  <span class="moon-icon">🌙</span>
                  <span class="title-text">免费占卜次数</span>
                </div>
                <div class="count-subtitle">✧ 今日剩余次数 ✧</div>
              </div>

              <!-- 右侧数字 -->
              <div class="count-display">
                <div class="count-number">{{ userStore.freeCount || 8 }}</div>
                <div class="count-total">共10次</div>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="progress-container">
              <div
                class="progress-bar"
                :style="`width: ${(userStore.freeCount || 8) * 10}%`"
              ></div>
            </div>

            <!-- 分享按钮 -->
            <div class="share-section" @click="shareForMoreQuota">
              <span class="gift-icon">🎁</span>
              <span class="share-text">✦ 分享获得更多次数 ✦</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 开始占卜按钮 - 神秘星空主题 -->
      <div class="start-divination-section">
        <div class="relative mb-8">
          <!-- 外层光环效果 -->
          <div class="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full pulse-ring opacity-30"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full pulse-ring opacity-20 pulse-ring-delayed"></div>

          <button
            class="mystical-btn relative w-full py-6 rounded-full text-primary font-bold text-xl flex items-center justify-center space-x-3 overflow-hidden"
            :disabled="userStore.isLoggedIn && userStore.freeCount <= 0"
            @click="startDivination"
          >
            <!-- 背景星光效果 -->
            <div class="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 opacity-90"></div>

            <!-- 内容 -->
            <div class="relative z-10 flex items-center space-x-3">
              <i class="fas fa-yin-yang text-2xl enhanced-taiji"></i>
              <span class="tracking-wide">✦ 开始占卜 ✦</span>
              <i class="fas fa-chevron-right"></i>
            </div>

            <!-- 装饰星星 -->
            <div class="absolute top-2 left-4 text-primary/30">
              <i class="fas fa-star text-xs"></i>
            </div>
            <div class="absolute bottom-2 right-4 text-primary/30">
              <i class="fas fa-star text-xs"></i>
            </div>
          </button>
        </div>
      </div>

      <!-- 功能卡片区域 -->
      <div class="function-cards-section">
        <div class="function-cards-grid">
          <!-- 历史记录卡片 -->
          <div class="function-card" @click="goToHistory">
            <div class="card-decoration">⭐</div>
            <div class="card-icon">
              <i class="fas fa-history"></i>
            </div>
            <div class="card-content">
              <div class="card-title">历史记录</div>
              <div class="card-subtitle">✧ 查看过往占卜 ✧</div>
            </div>
          </div>

          <!-- 运势分析卡片 -->
          <div class="function-card" @click="goToAnalysis">
            <div class="card-decoration">⭐</div>
            <div class="card-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="card-content">
              <div class="card-title">运势分析</div>
              <div class="card-subtitle">✧ 个人趋势报告 ✧</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 今日推荐模块 -->
      <div class="recommendation-section">
        <div class="recommendation-header">
          <h2 class="recommendation-title">
            <span class="star-icon">⭐</span>
            ✦ 今日推荐 ✦
          </h2>
        </div>

        <div class="recommendation-cards">
          <!-- 感情运势占卜 -->
          <div class="recommendation-card" @click="startLoveDivination">
            <div class="card-decoration">💕</div>
            <div class="card-icon love-icon">
              <span>💖</span>
            </div>
            <div class="card-content">
              <div class="card-title">感情运势占卜</div>
              <div class="card-subtitle">✧ 了解近期感情发展趋势 ✧</div>
            </div>
            <div class="card-arrow">▶</div>
          </div>

          <!-- 事业发展指引 -->
          <div class="recommendation-card" @click="startCareerDivination">
            <div class="card-decoration">💼</div>
            <div class="card-icon career-icon">
              <span>💼</span>
            </div>
            <div class="card-content">
              <div class="card-title">事业发展指引</div>
              <div class="card-subtitle">✧ 职场决策的智慧建议 ✧</div>
            </div>
            <div class="card-arrow">▶</div>
          </div>
        </div>
      </div>

      <!-- 未登录用户的认证区域 -->
      <div class="auth-section" v-if="!userStore.isLoggedIn">
        <div class="auth-prompt">
          <h2 class="auth-title">开启您的易学之旅</h2>
          <p class="auth-subtitle">注册即可获得免费占卜机会</p>
        </div>

        <div class="auth-buttons">
          <button class="btn-oriental-primary" @click="goToRegister">
            <i class="fas fa-user-plus"></i>
            <span>立即注册</span>
          </button>
          <button class="btn-oriental-secondary" @click="goToLogin">
            <i class="fas fa-sign-in-alt"></i>
            <span>已有账号</span>
          </button>
        </div>
      </div>

      <!-- 底部知识卡片 -->
      <div class="knowledge-section">
        <div class="knowledge-card">
          <div class="knowledge-header">
            <h3 class="knowledge-title">梅花易数的起源</h3>
          </div>
          <div class="knowledge-content">
            <p class="knowledge-text">
              梅花易数是宋代易学大师邵雍所创，以时间、方位、事物等自然现象为依据，
              通过八卦推演来预测事物发展趋势的古老智慧。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useDivinationStore } from '@/stores/divination'
import { useAppStore } from '@/stores/app'

import OrientalAvatar from '@/components/common/OrientalAvatar.vue'
import OrientalProgress from '@/components/common/OrientalProgress.vue'
// import OrientalRecommendCard from '@/components/common/OrientalRecommendCard.vue'
import { formatRelativeTime } from '@/utils'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()
const divinationStore = useDivinationStore()
const appStore = useAppStore()

// 响应式数据
const notificationCount = ref(3) // 通知数量

// 计算属性
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

// 方法
const startDivination = () => {
  if (!userStore.isLoggedIn) {
    router.push('/register')
    return
  }

  if (userStore.freeCount <= 0) {
    ElMessage.warning('今日免费次数已用完，请明天再来或升级会员')
    return
  }

  router.push('/divination/question')
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

const goToHistory = () => {
  router.push('/divination/history')
}

const goToUserCenter = () => {
  router.push('/user/center')
}

// 新增方法
const showNotifications = () => {
  ElMessage.info('通知功能开发中...')
}

const shareForMoreQuota = () => {
  ElMessage.info('分享功能开发中...')
}

const goToAnalysis = () => {
  ElMessage.info('运势分析功能开发中...')
}

const startLoveDivination = () => {
  router.push('/divination/question?type=love')
}

const startCareerDivination = () => {
  router.push('/divination/question?type=career')
}

// 组件挂载时初始化
onMounted(() => {
  // 设置当前路由
  appStore.setCurrentRoute('home')
})
</script>

<style scoped>
/* ===== 基于设计稿的星空主题样式 ===== */

/* 星空背景动画 */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes float-mystical {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-8px) rotate(2deg); }
  66% { transform: translateY(4px) rotate(-1deg); }
}

@keyframes cosmic-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}

/* 星空背景基础 */
.starry-bg {
  background: linear-gradient(135deg,
    #0a0a23 0%,
    #1a1a3e 25%,
    #2d1b69 50%,
    #1e1e3f 75%,
    #0f0f2a 100%);
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

.starry-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(2px 2px at 20px 30px, #fff, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 160px 30px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 4s ease-in-out infinite alternate;
  pointer-events: none;
}

/* 星座装饰元素 */
.constellation-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.constellation-decoration::after {
  content: '✦ ✧ ⋆ ✦ ✧ ⋆ ✦ ✧ ⋆';
  position: absolute;
  top: 10%;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(251, 191, 36, 0.3);
  font-size: 12px;
  letter-spacing: 20px;
  animation: twinkle 6s ease-in-out infinite;
}

/* 星座符号装饰 */
.zodiac-symbol {
  position: absolute;
  color: rgba(251, 191, 36, 0.2);
  font-size: 24px;
  animation: float-mystical 8s ease-in-out infinite;
  pointer-events: none;
}

.zodiac-symbol:nth-child(2) { top: 10%; left: 10%; animation-delay: 0s; }
.zodiac-symbol:nth-child(3) { top: 20%; right: 15%; animation-delay: 2s; }
.zodiac-symbol:nth-child(4) { bottom: 30%; left: 20%; animation-delay: 4s; }
.zodiac-symbol:nth-child(5) { bottom: 15%; right: 10%; animation-delay: 6s; }

/* 神秘卡片样式 */
.mystical-card {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 191, 36, 0.2);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.mystical-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(251, 191, 36, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: rgba(251, 191, 36, 0.4);
}

/* 神秘文字样式 */
.mystical-text {
  color: #ffffff;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
}

.mystical-text-secondary {
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
}

.mystical-text-accent {
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

/* 宇宙发光效果 */
.cosmic-glow {
  box-shadow:
    0 0 20px rgba(251, 191, 36, 0.3),
    0 0 40px rgba(251, 191, 36, 0.1),
    0 0 60px rgba(251, 191, 36, 0.05);
}

/* 神秘按钮样式 */
.mystical-btn {
  background: linear-gradient(135deg,
    rgba(251, 191, 36, 0.9) 0%,
    rgba(245, 158, 11, 0.9) 100%);
  border: 2px solid rgba(251, 191, 36, 0.5);
  box-shadow:
    0 4px 15px rgba(251, 191, 36, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  color: #0f172a;
  font-weight: bold;
  border-radius: 9999px;
  padding: 24px 36px;
  transition: all 0.3s ease;
}

.mystical-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent);
  transition: left 0.5s ease;
}

.mystical-btn:hover::before {
  left: 100%;
}

.mystical-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 25px rgba(251, 191, 36, 0.4),
    0 0 20px rgba(251, 191, 36, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* 脉冲光环效果 */
.pulse-ring {
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.3); opacity: 0; }
}

/* 太极符号增强 */
.enhanced-taiji {
  position: relative;
  animation: cosmic-pulse 3s ease-in-out infinite;
}

.enhanced-taiji::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 50%;
  animation: constellation-glow 2s ease-in-out infinite;
}

@keyframes constellation-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.3); }
  50% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.6), 0 0 30px rgba(251, 191, 36, 0.3); }
}

/* 实用工具类 */
.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.w-full { width: 100%; }
.flex { display: flex; }
.items-center { align-items: center; }
.space-x-3 > * + * { margin-left: 0.75rem; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-2xl { font-size: 1.5rem; }
.font-medium { font-weight: 500; }
.tracking-wide { letter-spacing: 0.025em; }
.rounded-full { border-radius: 9999px; }
.overflow-hidden { overflow: hidden; }
.opacity-30 { opacity: 0.3; }
.opacity-40 { opacity: 0.4; }
.opacity-90 { opacity: 0.9; }
.top-1 { top: 0.25rem; }
.top-2 { top: 0.5rem; }
.right-1 { right: 0.25rem; }
.right-2 { right: 0.5rem; }
.right-4 { right: 1rem; }
.bottom-2 { bottom: 0.5rem; }
.left-4 { left: 1rem; }
.w-12 { width: 3rem; }
.h-12 { height: 3rem; }
.flex-1 { flex: 1 1 0%; }
.z-10 { z-index: 10; }

/* 渐变背景工具类 */
.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
.bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
.from-yellow-400 { --tw-gradient-from: #fbbf24; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(251, 191, 36, 0)); }
.to-yellow-500 { --tw-gradient-to: #f59e0b; }
.via-yellow-300 { --tw-gradient-stops: var(--tw-gradient-from), #fcd34d, var(--tw-gradient-to, rgba(252, 211, 77, 0)); }
.from-yellow-300 { --tw-gradient-from: #fcd34d; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(252, 211, 77, 0)); }
.to-yellow-400 { --tw-gradient-to: #fbbf24; }
.from-pink-400\/30 { --tw-gradient-from: rgba(244, 114, 182, 0.3); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(244, 114, 182, 0)); }
.to-red-500\/30 { --tw-gradient-to: rgba(239, 68, 68, 0.3); }
.from-green-400\/30 { --tw-gradient-from: rgba(74, 222, 128, 0.3); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(74, 222, 128, 0)); }
.to-emerald-500\/30 { --tw-gradient-to: rgba(16, 185, 129, 0.3); }

/* 悬停效果 */
.hover\:scale-110:hover { transform: scale(1.1); }
.transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }

/* ===== 移动优先的主容器设计 ===== */
.oriental-home-container {
  min-height: 100vh;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 100%;
  margin: 0 auto;
  background: transparent;
  position: relative;
  z-index: 10;
}

/* 免费次数卡片优化 */
.free-count-section {
  margin: 0.5rem 0;
}

.free-count-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  max-width: 100%;
  margin: 0 auto;
}

.free-count-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.card-decoration {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 0.875rem;
  opacity: 0.6;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.count-info {
  flex: 1;
}

.count-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.moon-icon {
  font-size: 1.125rem;
}

.title-text {
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.count-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.count-display {
  text-align: right;
}

.count-number {
  color: #fbbf24;
  font-size: 2.25rem;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 2px 8px rgba(251, 191, 36, 0.5);
}

.count-total {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin-top: 2px;
}

.progress-container {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
}

.share-section {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-section:hover {
  transform: scale(1.02);
}

.gift-icon {
  font-size: 1rem;
}

.share-text {
  color: #fbbf24;
  font-size: 0.875rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.free-count-card .text-3xl {
  font-size: 2.5rem;
  line-height: 1.2;
  font-weight: 900;
}

.free-count-card .text-lg {
  font-size: 1.25rem;
  line-height: 1.4;
  font-weight: 600;
}

.free-count-card .text-sm {
  font-size: 0.875rem;
  line-height: 1.3;
}

.free-count-card .text-xs {
  font-size: 0.75rem;
  line-height: 1.2;
}

/* ===== 顶部用户信息区 ===== */
.top-user-section {
  margin-bottom: 0.75rem;
}

.user-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2px;
  margin-bottom: 0.75rem;
}

.user-profile-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  position: relative;
}

.avatar-circle {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e3a8a;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.user-status {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  /* 触摸优化 */
  min-width: 44px;
  min-height: 44px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.action-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.action-icon i {
  color: #fbbf24;
  font-size: 1.125rem;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

/* ===== 开始占卜按钮 - 神秘星空主题 ===== */
.start-divination-section {
  margin: 1rem 0;
  padding: 0 2px;
}

/* 脉冲光环效果 */
.pulse-ring {
  animation: pulse-ring 2s infinite;
}

.pulse-ring-delayed {
  animation-delay: 0.5s;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.3); opacity: 0; }
}

/* 神秘按钮样式 - 触摸优化 */
.mystical-btn {
  background: linear-gradient(135deg,
    rgba(251, 191, 36, 0.9) 0%,
    rgba(245, 158, 11, 0.9) 100%);
  border: 2px solid rgba(251, 191, 36, 0.5);
  box-shadow:
    0 4px 15px rgba(251, 191, 36, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  color: #0f172a;
  font-weight: bold;
  border-radius: 9999px;
  transition: all 0.3s ease;
  cursor: pointer;
  /* 触摸优化 */
  min-height: 48px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.mystical-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent);
  transition: left 0.5s ease;
}

.mystical-btn:hover::before {
  left: 100%;
}

.mystical-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 25px rgba(251, 191, 36, 0.4),
    0 0 20px rgba(251, 191, 36, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.mystical-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.mystical-btn:disabled:hover {
  transform: none !important;
}

/* 太极符号增强 */
.enhanced-taiji {
  position: relative;
  animation: cosmic-pulse 3s ease-in-out infinite;
}

.enhanced-taiji::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 50%;
  animation: constellation-glow 2s ease-in-out infinite;
}

@keyframes cosmic-pulse {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
}

@keyframes constellation-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.3); }
  50% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.6), 0 0 30px rgba(251, 191, 36, 0.3); }
}

/* 实用工具类 */
.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.w-full { width: 100%; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.space-x-3 > * + * { margin-left: 0.75rem; }
.text-xs { font-size: 0.75rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.font-bold { font-weight: 700; }
.tracking-wide { letter-spacing: 0.025em; }
.rounded-full { border-radius: 9999px; }
.overflow-hidden { overflow: hidden; }
.opacity-20 { opacity: 0.2; }
.opacity-30 { opacity: 0.3; }
.opacity-90 { opacity: 0.9; }
.top-2 { top: 0.5rem; }
.bottom-2 { bottom: 0.5rem; }
.left-4 { left: 1rem; }
.right-4 { right: 1rem; }
.z-10 { z-index: 10; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }

/* 渐变背景工具类 */
.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
.from-yellow-300 { --tw-gradient-from: #fcd34d; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(252, 211, 77, 0)); }
.from-yellow-400 { --tw-gradient-from: #fbbf24; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(251, 191, 36, 0)); }
.to-yellow-400 { --tw-gradient-to: #fbbf24; }
.to-yellow-500 { --tw-gradient-to: #f59e0b; }
.via-yellow-300 { --tw-gradient-stops: var(--tw-gradient-from), #fcd34d, var(--tw-gradient-to, rgba(252, 211, 77, 0)); }

/* 文字颜色 */
.text-primary { color: #0f172a; }
.text-primary\/30 { color: rgba(15, 23, 42, 0.3); }

/* ===== 功能卡片区域 ===== */
.function-cards-section {
  margin: 1rem 0;
  padding: 0 2px;
}

.function-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.function-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  /* 触摸优化 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.function-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.function-card .card-decoration {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.75rem;
  opacity: 0.5;
}

.function-card .card-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.function-card .card-icon i {
  color: #1e3a8a;
  font-size: 1.25rem;
}

.function-card .card-content {
  flex: 1;
}

.function-card .card-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.function-card .card-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.function-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 0 12px 30px rgba(42, 35, 87, 0.3);
}

.function-card .card-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--gold-primary), var(--warm-yellow));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--primary-deep);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  flex-shrink: 0;
}

.function-card .card-content {
  flex: 1;
}

.function-card .card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
}

.function-card .card-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
}

/* ===== 今日推荐模块 ===== */
.recommendation-section {
  margin: 1rem 0;
  padding: 0 2px;
}

.recommendation-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.recommendation-title {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.star-icon {
  color: #fbbf24;
  font-size: 1rem;
}

.recommendation-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.recommendation-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  /* 触摸优化 */
  min-height: 64px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.recommendation-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.recommendation-card .card-decoration {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.875rem;
  opacity: 0.6;
}

.recommendation-card .card-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.love-icon {
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.3), rgba(239, 68, 68, 0.3));
}

.career-icon {
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.3), rgba(16, 185, 129, 0.3));
}

.recommendation-card .card-content {
  flex: 1;
}

.recommendation-card .card-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.recommendation-card .card-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.recommendation-card .card-arrow {
  color: #fbbf24;
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.recommendation-card:hover .card-arrow {
  transform: translateX(4px);
}

/* ===== 认证区域 ===== */
.auth-section {
  text-align: center;
  margin: 2rem 0;
  padding: 2rem;
  background: var(--glass-light);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-medium);
  border-radius: 20px;
  max-width: 500px;
  margin: 2rem auto;
}

.auth-prompt {
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, var(--gold-primary), var(--warm-yellow));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;
}

/* ===== 底部知识卡片 ===== */
.knowledge-section {
  margin: 3rem 0 2rem 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.knowledge-card {
  background: var(--glass-light);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-medium);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(42, 35, 87, 0.3);
}

.knowledge-header {
  margin-bottom: 16px;
}

.knowledge-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
  background: linear-gradient(135deg, var(--gold-primary), var(--warm-yellow));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.knowledge-content {
  text-align: center;
}

.knowledge-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* ===== 动画定义 ===== */
@keyframes gift-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes star-twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* 移动端星座符号优化 */
@media (max-width: 414px) {
  .zodiac-symbol {
    font-size: 18px;
  }

  .constellation-decoration::after {
    font-size: 10px;
    letter-spacing: 15px;
  }
}

/* ===== 响应式设计 - 移动优先 ===== */

/* 大屏手机 (414px+) - iPhone 6 Plus, iPhone X 等 */
@media (min-width: 414px) {
  .oriental-home-container {
    padding: 14px 18px;
    gap: 1.125rem;
    max-width: 420px;
  }

  .avatar-circle {
    width: 44px;
    height: 44px;
    font-size: 1.375rem;
  }

  .user-name {
    font-size: 1.0625rem;
  }

  .action-icon {
    width: 38px;
    height: 38px;
  }

  .free-count-card {
    padding: 18px;
  }

  .count-number {
    font-size: 2.375rem;
  }

  .mystical-btn {
    padding: 20px 32px;
    font-size: 1.125rem;
  }

  .function-card {
    padding: 15px;
    min-height: 85px;
  }

  .function-card .card-icon {
    width: 38px;
    height: 38px;
  }

  .recommendation-card {
    padding: 15px;
  }

  .recommendation-card .card-icon {
    width: 46px;
    height: 46px;
  }
}

/* 平板竖屏 (768px+) */
@media (min-width: 768px) {
  .oriental-home-container {
    padding: 20px 24px;
    gap: 1.5rem;
    max-width: 500px;
  }

  .avatar-circle {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .user-name {
    font-size: 1.125rem;
  }

  .user-status {
    font-size: 0.875rem;
  }

  .action-icon {
    width: 40px;
    height: 40px;
  }

  .free-count-card {
    padding: 20px;
  }

  .count-number {
    font-size: 2.5rem;
  }

  .title-text {
    font-size: 1.125rem;
  }

  .mystical-btn {
    padding: 24px 36px;
    font-size: 1.25rem;
  }

  .enhanced-taiji {
    font-size: 1.5rem;
  }

  .function-cards-grid {
    gap: 14px;
  }

  .function-card {
    padding: 18px;
    min-height: 95px;
  }

  .function-card .card-icon {
    width: 42px;
    height: 42px;
  }

  .function-card .card-title {
    font-size: 1.0625rem;
  }

  .recommendation-title {
    font-size: 1.375rem;
  }

  .recommendation-card {
    padding: 18px;
  }

  .recommendation-card .card-icon {
    width: 50px;
    height: 50px;
    font-size: 1.625rem;
  }

  .recommendation-card .card-title {
    font-size: 1.0625rem;
  }
}

/* 桌面端 (1024px+) */
@media (min-width: 1024px) {
  .oriental-home-container {
    padding: 24px;
    gap: 2rem;
    max-width: 600px;
  }

  .start-divination-section {
    margin: 1.5rem 0;
  }

  .function-cards-section {
    margin: 1.5rem 0;
  }

  .recommendation-section {
    margin: 1.5rem 0;
  }
}

/* 小屏手机优化 (max-width: 375px) */
@media (max-width: 375px) {
  .oriental-home-container {
    padding: 10px 14px;
    gap: 0.875rem;
  }

  .avatar-circle {
    width: 38px;
    height: 38px;
    font-size: 1.125rem;
  }

  .user-name {
    font-size: 0.9rem;
  }

  .user-status {
    font-size: 0.75rem;
  }

  .action-icon {
    width: 32px;
    height: 32px;
  }

  .action-icon i {
    font-size: 0.875rem;
  }

  .free-count-card {
    padding: 14px;
  }

  .count-number {
    font-size: 2rem;
  }

  .title-text {
    font-size: 0.9rem;
  }

  .mystical-btn {
    padding: 16px 24px;
    font-size: 1rem;
  }

  .enhanced-taiji {
    font-size: 1.25rem;
  }

  .function-cards-grid {
    gap: 8px;
  }

  .function-card {
    padding: 12px;
    min-height: 75px;
  }

  .function-card .card-icon {
    width: 32px;
    height: 32px;
  }

  .function-card .card-title {
    font-size: 0.85rem;
  }

  .function-card .card-subtitle {
    font-size: 0.7rem;
  }

  .recommendation-title {
    font-size: 1rem;
  }

  .recommendation-card {
    padding: 12px;
  }

  .recommendation-card .card-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .recommendation-card .card-title {
    font-size: 0.85rem;
  }

  .recommendation-card .card-subtitle {
    font-size: 0.75rem;
  }

  .count-subtitle {
    font-size: 0.75rem;
  }

  .mystical-btn {
    padding: 18px 24px;
    font-size: 1rem;
  }

  .enhanced-taiji {
    font-size: 1.25rem;
  }

  .function-cards-grid {
    gap: 8px;
  }

  .function-card {
    padding: 12px;
    min-height: 75px;
  }

  .function-card .card-icon {
    width: 32px;
    height: 32px;
  }

  .function-card .card-icon i {
    font-size: 1rem;
  }

  .function-card .card-title {
    font-size: 0.85rem;
  }

  .function-card .card-subtitle {
    font-size: 0.7rem;
  }

  .recommendation-title {
    font-size: 1rem;
  }

  .recommendation-card {
    padding: 12px;
  }

  .recommendation-card .card-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .recommendation-card .card-title {
    font-size: 0.85rem;
  }

  .recommendation-card .card-subtitle {
    font-size: 0.75rem;
  }

  .mystical-btn {
    padding: 16px 20px;
    font-size: 0.95rem;
  }

  .zodiac-symbol {
    font-size: 18px;
  }

  .function-cards-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .start-divination-btn {
    padding: 14px 28px;
    font-size: 1rem;
    min-width: 240px;
  }

  .auth-buttons {
    gap: 10px;
  }

  .section-title {
    font-size: 1.2rem;
    gap: 8px;
  }

  .section-title i {
    font-size: 1rem;
  }
}

/* ===== 性能优化 ===== */
@media (prefers-reduced-motion: reduce) {
  .share-tip i,
  .section-title i {
    animation: none !important;
  }

  .function-card:hover,
  .share-tip:hover {
    transform: none !important;
  }
}

/* ===== 移动端触摸优化 ===== */
@media (hover: none) and (pointer: coarse) {
  /* 移动设备专用样式 */
  .mystical-btn:active {
    transform: translateY(0) scale(0.98);
    box-shadow:
      0 2px 8px rgba(251, 191, 36, 0.4),
      0 0 15px rgba(251, 191, 36, 0.3);
  }

  .function-card:active,
  .recommendation-card:active {
    transform: translateY(0) scale(0.98);
    background: rgba(255, 255, 255, 0.15);
  }

  .action-icon:active {
    transform: translateY(0) scale(0.95);
    background: rgba(255, 255, 255, 0.2);
  }

  /* 禁用悬停效果，使用点击效果 */
  .mystical-btn:hover,
  .function-card:hover,
  .recommendation-card:hover,
  .action-icon:hover {
    transform: none;
  }
}

/* 无障碍优化 */
@media (prefers-reduced-motion: reduce) {
  .mystical-btn,
  .function-card,
  .recommendation-card,
  .action-icon,
  .pulse-ring,
  .enhanced-taiji {
    animation: none !important;
    transition: none !important;
  }

  .mystical-btn:hover,
  .function-card:hover,
  .recommendation-card:hover {
    transform: none !important;
  }
}
</style>
