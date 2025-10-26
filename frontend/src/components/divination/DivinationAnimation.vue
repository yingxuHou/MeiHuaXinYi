<template>
  <div class="divination-animation-container">
    <!-- 占卜动画背景 -->
    <div class="animation-background">
      <!-- 星空背景效果 -->
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
    </div>

    <!-- 主要内容区域 -->
    <div class="animation-content">
      <!-- 标题 -->
      <div class="animation-title">
        <h2 class="title-text">正在为您占卜</h2>
        <p class="subtitle-text">诚心发问，智慧自现</p>
      </div>

      <!-- 掷钱币区域 -->
      <div class="coin-tossing-area">
        <!-- 钱币容器 -->
        <div class="coin-container">
          <div 
            v-for="(coin, index) in coins" 
            :key="index"
            class="coin"
            :class="{ 
              'tossing': coin.isTossing,
              'landed': coin.hasLanded,
              'yang': coin.result === 1,
              'yin': coin.result === 0,
              'flipped-to-yang': coin.hasLanded && coin.result === 1,
              'flipped-to-yin': coin.hasLanded && coin.result === 0
            }"
            :style="{ animationDelay: `${index * 0.5}s` }"
          >
            <!-- 钱币正面（阳） -->
            <div class="coin-face yang-face">
              <div class="yang-symbol">⚊</div>
              <div class="yang-text">阳</div>
            </div>
            
            <!-- 钱币背面（阴） -->
            <div class="coin-face yin-face">
              <div class="yin-symbol">⚋</div>
              <div class="yin-text">阴</div>
            </div>
          </div>
        </div>

        <!-- 掷钱币提示 -->
        <div class="tossing-hint">
          <div class="hint-text">{{ currentHint }}</div>
          <div class="progress-dots">
            <div 
              v-for="(coin, index) in coins" 
              :key="index"
              class="progress-dot"
              :class="{ 'active': coin.hasLanded, 'current': coin.isTossing }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 卦象生成区域 -->
      <div class="hexagram-generation" v-if="showHexagramGeneration">
        <div class="generation-title">
          <h3>卦象生成中</h3>
          <p>{{ generationStep }}</p>
        </div>

        <!-- 主卦展示 -->
        <div class="hexagram-display" v-if="showPrimaryHexagram">
          <div class="hexagram-title">主卦（本卦）</div>
          <div class="hexagram-lines">
            <div 
              v-for="(line, index) in primaryHexagram" 
              :key="index"
              class="hexagram-line"
              :class="{ 
                'yang': line === 1, 
                'yin': line === 0,
                'animated': true
              }"
              :style="{ animationDelay: `${(5 - index) * 0.2}s` }"
            >
              <div class="line-number">第{{ index + 1 }}爻</div>
            </div>
          </div>
        </div>

        <!-- 互卦展示 -->
        <div class="hexagram-display" v-if="showMutualHexagram">
          <div class="hexagram-title">互卦</div>
          <div class="hexagram-lines">
            <div 
              v-for="(line, index) in mutualHexagram" 
              :key="index"
              class="hexagram-line"
              :class="{ 
                'yang': line === 1, 
                'yin': line === 0,
                'animated': true
              }"
              :style="{ animationDelay: `${(5 - index) * 0.2 + 0.5}s` }"
            >
              <div class="line-number">第{{ index + 1 }}爻</div>
            </div>
          </div>
        </div>

        <!-- 变卦展示 -->
        <div class="hexagram-display" v-if="showChangeHexagram">
          <div class="hexagram-title">变卦</div>
          <div class="hexagram-lines">
            <div 
              v-for="(line, index) in changeHexagram" 
              :key="index"
              class="hexagram-line"
              :class="{ 
                'yang': line === 1, 
                'yin': line === 0,
                'changing': index === movingLineIndex - 1,
                'animated': true
              }"
              :style="{ animationDelay: `${(5 - index) * 0.2 + 1}s` }"
            >
              <div class="line-number">第{{ index + 1 }}爻</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 完成提示 -->
      <div class="completion-hint" v-if="isCompleted">
        <div class="completion-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="completion-text">占卜完成</div>
        <div class="completion-subtitle">正在为您解读卦象...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  duration: {
    type: Number,
    default: 8000 // 总动画时长（毫秒）
  },
  onComplete: {
    type: Function,
    default: () => {}
  },
  // 新增：接收真实的占卜结果数据
  divinationResult: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['complete', 'progress'])

// 响应式数据
const coins = reactive([
  { isTossing: false, hasLanded: false, result: null },
  { isTossing: false, hasLanded: false, result: null },
  { isTossing: false, hasLanded: false, result: null },
  { isTossing: false, hasLanded: false, result: null },
  { isTossing: false, hasLanded: false, result: null },
  { isTossing: false, hasLanded: false, result: null }
])

