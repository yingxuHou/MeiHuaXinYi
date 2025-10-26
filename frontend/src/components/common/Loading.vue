<template>
  <div class="loading-container" :class="{ 'fullscreen': fullscreen }">
    <!-- 背景遮罩 -->
    <div class="loading-overlay" v-if="overlay"></div>
    
    <!-- 加载内容 -->
    <div class="loading-content">
      <!-- 太极图加载器 -->
      <div class="taiji-loader" v-if="type === 'taiji'">
        <div class="all">
          <div class="left box"></div>
          <div class="right box"></div>
          <div class="black">
            <div class="inner_white"></div>
          </div>
          <div class="white">
            <div class="inner_black"></div>
          </div>
        </div>
      </div>
      
      <!-- 卦象加载器 -->
      <div class="hexagram-loader" v-if="type === 'hexagram'">
        <div class="hexagram-lines">
          <div 
            v-for="(line, index) in hexagramLines" 
            :key="index"
            class="hexagram-line"
            :class="{ 'broken': line.broken, 'active': line.active }"
            :style="{ animationDelay: `${index * 0.2}s` }"
          ></div>
        </div>
      </div>
      
      <!-- 星空加载器 -->
      <div class="stars-loader" v-if="type === 'stars'">
        <div class="stars-container">
          <div 
            v-for="star in loadingStars" 
            :key="star.id"
            class="loading-star"
            :style="star.style"
          ></div>
        </div>
      </div>
      
      <!-- 圆形加载器 */
      <div class="circle-loader" v-else>
        <div class="circle-spinner"></div>
      </div>
      
      <!-- 进度条 -->
      <div class="progress-container" v-if="showProgress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>
      
      <!-- 加载文本 -->
      <div class="loading-text" v-if="text">
        <div class="text-content">{{ currentText }}</div>
        <div class="text-dots" v-if="showDots">
          <span class="dot" v-for="n in 3" :key="n"></span>
        </div>
      </div>
      
      <!-- 提示文本轮播 -->
      <div class="tips-container" v-if="tips.length > 0">
        <transition name="fade" mode="out-in">
          <div class="tip-text" :key="currentTipIndex">
            {{ tips[currentTipIndex] }}
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Props
const props = defineProps({
  type: {
    type: String,
    default: 'circle',
    validator: (value) => ['circle', 'taiji', 'hexagram', 'stars'].includes(value)
  },
  text: {
    type: String,
    default: '加载中...'
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  overlay: {
    type: Boolean,
    default: true
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  },
  showDots: {
    type: Boolean,
    default: true
  },
  tips: {
    type: Array,
    default: () => [
      '正在连接宇宙能量...',
      '解析时空信息...',
      '生成神秘卦象...',
      'AI智能解读中...',
      '即将为您揭示答案...'
    ]
  }
})

// 响应式数据
const currentText = ref(props.text)
const currentTipIndex = ref(0)
const hexagramLines = ref([])
const loadingStars = ref([])

// 定时器
let tipTimer = null
let textTimer = null

// 初始化卦象线条
const initHexagramLines = () => {
  hexagramLines.value = Array.from({ length: 6 }, (_, index) => ({
    broken: Math.random() > 0.5,
    active: false
  }))
  
  // 依次激活线条
  hexagramLines.value.forEach((line, index) => {
    setTimeout(() => {
      line.active = true
    }, index * 300)
  })
}

// 初始化加载星星
const initLoadingStars = () => {
  loadingStars.value = Array.from({ length: 12 }, (_, index) => ({
    id: index,
    style: {
      left: `${(index * 30) % 360}deg`,
      animationDelay: `${index * 0.1}s`
    }
  }))
}

// 提示文本轮播
const startTipRotation = () => {
  if (props.tips.length > 1) {
    tipTimer = setInterval(() => {
      currentTipIndex.value = (currentTipIndex.value + 1) % props.tips.length
    }, 3000)
  }
}

// 文本动画
const startTextAnimation = () => {
  if (props.showDots) {
    let dotCount = 0
    textTimer = setInterval(() => {
      dotCount = (dotCount + 1) % 4
      currentText.value = props.text + '.'.repeat(dotCount)
    }, 500)
  }
}

// 监听文本变化
watch(() => props.text, (newText) => {
  currentText.value = newText
})

// 组件挂载
onMounted(() => {
  if (props.type === 'hexagram') {
    initHexagramLines()
  }
  if (props.type === 'stars') {
    initLoadingStars()
  }
  
  startTipRotation()
  startTextAnimation()
})

// 组件卸载
onUnmounted(() => {
  if (tipTimer) {
    clearInterval(tipTimer)
  }
  if (textTimer) {
    clearInterval(textTimer)
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  position: relative;
}

.loading-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1;
}

.loading-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* 太极图加载器 */
.taiji-loader {
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.all {
  border: 2px solid black;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  position: relative;
  animation: action 5s linear infinite;
}

.box {
  width: 50%;
  height: 100%;
}

.left {
  background: #fff;
}

.right {
  background: #000;
}

.black {
  background: #000;
  width: 50%;
  height: 50%;
  border-radius: 50%;
  box-sizing: border-box;
  position: absolute;
  left: 50%;
  margin-left: -25%;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inner_white {
  width: 25%;
  height: 25%;
  border-radius: 50%;
  background: #fff;
}

.white {
  background: #fff;
  width: 50%;
  height: 50%;
  border-radius: 50%;
  box-sizing: border-box;
  position: absolute;
  left: 50%;
  bottom: 0;
  margin-left: -25%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inner_black {
  width: 25%;
  height: 25%;
  border-radius: 50%;
  background: #000;
}

@keyframes action {
  0% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(-90deg);
  }
  50% {
    transform: rotate(-180deg);
  }
  75% {
    transform: rotate(-270deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}

/* 卦象加载器 */
.hexagram-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.hexagram-lines {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hexagram-line {
  width: 60px;
  height: 4px;
  background: rgba(251, 191, 36, 0.3);
  border-radius: 2px;
  transition: all 0.3s ease;
  animation: hexagram-pulse 1.5s ease-in-out infinite;
}

.hexagram-line.active {
  background: #fbbf24;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.hexagram-line.broken {
  background: linear-gradient(to right, 
    transparent 0%, transparent 45%, 
    rgba(251, 191, 36, 0.3) 45%, rgba(251, 191, 36, 0.3) 55%, 
    transparent 55%, transparent 100%);
}

.hexagram-line.broken.active {
  background: linear-gradient(to right, 
    transparent 0%, transparent 45%, 
    #fbbf24 45%, #fbbf24 55%, 
    transparent 55%, transparent 100%);
}

/* 星空加载器 */
.stars-loader {
  width: 80px;
  height: 80px;
  position: relative;
}

.stars-container {
  width: 100%;
  height: 100%;
  position: relative;
  animation: rotate 3s linear infinite;
}

.loading-star {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fbbf24;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform-origin: 0 40px;
  animation: star-twinkle 1s ease-in-out infinite;
}

/* 圆形加载器 */
.circle-loader {
  width: 60px;
  height: 60px;
}

.circle-spinner {
  width: 100%;
  height: 100%;
  border: 4px solid rgba(251, 191, 36, 0.3);
  border-top: 4px solid #fbbf24;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 进度条 */
.progress-container {
  width: 200px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.progress-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* 加载文本 */
.loading-text {
  text-align: center;
  color: #ffffff;
}

.text-content {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.text-dots {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.dot {
  width: 6px;
  height: 6px;
  background: #fbbf24;
  border-radius: 50%;
  animation: dot-bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

/* 提示文本 */
.tips-container {
  text-align: center;
  min-height: 1.5rem;
}

.tip-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 动画定义 */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes hexagram-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes star-twinkle {
  0%, 100% { 
    opacity: 0.3; 
    transform: scale(0.8); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2); 
  }
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .taiji-loader {
    width: 60px;
    height: 60px;
  }
  
  .stars-loader {
    width: 60px;
    height: 60px;
  }
  
  .circle-loader {
    width: 50px;
    height: 50px;
  }
  
  .hexagram-line {
    width: 50px;
    height: 3px;
  }
  
  .progress-container {
    width: 150px;
  }
  
  .text-content {
    font-size: 0.875rem;
  }
}

/* 性能优化 */
@media (prefers-reduced-motion: reduce) {
  .all,
  .stars-container,
  .circle-spinner,
  .hexagram-line,
  .loading-star,
  .dot {
    animation: none;
  }
}
</style>
