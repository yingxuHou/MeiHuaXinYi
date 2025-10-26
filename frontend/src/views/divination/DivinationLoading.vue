<template>
  <StarryBackground :animated="true" :show-decorations="true">
    <div class="divination-loading-container">
      <!-- 取消按钮 - 左上角 -->
      <div class="cancel-button-top-left">
        <button
          class="cancel-btn"
          @click="cancelDivination"
          title="取消占卜"
        >
          <i class="fas fa-times"></i>
          <span>取消</span>
        </button>
      </div>
      
      <!-- 占卜动画组件 - 只在有结果后显示 -->
      <DivinationAnimation 
        v-if="divinationResult"
        :duration="8000"
        :divination-result="divinationResult"
        @complete="handleAnimationComplete"
        @progress="handleAnimationProgress"
      />
      
      <!-- 加载提示（当没有结果时显示） -->
      <div v-else class="loading-placeholder">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin fa-3x"></i>
        </div>
        <div class="loading-text">正在计算卦象...</div>
        <div class="loading-hint">请稍候，系统正在为您分析问题</div>
      </div>
    </div>
  </StarryBackground>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useDivinationStore } from '@/stores/divination'
import { useAppStore } from '@/stores/app'
import StarryBackground from '@/components/common/StarryBackground.vue'
import DivinationAnimation from '@/components/divination/DivinationAnimation.vue'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()
const divinationStore = useDivinationStore()
const appStore = useAppStore()

// 响应式数据
const progress = ref(0)
const currentStep = ref('正在连接宇宙能量...')
const stepDescription = ref('请稍候，我们正在为您准备占卜环境')
const currentTipIndex = ref(0)
const showHexagram = ref(false)
const hexagramLines = ref([])
const divinationResult = ref(null)

// 占卜步骤
const steps = [
  {
    step: '正在连接宇宙能量...',
    description: '建立与宇宙能量的连接',
    progress: 10
  },
  {
    step: '分析问题本质...',
    description: '深入理解您问题的核心',
    progress: 25
  },
  {
    step: '计算时空信息...',
    description: '根据当前时间计算卦象',
    progress: 40
  },
  {
    step: '生成神秘卦象...',
    description: '运用梅花易数算法生成卦象',
    progress: 60
  },
  {
    step: 'AI智能解读中...',
    description: '人工智能正在解读卦象含义',
    progress: 80
  },
  {
    step: '完成占卜分析...',
    description: '整理占卜结果，即将为您呈现',
    progress: 100
  }
]

// 提示文本
const tips = ref([
  '梅花易数源于宋代邵雍，是一门古老的占卜学问',
  '诚心发问，方能得到准确的指引',
  '卦象的变化蕴含着事物发展的规律',
  '每一个卦象都有其独特的寓意和指导',
  '占卜结果仅供参考，最终决策还需理性思考',
  '保持平和的心态，接受宇宙的智慧指引'
])

// 定时器
let progressTimer = null
let tipTimer = null
let stepTimer = null

// 初始化卦象线条
const initHexagramLines = () => {
  hexagramLines.value = Array.from({ length: 6 }, (_, index) => ({
    broken: Math.random() > 0.5,
    changing: Math.random() > 0.8,
    active: false
  }))
}

// 激活卦象线条
const activateHexagramLines = () => {
  hexagramLines.value.forEach((line, index) => {
    setTimeout(() => {
      line.active = true
    }, index * 200)
  })
}

// 动画事件处理
const handleAnimationProgress = (progressData) => {
  console.log('🎯 动画进度:', progressData)
  // 可以在这里更新进度显示
}

const handleAnimationComplete = async (hexagramData) => {
  console.log('🎯 动画完成，卦象数据:', hexagramData)
  
  try {
    // 动画完成后直接跳转到结果页面
    setTimeout(() => {
      const resultId = String(divinationResult.value?.id || divinationResult.value?._id || 'temp_' + Date.now())
      console.log('🎯 准备跳转到结果页面:', resultId)
      router.push(`/divination/result/${resultId}`)
    }, 1000)
  } catch (error) {
    console.error('❌ 跳转失败:', error)
    ElMessage.error('跳转失败，请重试')
    router.push('/divination/question')
  }
}

// 开始占卜流程
const startDivination = async () => {
  try {
    // 检查是否有问题
    if (!divinationStore.currentQuestion) {
      ElMessage.error('请先输入问题')
      router.push('/divination/question')
      return
    }

    console.log('🎯 开始获取占卜结果...')
    
    // 调用占卜API获取结果
    const result = await divinationStore.startDivination(divinationStore.currentQuestion)
    
    if (result.success) {
      // 保存占卜结果
      divinationResult.value = result.data
      console.log('✅ 占卜结果获取成功:', divinationResult.value)
      
      // 验证数据结构
      if (divinationResult.value.hexagrams?.ben?.lines) {
        console.log('✅ 主卦数据:', divinationResult.value.hexagrams.ben.lines)
      } else {
        console.warn('⚠️ 主卦数据缺失')
      }
      
      if (divinationResult.value.hexagrams?.hu?.lines) {
        console.log('✅ 互卦数据:', divinationResult.value.hexagrams.hu.lines)
      } else {
        console.warn('⚠️ 互卦数据缺失')
      }
      
      if (divinationResult.value.hexagrams?.bian?.lines) {
        console.log('✅ 变卦数据:', divinationResult.value.hexagrams.bian.lines)
      } else {
        console.warn('⚠️ 变卦数据缺失')
      }
      
      if (divinationResult.value.movingLine) {
        console.log('✅ 动爻位置:', divinationResult.value.movingLine)
      } else {
        console.warn('⚠️ 动爻位置缺失')
      }
    } else {
      throw new Error('占卜失败')
    }

  } catch (error) {
    console.error('❌ 占卜过程出错:', error)
    ElMessage.error('占卜失败，请重试')
    router.push('/divination/question')
  }
}