const currentHint = ref('准备掷钱币...')
const showHexagramGeneration = ref(false)
const generationStep = ref('')
const showPrimaryHexagram = ref(false)
const showMutualHexagram = ref(false)
const showChangeHexagram = ref(false)
const isCompleted = ref(false)

// 卦象数据
const primaryHexagram = ref([])
const mutualHexagram = ref([])
const changeHexagram = ref([])
const movingLineIndex = ref(0)

// 动画定时器
let animationTimer = null
let coinTimer = null

// 掷钱币动画
const tossCoin = (coinIndex) => {
  const coin = coins[coinIndex]
  coin.isTossing = true
  coin.hasLanded = false
  
  // 根据真实占卜结果确定掷币结果
  setTimeout(() => {
    if (props.divinationResult) {
      // 使用真实的占卜结果
      const result = props.divinationResult
      let hexagramLines = []
      
      // 优先使用 hexagrams.ben.lines
      if (result.hexagrams?.ben?.lines && Array.isArray(result.hexagrams.ben.lines)) {
        hexagramLines = result.hexagrams.ben.lines
      } else if (result.hexagram?.lines && Array.isArray(result.hexagram.lines)) {
        hexagramLines = result.hexagram.lines.map(l => l.type === 'yang' ? 1 : 0)
      }
      
      // 确保有6个爻的数据
      if (hexagramLines.length === 6 && coinIndex < 6) {
        coin.result = hexagramLines[coinIndex]
        console.log(`🎯 第${coinIndex + 1}次掷币使用真实结果:`, coin.result === 1 ? '阳' : '阴')
      } else {
        // 备用方案：随机生成
        coin.result = Math.floor(Math.random() * 2)
        console.warn(`⚠️ 第${coinIndex + 1}次掷币使用随机结果:`, coin.result === 1 ? '阳' : '阴')
      }
    } else {
      // 没有真实数据时，随机生成结果
      coin.result = Math.floor(Math.random() * 2)
      console.warn(`⚠️ 第${coinIndex + 1}次掷币使用随机结果（无真实数据）:`, coin.result === 1 ? '阳' : '阴')
    }
    
    coin.isTossing = false
    coin.hasLanded = true
    
    // 更新提示文本
    const resultText = coin.result === 1 ? '阳' : '阴'
    currentHint.value = `第${coinIndex + 1}爻：${resultText}`
    
    // 发送进度事件
    emit('progress', {
      step: coinIndex + 1,
      total: 6,
      result: coin.result,
      progress: ((coinIndex + 1) / 6) * 100
    })
  }, 1500) // 掷币动画持续1.5秒
}

// 生成卦象
const generateHexagrams = () => {
  console.log('🔍 开始生成卦象，真实数据:', props.divinationResult)
  
  if (props.divinationResult) {
    // 使用真实的占卜结果数据
    const result = props.divinationResult
    
    // 从真实结果中提取主卦
    if (result.hexagrams?.ben?.lines && Array.isArray(result.hexagrams.ben.lines)) {
      primaryHexagram.value = [...result.hexagrams.ben.lines]
      console.log('✅ 使用真实主卦数据:', primaryHexagram.value)
    } else if (result.hexagram?.lines && Array.isArray(result.hexagram.lines)) {
      primaryHexagram.value = result.hexagram.lines.map(l => l.type === 'yang' ? 1 : 0)
      console.log('✅ 使用适配后的主卦数据:', primaryHexagram.value)
    } else {
      // 备用方案：从掷币结果生成
      primaryHexagram.value = coins.map(coin => coin.result)
      console.warn('⚠️ 使用掷币结果生成主卦:', primaryHexagram.value)
    }
    
    // 从真实结果中提取动爻
    if (result.movingLine && typeof result.movingLine === 'number') {
      movingLineIndex.value = result.movingLine
      console.log('✅ 使用真实动爻位置:', movingLineIndex.value)
    } else {
      // 备用方案：随机生成
      movingLineIndex.value = Math.floor(Math.random() * 6) + 1
      console.warn('⚠️ 使用随机动爻位置:', movingLineIndex.value)
    }
    
    // 从真实结果中提取变卦
    if (result.hexagrams?.bian?.lines && Array.isArray(result.hexagrams.bian.lines)) {
      changeHexagram.value = [...result.hexagrams.bian.lines]
      console.log('✅ 使用真实变卦数据:', changeHexagram.value)
    } else {
      // 备用方案：根据动爻生成变卦
      changeHexagram.value = [...primaryHexagram.value]
      changeHexagram.value[movingLineIndex.value - 1] = changeHexagram.value[movingLineIndex.value - 1] === 1 ? 0 : 1
      console.warn('⚠️ 根据动爻生成变卦:', changeHexagram.value)
    }
    
    // 从真实结果中提取互卦
    if (result.hexagrams?.hu?.lines && Array.isArray(result.hexagrams.hu.lines)) {
      mutualHexagram.value = [...result.hexagrams.hu.lines]
      console.log('✅ 使用真实互卦数据:', mutualHexagram.value)
    } else {
      // 备用方案：根据梅花易数规则生成互卦
      mutualHexagram.value = [
        primaryHexagram.value[1], // 第2爻
        primaryHexagram.value[2], // 第3爻
        primaryHexagram.value[3], // 第4爻
        primaryHexagram.value[2], // 第3爻
        primaryHexagram.value[3], // 第4爻
        primaryHexagram.value[4]  // 第5爻
      ]
      console.warn('⚠️ 根据规则生成互卦:', mutualHexagram.value)
    }
  } else {
    // 没有真实数据时，使用掷币结果生成
    console.warn('⚠️ 没有真实数据，使用掷币结果生成卦象')
    primaryHexagram.value = coins.map(coin => coin.result)
    
    // 计算动爻（简化算法）
    const movingLine = Math.floor(Math.random() * 6) + 1
    movingLineIndex.value = movingLine
    
    // 生成变卦
    changeHexagram.value = [...primaryHexagram.value]
    changeHexagram.value[movingLine - 1] = changeHexagram.value[movingLine - 1] === 1 ? 0 : 1
    
    // 生成互卦（根据梅花易数规则）
    mutualHexagram.value = [
      primaryHexagram.value[1], // 第2爻
      primaryHexagram.value[2], // 第3爻
      primaryHexagram.value[3], // 第4爻
      primaryHexagram.value[2], // 第3爻
      primaryHexagram.value[3], // 第4爻
      primaryHexagram.value[4]  // 第5爻
    ]
  }
  
  console.log('🎯 最终卦象数据:', {
    primary: primaryHexagram.value,
    mutual: mutualHexagram.value,
    change: changeHexagram.value,
    movingLine: movingLineIndex.value
  })
}

