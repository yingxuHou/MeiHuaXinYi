<template>
  <div class="oriental-starry-background" :class="{ 'animated': animated }">
    <!-- 主背景渐变 -->
    <div class="oriental-background-gradient"></div>

    <!-- 东方神秘图案 -->
    <div class="oriental-mystic-pattern"></div>

    <!-- 星轨流动层 -->
    <div class="star-trail-layer" v-if="showStarTrails">
      <div
        v-for="trail in starTrails"
        :key="trail.id"
        class="star-trail"
        :style="trail.style"
      ></div>
    </div>

    <!-- 增强星空粒子层 */
    <div class="enhanced-stars-layer" v-if="showStars">
      <div
        v-for="star in enhancedStars"
        :key="star.id"
        class="enhanced-star"
        :class="star.type"
        :style="star.style"
      ></div>
    </div>

    <!-- 光影晕染层 */
    <div class="glow-aura-layer" v-if="showGlowAura">
      <div
        v-for="aura in glowAuras"
        :key="aura.id"
        class="glow-aura"
        :style="aura.style"
      ></div>
    </div>

    <!-- 东方装饰元素 */
    <div class="oriental-decoration-elements" v-if="showDecorations">
      <div
        v-for="decoration in orientalDecorations"
        :key="decoration.id"
        class="oriental-decoration-element"
        :class="decoration.type"
        :style="decoration.style"
      >
        <i :class="decoration.icon"></i>
      </div>
    </div>

    <!-- 内容插槽 -->
    <div class="content-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

// Props
const props = defineProps({
  animated: {
    type: Boolean,
    default: true
  },
  showStars: {
    type: Boolean,
    default: true
  },
  showDecorations: {
    type: Boolean,
    default: true
  },
  showStarTrails: {
    type: Boolean,
    default: true
  },
  showGlowAura: {
    type: Boolean,
    default: true
  },
  starCount: {
    type: Number,
    default: 80
  },
  decorationCount: {
    type: Number,
    default: 6
  },
  trailCount: {
    type: Number,
    default: 3
  },
  auraCount: {
    type: Number,
    default: 4
  }
})

// 响应式数据
const enhancedStars = ref([])
const orientalDecorations = ref([])
const starTrails = ref([])
const glowAuras = ref([])

// 东方装饰图标列表
const orientalDecorationIcons = [
  'fas fa-yin-yang',
  'fas fa-star',
  'fas fa-moon',
  'fas fa-mountain',
  'fas fa-sun',
  'fas fa-leaf',
  'fas fa-dragon',
  'fas fa-phoenix'
]

// 星星类型
const starTypes = ['normal', 'bright', 'golden', 'twinkling']

// 生成增强星星
const generateEnhancedStars = () => {
  enhancedStars.value = Array.from({ length: props.starCount }, (_, index) => {
    const type = starTypes[Math.floor(Math.random() * starTypes.length)]
    const size = type === 'bright' ? 1.5 + Math.random() * 0.5 : 0.5 + Math.random() * 1

    return {
      id: index,
      type: type,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 4}s`,
        animationDuration: `${3 + Math.random() * 3}s`,
        opacity: type === 'golden' ? 0.8 + Math.random() * 0.2 : 0.4 + Math.random() * 0.6,
        transform: `scale(${size})`,
        '--star-color': type === 'golden' ? '#FFD700' : type === 'bright' ? '#FFFFFF' : '#E0E0E0'
      }
    }
  })
}

// 生成星轨流动效果
const generateStarTrails = () => {
  starTrails.value = Array.from({ length: props.trailCount }, (_, index) => ({
    id: index,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${200 + Math.random() * 300}px`,
      height: `${2 + Math.random() * 2}px`,
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${8 + Math.random() * 4}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
      opacity: 0.3 + Math.random() * 0.4
    }
  }))
}

// 生成光影晕染效果
const generateGlowAuras = () => {
  glowAuras.value = Array.from({ length: props.auraCount }, (_, index) => ({
    id: index,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${100 + Math.random() * 200}px`,
      height: `${100 + Math.random() * 200}px`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${10 + Math.random() * 5}s`,
      opacity: 0.1 + Math.random() * 0.2
    }
  }))
}

