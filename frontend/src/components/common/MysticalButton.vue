<template>
  <button
    class="mystical-button"
    :class="[
      `variant-${variant}`,
      `size-${size}`,
      {
        'loading': loading,
        'disabled': disabled,
        'full-width': fullWidth,
        'icon-only': iconOnly,
        'glowing': glowing
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- 发光效果 -->
    <div class="button-glow" v-if="glowing"></div>
    
    <!-- 按钮内容 -->
    <div class="button-content">
      <!-- 加载图标 -->
      <div class="loading-icon" v-if="loading">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      
      <!-- 左侧图标 -->
      <i 
        v-if="leftIcon && !loading" 
        :class="leftIcon" 
        class="button-icon left-icon"
      ></i>
      
      <!-- 按钮文本 -->
      <span class="button-text" v-if="!iconOnly">
        <slot>{{ text }}</slot>
      </span>
      
      <!-- 右侧图标 -->
      <i 
        v-if="rightIcon && !loading" 
        :class="rightIcon" 
        class="button-icon right-icon"
      ></i>
    </div>
    
    <!-- 波纹效果 -->
    <div class="ripple-container" ref="rippleContainer"></div>
  </button>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'ghost', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  leftIcon: {
    type: String,
    default: ''
  },
  rightIcon: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  iconOnly: {
    type: Boolean,
    default: false
  },
  glowing: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['click'])

// Refs
const rippleContainer = ref(null)

// 处理点击事件
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    createRipple(event)
    emit('click', event)
  }
}

// 创建波纹效果
const createRipple = (event) => {
  const button = event.currentTarget
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2
  
  const ripple = document.createElement('div')
  ripple.className = 'ripple'
  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = x + 'px'
  ripple.style.top = y + 'px'
  
  if (rippleContainer.value) {
    rippleContainer.value.appendChild(ripple)
    
    // 移除波纹元素
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    }, 600)
  }
}
</script>

<style scoped>
.mystical-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  outline: none;
  font-family: inherit;
}

/* 尺寸变体 */
.size-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  min-height: 36px;
}

.size-medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  min-height: 44px;
}

.size-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  min-height: 52px;
}

/* 图标按钮 */
.icon-only.size-small {
  padding: 0.5rem;
  width: 36px;
}

.icon-only.size-medium {
  padding: 0.75rem;
  width: 44px;
}

.icon-only.size-large {
  padding: 1rem;
  width: 52px;
}

/* 全宽按钮 */
.full-width {
  width: 100%;
}

/* 颜色变体 */
.variant-primary {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1e3a8a;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.variant-primary:hover:not(.disabled):not(.loading) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4);
}

.variant-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.variant-secondary:hover:not(.disabled):not(.loading) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.variant-outline {
  background: transparent;
  color: #fbbf24;
  border: 2px solid #fbbf24;
}

.variant-outline:hover:not(.disabled):not(.loading) {
  background: rgba(251, 191, 36, 0.1);
  transform: translateY(-1px);
}

.variant-ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: none;
}

.variant-ghost:hover:not(.disabled):not(.loading) {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.variant-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.variant-danger:hover:not(.disabled):not(.loading) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

/* 发光效果 */
.button-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #fbbf24, #6366f1, #fbbf24);
  border-radius: inherit;
  z-index: -1;
  opacity: 0.7;
  animation: glow-pulse 2s ease-in-out infinite alternate;
}

/* 按钮内容 */
.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
}

.button-text {
  white-space: nowrap;
}

.button-icon {
  font-size: 1em;
}

.loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 禁用状态 */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* 加载状态 */
.loading {
  cursor: wait;
}

/* 波纹容器 */
.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

/* 波纹效果 */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple-animation 0.6s linear;
}

/* 动画定义 */
@keyframes glow-pulse {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .size-medium {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
  
  .size-large {
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .mystical-button:hover {
    transform: none;
  }
  
  .mystical-button:active:not(.disabled):not(.loading) {
    transform: scale(0.98);
  }
}

/* 性能优化 */
@media (prefers-reduced-motion: reduce) {
  .mystical-button,
  .button-glow,
  .ripple {
    animation: none;
    transition: none;
  }
  
  .mystical-button:hover {
    transform: none;
  }
}
</style>
