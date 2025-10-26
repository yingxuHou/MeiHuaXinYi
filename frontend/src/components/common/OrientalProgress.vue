<template>
  <div 
    class="oriental-progress-container"
    :class="[
      `size-${size}`,
      `variant-${variant}`,
      { 
        'with-moon': showMoonIcon,
        'with-label': showLabel,
        'animated': animated
      }
    ]"
  >
    <!-- 进度条标签 -->
    <div v-if="showLabel" class="progress-label">
      <span class="label-text">{{ label }}</span>
      <span class="progress-text">{{ currentValue }}/{{ maxValue }}</span>
    </div>
    
    <!-- 进度条主体 -->
    <div class="progress-track">
      <div 
        class="progress-bar"
        :style="{ width: progressPercentage + '%' }"
      >
        <!-- 光泽效果 -->
        <div class="progress-shine"></div>
      </div>
      
      <!-- 月牙图标 -->
      <div 
        v-if="showMoonIcon" 
        class="moon-icon"
        :style="{ left: progressPercentage + '%' }"
      >
        <i class="fas fa-moon"></i>
      </div>
    </div>
    
    <!-- 进度提示 -->
    <div v-if="showTip && tip" class="progress-tip">
      <i class="fas fa-info-circle"></i>
      <span>{{ tip }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  currentValue: {
    type: Number,
    default: 0
  },
  maxValue: {
    type: Number,
    default: 100
  },
  label: {
    type: String,
    default: ''
  },
  tip: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'amber', 'gold', 'purple'].includes(value)
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  showMoonIcon: {
    type: Boolean,
    default: true
  },
  showTip: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: true
  }
})

// 计算进度百分比
const progressPercentage = computed(() => {
  if (props.maxValue === 0) return 0
  const percentage = (props.currentValue / props.maxValue) * 100
  return Math.min(Math.max(percentage, 0), 100)
})
</script>

<style scoped>
.oriental-progress-container {
  width: 100%;
  font-family: 'Inter', sans-serif;
}

/* 尺寸变体 */
.size-small .progress-track {
  height: 6px;
  border-radius: 3px;
}

.size-medium .progress-track {
  height: 8px;
  border-radius: 4px;
}

.size-large .progress-track {
  height: 12px;
  border-radius: 6px;
}

/* 进度条标签 */
.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.875rem;
}

.label-text {
  color: var(--text-primary);
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.progress-text {
  color: var(--gold-primary);
  font-weight: 500;
  font-size: 0.8rem;
}

/* 进度条轨道 */
.progress-track {
  position: relative;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 进度条 */
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--warm-yellow) 0%, var(--gold-primary) 100%);
  border-radius: inherit;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 0 10px rgba(255, 215, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* 变体样式 */
.variant-amber .progress-bar {
  background: linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%);
}

.variant-gold .progress-bar {
  background: linear-gradient(90deg, var(--gold-primary) 0%, #FFF4B8 50%, var(--gold-primary) 100%);
}

.variant-purple .progress-bar {
  background: linear-gradient(90deg, var(--purple-gradient-start) 0%, var(--blue-purple) 100%);
  box-shadow: 
    0 0 10px rgba(106, 122, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* 光泽效果 */
.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.4) 50%, 
    transparent 100%
  );
  border-radius: inherit;
}

.animated .progress-shine {
  animation: progress-shine 2.5s ease-in-out infinite;
}

/* 月牙图标 */
.moon-icon {
  position: absolute;
  top: -12px;
  transform: translateX(-50%);
  color: var(--gold-primary);
  font-size: 1rem;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
  z-index: 2;
  transition: left 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.animated .moon-icon {
  animation: moon-float 3s ease-in-out infinite;
}

.size-small .moon-icon {
  font-size: 0.8rem;
  top: -10px;
}

.size-large .moon-icon {
  font-size: 1.2rem;
  top: -14px;
}

/* 进度提示 */
.progress-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

.progress-tip i {
  color: var(--gold-primary);
  font-size: 0.7rem;
}

/* 动画定义 */
@keyframes progress-shine {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes moon-float {
  0%, 100% {
    transform: translateX(-50%) translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateX(-50%) translateY(-4px) rotate(5deg);
  }
}

/* 特殊状态样式 */
.oriental-progress-container[data-status="complete"] .progress-bar {
  background: linear-gradient(90deg, #10B981 0%, #34D399 100%);
  box-shadow: 
    0 0 15px rgba(16, 185, 129, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.oriental-progress-container[data-status="warning"] .progress-bar {
  background: linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%);
  box-shadow: 
    0 0 15px rgba(245, 158, 11, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.oriental-progress-container[data-status="danger"] .progress-bar {
  background: linear-gradient(90deg, #EF4444 0%, #F87171 100%);
  box-shadow: 
    0 0 15px rgba(239, 68, 68, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .progress-label {
    font-size: 0.8rem;
    margin-bottom: 6px;
  }
  
  .progress-text {
    font-size: 0.75rem;
  }
  
  .progress-tip {
    font-size: 0.7rem;
    margin-top: 6px;
  }
  
  .moon-icon {
    font-size: 0.9rem;
  }
  
  .size-large .moon-icon {
    font-size: 1rem;
  }
}

/* 性能优化 */
@media (prefers-reduced-motion: reduce) {
  .animated .progress-shine,
  .animated .moon-icon {
    animation: none !important;
  }
  
  .progress-bar {
    transition: none !important;
  }
  
  .moon-icon {
    transition: none !important;
  }
}
</style>
