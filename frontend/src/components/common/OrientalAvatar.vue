<template>
  <div 
    class="oriental-avatar-container"
    :class="[
      `size-${size}`,
      { 
        'with-compass': showCompass,
        'with-status': showStatus,
        'animated': animated
      }
    ]"
  >
    <!-- 金色罗盘光效 -->
    <div class="compass-ring" v-if="showCompass">
      <div class="compass-line" v-for="n in 8" :key="n" :style="{ transform: `rotate(${n * 45}deg)` }"></div>
    </div>
    
    <!-- 头像主体 -->
    <div class="avatar-main">
      <img 
        v-if="src" 
        :src="src" 
        :alt="alt || '用户头像'"
        class="avatar-image"
        @error="handleImageError"
      />
      <div v-else class="avatar-placeholder">
        <i :class="placeholderIcon"></i>
      </div>
      
      <!-- 状态指示器 -->
      <div 
        v-if="showStatus" 
        class="status-indicator"
        :class="statusType"
      ></div>
    </div>
    
    <!-- 用户信息 -->
    <div v-if="showUserInfo" class="user-info">
      <div class="user-name">{{ userName || '易学爱好者' }}</div>
      <div v-if="userStatus" class="user-status">
        <i class="fas fa-arrow-up status-icon"></i>
        <span>{{ userStatus }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'xlarge'].includes(value)
  },
  showCompass: {
    type: Boolean,
    default: true
  },
  showStatus: {
    type: Boolean,
    default: false
  },
  statusType: {
    type: String,
    default: 'online',
    validator: (value) => ['online', 'offline', 'busy', 'away'].includes(value)
  },
  showUserInfo: {
    type: Boolean,
    default: false
  },
  userName: {
    type: String,
    default: ''
  },
  userStatus: {
    type: String,
    default: ''
  },
  placeholderIcon: {
    type: String,
    default: 'fas fa-user'
  },
  animated: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['click', 'imageError'])

// 响应式数据
const imageError = ref(false)

// 处理图片加载错误
const handleImageError = () => {
  imageError.value = true
  emit('imageError')
}

// 处理点击事件
const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.oriental-avatar-container {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 尺寸变体 */
.size-small .avatar-main {
  width: 48px;
  height: 48px;
}

.size-medium .avatar-main {
  width: 64px;
  height: 64px;
}

.size-large .avatar-main {
  width: 80px;
  height: 80px;
}

.size-xlarge .avatar-main {
  width: 120px;
  height: 120px;
}

/* 金色罗盘光效 */
.compass-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  z-index: 1;
}

.compass-line {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--gold-primary) 20%,
    transparent 30%,
    transparent 70%,
    var(--gold-primary) 80%,
    transparent 100%
  );
  transform-origin: center;
  opacity: 0.6;
}

.animated .compass-ring {
  animation: compass-rotate 8s linear infinite;
}

/* 头像主体 */
.avatar-main {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--gold-primary);
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
  z-index: 2;
  background: var(--glass-light);
  backdrop-filter: blur(10px);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--purple-gradient-start), var(--purple-gradient-end));
  color: var(--gold-primary);
  font-size: 1.5rem;
}

.size-small .avatar-placeholder {
  font-size: 1rem;
}

.size-large .avatar-placeholder {
  font-size: 2rem;
}

.size-xlarge .avatar-placeholder {
  font-size: 3rem;
}

/* 状态指示器 */
.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--primary-deep);
  z-index: 3;
}

.status-indicator.online {
  background: #10B981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.status-indicator.offline {
  background: #6B7280;
}

.status-indicator.busy {
  background: #EF4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}

.status-indicator.away {
  background: #F59E0B;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
}

/* 用户信息 */
.user-info {
  margin-top: 12px;
  text-align: center;
  z-index: 2;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.user-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.875rem;
  color: var(--gold-primary);
  font-weight: 500;
}

.status-icon {
  font-size: 0.75rem;
  animation: status-pulse 2s ease-in-out infinite;
}

/* 悬停效果 */
.oriental-avatar-container:hover .avatar-main {
  transform: scale(1.05);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.6),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.oriental-avatar-container:hover .avatar-image {
  transform: scale(1.1);
}

/* 动画定义 */
@keyframes compass-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes status-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .size-medium .avatar-main {
    width: 56px;
    height: 56px;
  }
  
  .size-large .avatar-main {
    width: 72px;
    height: 72px;
  }
  
  .compass-ring {
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
  }
  
  .user-name {
    font-size: 0.9rem;
  }
  
  .user-status {
    font-size: 0.8rem;
  }
}

/* 性能优化 */
@media (prefers-reduced-motion: reduce) {
  .animated .compass-ring,
  .status-icon {
    animation: none !important;
  }
  
  .oriental-avatar-container:hover .avatar-main,
  .oriental-avatar-container:hover .avatar-image {
    transform: none !important;
  }
}
</style>