// 生成东方装饰元素
const generateOrientalDecorations = () => {
  orientalDecorations.value = Array.from({ length: props.decorationCount }, (_, index) => {
    const isLarge = Math.random() > 0.7
    const type = isLarge ? 'large' : Math.random() > 0.5 ? 'medium' : 'small'

    return {
      id: index,
      type: type,
      icon: orientalDecorationIcons[Math.floor(Math.random() * orientalDecorationIcons.length)],
      style: {
        left: `${5 + Math.random() * 90}%`,
        top: `${5 + Math.random() * 90}%`,
        fontSize: type === 'large' ? `${3 + Math.random() * 1}rem` :
                  type === 'medium' ? `${2 + Math.random() * 1}rem` :
                  `${1.5 + Math.random() * 0.5}rem`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${8 + Math.random() * 6}s`,
        opacity: type === 'large' ? 0.1 + Math.random() * 0.1 :
                 type === 'medium' ? 0.15 + Math.random() * 0.1 :
                 0.2 + Math.random() * 0.1
      }
    }
  })
}

// 组件挂载时初始化
onMounted(() => {
  if (props.showStars) {
    generateEnhancedStars()
  }
  if (props.showDecorations) {
    generateOrientalDecorations()
  }
  if (props.showStarTrails) {
    generateStarTrails()
  }
  if (props.showGlowAura) {
    generateGlowAuras()
  }
})
</script>

<style scoped>
.oriental-starry-background {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

.oriental-background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2A2357 0%, #3A3070 50%, #4A3C90 100%);
  z-index: 1;
}

.oriental-mystic-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='0.03'%3E%3Cpath d='M40 40c0-15-12-27-27-27s-27 12-27 27 12 27 27 27 27-12 27-27zm0 0c0 15 12 27 27 27s27-12 27-27-12-27-27-27-27 12-27 27z'/%3E%3Cpath d='M40 20c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20z' fill='%23FFD700' fill-opacity='0.02'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  z-index: 2;
}

/* 星轨流动层 */
.star-trail-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

.star-trail {
  position: absolute;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 215, 0, 0.3) 50%,
    transparent 100%
  );
  border-radius: 1px;
}

.animated .star-trail {
  animation: star-trail-flow 12s linear infinite;
}

/* 增强星空粒子层 */
.enhanced-stars-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  pointer-events: none;
}

.enhanced-star {
  position: absolute;
  border-radius: 50%;
  background: var(--star-color, #ffffff);
}

.enhanced-star.normal {
  width: 2px;
  height: 2px;
  box-shadow: 0 0 4px var(--star-color, #ffffff);
}

.enhanced-star.bright {
  width: 3px;
  height: 3px;
  box-shadow: 0 0 8px var(--star-color, #ffffff);
}

.enhanced-star.golden {
  width: 2px;
  height: 2px;
  background: #FFD700;
  box-shadow: 0 0 10px #FFD700;
}

.enhanced-star.twinkling {
  width: 1px;
  height: 1px;
  box-shadow: 0 0 6px var(--star-color, #ffffff);
}

.animated .enhanced-star {
  animation: starry-twinkle 4s ease-in-out infinite;
}

.animated .enhanced-star.golden {
  animation: golden-twinkle 3s ease-in-out infinite;
}

/* 光影晕染层 */
.glow-aura-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.glow-aura {
  position: absolute;
  background: radial-gradient(circle,
    rgba(255, 215, 0, 0.1) 0%,
    rgba(106, 122, 255, 0.05) 50%,
    transparent 100%
  );
  border-radius: 50%;
  filter: blur(20px);
}

.animated .glow-aura {
  animation: aura-pulse 15s ease-in-out infinite;
}

/* 东方装饰元素 */
.oriental-decoration-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;
}

.oriental-decoration-element {
  position: absolute;
  color: rgba(255, 215, 0, 0.15);
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.2));
}

.oriental-decoration-element.large {
  color: rgba(255, 215, 0, 0.1);
}

.oriental-decoration-element.small {
  color: rgba(255, 215, 0, 0.2);
}

.animated .oriental-decoration-element {
  animation: oriental-float 12s ease-in-out infinite;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  min-height: 100vh;
}

/* 动画定义 */
@keyframes starry-twinkle {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  33% {
    opacity: 0.8;
    transform: scale(1.1);
  }
  66% {
    opacity: 0.6;
    transform: scale(0.9);
  }
}

@keyframes golden-twinkle {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
    box-shadow: 0 0 10px #FFD700;
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
    box-shadow: 0 0 20px #FFD700;
  }
}

@keyframes star-trail-flow {
  0% {
    transform: translateX(-100%) rotate(var(--trail-angle, 45deg));
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(200vw) rotate(var(--trail-angle, 45deg));
    opacity: 0;
  }
}

@keyframes aura-pulse {
  0%, 100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.2);
  }
}

@keyframes oriental-float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.15;
  }
  25% {
    transform: translateY(-12px) rotate(2deg);
    opacity: 0.25;
  }
  50% {
    transform: translateY(-8px) rotate(-1deg);
    opacity: 0.2;
  }
  75% {
    transform: translateY(-18px) rotate(1deg);
    opacity: 0.3;
  }
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .oriental-decoration-element {
    font-size: 2rem !important;
  }

  .glow-aura {
    filter: blur(15px);
  }
}

@media (max-width: 768px) {
  .oriental-decoration-element {
    font-size: 1.5rem !important;
  }

  .oriental-decoration-element.large {
    font-size: 2rem !important;
  }

  .enhanced-star.normal,
  .enhanced-star.golden,
  .enhanced-star.twinkling {
    width: 1px;
    height: 1px;
  }

  .enhanced-star.bright {
    width: 2px;
    height: 2px;
  }

  .glow-aura {
    filter: blur(10px);
  }

  .star-trail {
    height: 1px;
  }
}

@media (max-width: 480px) {
  .oriental-decoration-element {
    font-size: 1.2rem !important;
  }

  .oriental-decoration-element.large {
    font-size: 1.6rem !important;
  }

  .glow-aura {
    filter: blur(8px);
  }
}

/* 性能优化 */
@media (prefers-reduced-motion: reduce) {
  .animated .enhanced-star,
  .animated .oriental-decoration-element,
  .animated .star-trail,
  .animated .glow-aura {
    animation: none !important;
  }
}

/* 低性能设备优化 */
@media (max-width: 768px) and (max-height: 1024px) {
  .glow-aura-layer {
    display: none;
  }

  .star-trail-layer {
    opacity: 0.5;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .glow-aura {
    filter: blur(5px);
  }
}
</style>