// 开始占卜动画
const startDivinationAnimation = () => {
  let currentCoinIndex = 0
  
  // 开始掷钱币
  const startTossing = () => {
    if (currentCoinIndex < 6) {
      tossCoin(currentCoinIndex)
      currentCoinIndex++
      
      // 设置下一个掷币的延迟
      coinTimer = setTimeout(startTossing, 2000)
    } else {
      // 所有掷币完成，开始生成卦象
      setTimeout(() => {
        showHexagramGeneration.value = true
        generateHexagrams()
        showHexagramSequence()
      }, 1000)
    }
  }
  
  startTossing()
}

// 显示卦象序列
const showHexagramSequence = () => {
  // 显示主卦
  setTimeout(() => {
    generationStep.value = '生成主卦...'
    showPrimaryHexagram.value = true
  }, 500)
  
  // 显示互卦
  setTimeout(() => {
    generationStep.value = '生成互卦...'
    showMutualHexagram.value = true
  }, 2000)
  
  // 显示变卦
  setTimeout(() => {
    generationStep.value = '生成变卦...'
    showChangeHexagram.value = true
  }, 3500)
  
  // 完成动画
  setTimeout(() => {
    generationStep.value = '卦象生成完成'
    isCompleted.value = true
    
    // 发送完成事件
    setTimeout(() => {
      emit('complete', {
        primaryHexagram: primaryHexagram.value,
        mutualHexagram: mutualHexagram.value,
        changeHexagram: changeHexagram.value,
        movingLine: movingLineIndex.value
      })
      
      if (props.onComplete) {
        props.onComplete({
          primaryHexagram: primaryHexagram.value,
          mutualHexagram: mutualHexagram.value,
          changeHexagram: changeHexagram.value,
          movingLine: movingLineIndex.value
        })
      }
    }, 1000)
  }, 5000)
}

// 组件挂载时开始动画
onMounted(() => {
  setTimeout(() => {
    startDivinationAnimation()
  }, 500)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (animationTimer) {
    clearTimeout(animationTimer)
  }
  if (coinTimer) {
    clearTimeout(coinTimer)
  }
})
</script>

<style scoped>
.divination-animation-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
}

.animation-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.stars, .stars2, .stars3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 160px 30px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: sparkle 3s linear infinite;
}

.stars2 {
  animation-delay: 1s;
  background-size: 150px 75px;
}

.stars3 {
  animation-delay: 2s;
  background-size: 100px 50px;
}

@keyframes sparkle {
  from { transform: translateY(0px); }
  to { transform: translateY(-100px); }
}

.animation-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.animation-title {
  text-align: center;
  margin-bottom: 3rem;
}