// 完成占卜
const completeDivination = () => {
  currentStep.value = '占卜完成！'
  stepDescription.value = '正在为您跳转到结果页面...'
}

// 取消占卜
const cancelDivination = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消当前占卜吗？已使用的免费次数将不会恢复。',
      '取消占卜',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '继续占卜',
        type: 'warning'
      }
    )
    
    // 清理定时器
    if (progressTimer) clearInterval(progressTimer)
    if (tipTimer) clearInterval(tipTimer)
    if (stepTimer) clearInterval(stepTimer)
    
    // 清除当前占卜状态
    divinationStore.clearCurrentDivination()
    
    // 跳转回首页
    router.push('/')
    
  } catch (error) {
    // 用户取消了取消操作，继续占卜
  }
}

// 组件挂载时初始化
onMounted(() => {
  appStore.setCurrentRoute('divination-loading')
  
  // 调试信息
  console.log('🔍 DivinationLoading 调试信息:', {
    isLoggedIn: userStore.isLoggedIn,
    userInfo: userStore.userInfo,
    freeCount: userStore.freeCount,
    currentQuestion: divinationStore.currentQuestion,
    token: userStore.token ? '存在' : '不存在'
  })
  
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    console.warn('❌ 用户未登录，重定向到登录页')
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  // 检查是否有问题
  if (!divinationStore.currentQuestion) {
    console.warn('❌ 没有当前问题，重定向到问题输入页')
    ElMessage.warning('请先输入问题')
    router.push('/divination/question')
    return
  }

  // 检查免费次数
  if (userStore.freeCount <= 0) {
    console.warn('❌ 免费次数不足')
    ElMessage.warning('免费次数已用完')
    router.push('/divination/question')
    return
  }

  console.log('✅ 所有检查通过，开始获取占卜结果')
  // 开始获取占卜结果（异步，不阻塞渲染）
  startDivination().catch(error => {
    console.error('占卜过程出错:', error)
    ElMessage.error('占卜失败，请重试')
    router.push('/divination/question')
  })
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer)
  if (tipTimer) clearInterval(tipTimer)
  if (stepTimer) clearInterval(stepTimer)
})
</script>

<style scoped>
.divination-loading-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.loading-content {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

/* 太极图动画 */
.taiji-container {
  margin-bottom: 3rem;
}

.taiji-symbol {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(90deg, #ffffff 50%, #000000 50%);
  position: relative;
  margin: 0 auto;
  animation: rotate 3s linear infinite;
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.3);
}

.taiji-inner::before,
.taiji-inner::after {
  content: '';
  position: absolute;
  width: 50%;
  height: 50%;
  border-radius: 50%;
}

.taiji-inner::before {
  top: 0;
  left: 25%;
  background: #000000;
  box-shadow: 0 60px 0 #ffffff;
}

.taiji-inner::after {
  top: 15px;
  left: 37.5%;
  width: 25%;
  height: 25%;
  background: #ffffff;
  box-shadow: 0 60px 0 #000000;
}

/* 进度条 */
.progress-section {
  margin-bottom: 2rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.progress-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #fbbf24;
}

/* 步骤信息 */
.step-section {
  margin-bottom: 2rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.step-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 卦象生成 */
.hexagram-section {
  margin-bottom: 2rem;
}

.hexagram-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #fbbf24;
  margin-bottom: 1rem;
}

.hexagram-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.hexagram-line {
  width: 80px;
  height: 6px;
  background: rgba(251, 191, 36, 0.3);
  border-radius: 3px;
  transition: all 0.5s ease;
  animation: hexagram-pulse 2s ease-in-out infinite;
}

.hexagram-line.active {
  background: #fbbf24;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
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

.hexagram-line.changing {
  animation: hexagram-change 1s ease-in-out infinite alternate;
}

/* 提示文本 */
.tips-section {
  margin-bottom: 2rem;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tip-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 400px;
  line-height: 1.5;
}

.tip-text i {
  color: #fbbf24;
  font-size: 1rem;
}

/* 取消按钮 - 左上角 */
.cancel-button-top-left {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

.cancel-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.cancel-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

.cancel-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.cancel-btn i {
  font-size: 12px;
}

.cancel-btn span {
  font-size: 14px;
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

@keyframes hexagram-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes hexagram-change {
  0% { 
    background: #fbbf24;
    box-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
  }
  100% { 
    background: #6366f1;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.6);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .divination-loading-container {
    padding: 1rem 0.5rem;
  }

  .taiji-symbol {
    width: 100px;
    height: 100px;
  }

  .step-title {
    font-size: 1.25rem;
  }

  .step-description {
    font-size: 0.875rem;
  }

  .hexagram-line {
    width: 60px;
    height: 5px;
  }

  .tip-text {
    font-size: 0.8rem;
  }

  /* 移动端取消按钮调整 */
  .cancel-button-top-left {
    top: 15px;
    left: 15px;
  }

  .cancel-btn {
    padding: 10px 12px;
    font-size: 13px;
  }

  .cancel-btn span {
    font-size: 13px;
  }
}

/* 加载占位符样式 */
.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  min-height: 50vh;
}

.loading-spinner {
  color: #fbbf24;
  animation: spin 2s linear infinite;
}

.loading-text {
  font-size: 1.2rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.loading-hint {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 性能优化 */
@media (prefers-reduced-motion: reduce) {
  .taiji-symbol,
  .hexagram-line {
    animation: none;
  }
}
</style>
