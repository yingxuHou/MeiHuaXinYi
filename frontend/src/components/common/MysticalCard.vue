<template>
  <div 
    class="mystical-card"
    :class="[
      `size-${size}`,
      `variant-${variant}`,
      { 
        'hoverable': hoverable,
        'glowing': glowing,
        'animated': animated
      }
    ]"
    @click="handleClick"
  >
    <!-- 发光边框 -->
    <div class="glow-border" v-if="glowing"></div>
    
    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 头部 -->
      <div class="card-header" v-if="$slots.header || title">
        <slot name="header">
          <h3 class="card-title" v-if="title">{{ title }}</h3>
        </slot>
      </div>
      
      <!-- 图标区域 -->
      <div class="card-icon" v-if="$slots.icon || icon">
        <slot name="icon">
          <div class="icon-wrapper" v-if="icon">
            <i :class="icon"></i>
          </div>
        </slot>
      </div>
      
      <!-- 主要内容 -->
      <div class="card-body">
        <slot></slot>
      </div>
      
      <!-- 底部 -->
      <div class="card-footer" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
    
    <!-- 装饰元素 -->
    <div class="card-decorations" v-if="showDecorations">
      <div class="decoration decoration-1"></div>
      <div class="decoration decoration-2"></div>
      <div class="decoration decoration-3"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  icon: {
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
    validator: (value) => ['default', 'primary', 'secondary', 'dark'].includes(value)
  },
  hoverable: {
    type: Boolean,
    default: true
  },
  glowing: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: true
  },
  showDecorations: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['click'])

// 处理点击事件
const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event)
  }
}

// 计算样式类
const cardClasses = computed(() => {
  return {
    [`size-${props.size}`]: true,
    [`variant-${props.variant}`]: true,
    'hoverable': props.hoverable,
    'glowing': props.glowing,
    'animated': props.animated,
    'clickable': props.clickable
  }
})
</script>

<style scoped>
.mystical-card {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
}

/* 尺寸变体 */
.size-small {
  padding: 1rem;
  border-radius: 12px;
}

.size-medium {
  padding: 1.5rem;
  border-radius: 16px;
}

.size-large {
  padding: 2rem;
  border-radius: 20px;
}

/* 颜色变体 */
.variant-default {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.variant-primary {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
}

.variant-secondary {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.variant-dark {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}

/* 悬停效果 */
.hoverable:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.variant-primary.hoverable:hover {
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow: 0 20px 40px rgba(251, 191, 36, 0.1);
}

.variant-secondary.hoverable:hover {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.1);
}

/* 发光效果 */
.glow-border {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #fbbf24, #6366f1, #fbbf24);
  border-radius: inherit;
  z-index: -1;
  opacity: 0.7;
}

.glowing .glow-border {
  animation: glow-pulse 2s ease-in-out infinite alternate;
}

/* 卡片内容 */
.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  text-align: center;
}

.card-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.icon-wrapper i {
  font-size: 1.5rem;
  color: #1e3a8a;
}

.size-small .icon-wrapper {
  width: 48px;
  height: 48px;
}

.size-small .icon-wrapper i {
  font-size: 1.25rem;
}

.size-large .icon-wrapper {
  width: 80px;
  height: 80px;
}

.size-large .icon-wrapper i {
  font-size: 2rem;
}

.card-body {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  line-height: 1.6;
}

.card-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 装饰元素 */
.card-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(251, 191, 36, 0.6);
  border-radius: 50%;
}

.decoration-1 {
  top: 20%;
  left: 10%;
  animation: twinkle 2s ease-in-out infinite;
}

.decoration-2 {
  top: 70%;
  right: 15%;
  animation: twinkle 2s ease-in-out infinite 0.5s;
}

.decoration-3 {
  bottom: 30%;
  left: 20%;
  animation: twinkle 2s ease-in-out infinite 1s;
}

/* 点击效果 */
.clickable {
  cursor: pointer;
}

.clickable:active {
  transform: scale(0.98);
}

/* 动画效果 */
.animated {
  animation: fadeInUp 0.6s ease-out;
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

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .size-medium {
    padding: 1rem;
  }
  
  .size-large {
    padding: 1.5rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .hoverable:hover {
    transform: translateY(-2px) scale(1.01);
  }
}

/* 性能优化 */
@media (prefers-reduced-motion: reduce) {
  .animated,
  .glow-border,
  .decoration {
    animation: none;
  }
  
  .hoverable:hover {
    transform: none;
  }
}
</style>