.title-text {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.subtitle-text {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.coin-tossing-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
}

.coin-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.coin {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(145deg, #fbbf24, #f59e0b);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  transform-style: preserve-3d;
}

.coin.tossing {
  animation: coin-flip 1.5s ease-in-out;
}

.coin.landed {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
}

/* 翻转后的状态 - 阳（黄色） */
.coin.flipped-to-yang {
  background: linear-gradient(145deg, #fbbf24, #f59e0b);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
}

/* 翻转后的状态 - 阴（蓝色） */
.coin.flipped-to-yin {
  background: linear-gradient(145deg, #1e3a8a, #1e40af);
  box-shadow: 0 0 20px rgba(30, 58, 138, 0.8);
}

@keyframes coin-flip {
  0% { 
    transform: rotateY(0deg) scale(1); 
  }
  25% { 
    transform: rotateY(90deg) scale(1.1); 
  }
  50% { 
    transform: rotateY(180deg) scale(1.2); 
  }
  75% { 
    transform: rotateY(270deg) scale(1.1); 
  }
  100% { 
    transform: rotateY(360deg) scale(1); 
  }
}

/* 根据不同结果显示不同的正面 */
.coin.flipped-to-yang .yang-face {
  z-index: 2;
  opacity: 1;
}

.coin.flipped-to-yang .yin-face {
  z-index: 1;
  opacity: 0;
}

.coin.flipped-to-yin .yin-face {
  z-index: 2;
  opacity: 1;
  transform: rotateY(0deg) !important; /* 取消旋转，显示正面 */
}

.coin.flipped-to-yin .yang-face {
  z-index: 1;
  opacity: 0;
}

.coin-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  transition: opacity 0.3s ease;
}

.yang-face {
  background: linear-gradient(145deg, #fbbf24, #f59e0b);
  color: #1e3a8a;
}

.yin-face {
  background: linear-gradient(145deg, #1e3a8a, #1e40af);
  color: #fbbf24;
  /* 初始状态设置为背面，但在 flipped-to-yin 时会被覆盖为 0deg */
  transform: rotateY(180deg);
}

.yang-symbol, .yin-symbol {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.2rem;
}

.yang-text, .yin-text {
  font-size: 0.7rem;
  font-weight: 600;
}

.tossing-hint {
  text-align: center;
}

.hint-text {
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 1rem;
  font-weight: 500;
}

.progress-dots {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.progress-dot.active {
  background: #fbbf24;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
}

.progress-dot.current {
  background: #6366f1;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.8);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.hexagram-generation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 600px;
}

.generation-title {
  text-align: center;
}

.generation-title h3 {
  font-size: 1.8rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.generation-title p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.hexagram-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
}

.hexagram-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fbbf24;
  margin-bottom: 0.5rem;
}

.hexagram-lines {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
  align-items: center;
}

.hexagram-line {
  position: relative;
  width: 80px;
  height: 8px;
  border-radius: 4px;
  transition: all 0.5s ease;
  opacity: 0;
  transform: translateX(-20px);
}

.hexagram-line.animated {
  animation: line-appear 0.8s ease-out forwards;
}

.hexagram-line.yang {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.hexagram-line.yin {
  background: linear-gradient(90deg, 
    #1e3a8a 0%, #1e3a8a 45%,
    transparent 45%, transparent 55%,
    #1e3a8a 55%, #1e3a8a 100%);
  box-shadow: 0 0 10px rgba(30, 58, 138, 0.5);
}

.hexagram-line.changing {
  /* 移除强制背景色，让阴阳线样式生效 */
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.8);
  animation: changing-glow 2s ease-in-out infinite alternate;
}

/* 动爻的阳线样式 - 金色实线 */
.hexagram-line.changing:not(.yin) {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.8);
}

/* 动爻的阴线样式 - 金色断线 */
.hexagram-line.changing.yin {
  background: linear-gradient(90deg, 
    #fbbf24 0%, #fbbf24 45%,
    transparent 45%, transparent 55%,
    #fbbf24 55%, #fbbf24 100%);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.8);
}

@keyframes line-appear {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes changing-glow {
  0% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
  100% { box-shadow: 0 0 20px rgba(239, 68, 68, 1); }
}

.line-number {
  position: absolute;
  right: -25px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.completion-hint {
  text-align: center;
  margin-top: 2rem;
}

.completion-icon {
  font-size: 3rem;
  color: #22c55e;
  margin-bottom: 1rem;
  animation: success-pulse 2s ease-in-out infinite;
}

.completion-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.completion-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

@keyframes success-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title-text {
    font-size: 2rem;
  }
  
  .subtitle-text {
    font-size: 1rem;
  }
  
  .coin {
    width: 50px;
    height: 50px;
  }
  
  .coin-container {
    gap: 0.5rem;
  }
  
  .hexagram-line {
    width: 60px;
    height: 6px;
  }
  
  .line-number {
    right: -20px;
    font-size: 0.7rem;
  }
}
</style>
