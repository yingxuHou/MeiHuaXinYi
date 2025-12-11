<template>
  <StarryBackground :animated="true" :show-decorations="true">
    <div class="result-container">
      <!-- 返回按钮 -->
      <div class="back-button">
        <MysticalButton
          variant="ghost"
          size="small"
          left-icon="fas fa-arrow-left"
          @click="goBack"
        >
          返回
        </MysticalButton>
      </div>

      <!-- 加载状态 -->
      <Loading
        v-if="loading"
        type="hexagram"
        text="正在获取占卜结果..."
        :show-progress="false"
      />

      <!-- 结果内容 -->
      <div v-else-if="result" class="result-content">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">占卜结果</h1>
          <p class="result-time">{{ formatDate(result.timestamp) }}</p>
        </div>

        <!-- 问题回顾 -->
        <MysticalCard variant="secondary" size="medium" class="question-card">
          <template #header>
            <h3 class="card-title">
              <i class="fas fa-question-circle"></i>
              您的问题
            </h3>
          </template>
          <p class="question-text">{{ result.question }}</p>
        </MysticalCard>

        <!-- 卦象展示 -->
        <MysticalCard variant="primary" size="large" :glowing="true" class="hexagram-card">
          <template #header>
            <h3 class="card-title">
              <i class="fas fa-yin-yang"></i>
              {{ result.hexagrams?.ben?.name || result.hexagram?.name || '占卜结果' }}
            </h3>
          </template>
          
          <div class="hexagram-display">
            <!-- 三个卦象并排展示 -->
            <div class="hexagrams-container">
              <!-- 主卦 -->
              <div class="hexagram-item">
                <div class="hexagram-title">主卦（本卦）</div>
                <div class="hexagram-visual">
                  <div class="hexagram-lines">
                    <div 
                      v-for="(line, index) in (result.hexagrams?.ben?.lines || result.hexagram?.lines?.map(l => l.type === 'yang' ? 1 : 0) || [1,1,1,1,1,1])" 
                      :key="index"
                      class="hexagram-line"
                      :class="{ 
                        'broken': line === 0, 
                        'changing': false,
                        'animated': animated 
                      }"
                      :style="{ animationDelay: `${(6 - index) * 0.2}s` }"
                    >
                      <div class="line-number">{{ index + 1 }}</div>
                    </div>
                  </div>
                  
                  <!-- 卦象信息 -->
                  <div class="hexagram-info">
                    <div class="trigram-info">
                      <div class="trigram">
                        <span class="trigram-label">上卦</span>
                        <span class="trigram-name">{{ result.hexagrams?.ben?.upperGua?.name || result.hexagram?.upperTrigram || '乾' }}</span>
                      </div>
                      <div class="trigram">
                        <span class="trigram-label">下卦</span>
                        <span class="trigram-name">{{ result.hexagrams?.ben?.lowerGua?.name || result.hexagram?.lowerTrigram || '乾' }}</span>
                      </div>
                    </div>
                    <div class="hexagram-number">第{{ result.hexagrams?.ben?.id || result.hexagram?.number || 1 }}卦</div>
                  </div>
                </div>
              </div>

              <!-- 互卦 -->
              <div class="hexagram-item" v-if="result.hexagrams?.hu">
                <div class="hexagram-title">互卦</div>
                <div class="hexagram-visual">
                  <div class="hexagram-lines">
                    <div 
                      v-for="(line, index) in (result.hexagrams?.hu?.lines || [])" 
                      :key="index"
                      class="hexagram-line"
                      :class="{ 
                        'broken': line === 0, 
                        'animated': animated 
                      }"
                      :style="{ animationDelay: `${(6 - index) * 0.2 + 0.5}s` }"
                    >
                      <div class="line-number">{{ index + 1 }}</div>
                    </div>
                  </div>
                  
                  <div class="hexagram-info">
                    <div class="trigram-info">
                      <div class="trigram">
                        <span class="trigram-label">上卦</span>
                        <span class="trigram-name">{{ result.hexagrams?.hu?.upperGua?.name || '乾' }}</span>
                      </div>
                      <div class="trigram">
                        <span class="trigram-label">下卦</span>
                        <span class="trigram-name">{{ result.hexagrams?.hu?.lowerGua?.name || '乾' }}</span>
                      </div>
                    </div>
                    <div class="hexagram-number">第{{ result.hexagrams?.hu?.id || 1 }}卦</div>
                  </div>
                </div>
              </div>

              <!-- 变卦 -->
              <div class="hexagram-item" v-if="result.hexagrams?.bian">
                <div class="hexagram-title">变卦</div>
                <div class="hexagram-visual">
                  <div class="hexagram-lines">
                    <div 
                      v-for="(line, index) in (result.hexagrams?.bian?.lines || [])" 
                      :key="index"
                      class="hexagram-line"
                      :class="{ 
                        'broken': line === 0, 
                        'changing': index === (result.movingLine - 1),
                        'animated': animated 
                      }"
                      :style="{ animationDelay: `${(6 - index) * 0.2 + 1}s` }"
                    >
                      <div class="line-number">{{ index + 1 }}</div>
                    </div>
                  </div>
                  
                  <div class="hexagram-info">
                    <div class="trigram-info">
                      <div class="trigram">
                        <span class="trigram-label">上卦</span>
                        <span class="trigram-name">{{ result.hexagrams?.bian?.upperGua?.name || '乾' }}</span>
                      </div>
                      <div class="trigram">
                        <span class="trigram-label">下卦</span>
                        <span class="trigram-name">{{ result.hexagrams?.bian?.lowerGua?.name || '乾' }}</span>
                      </div>
                    </div>
                    <div class="hexagram-number">第{{ result.hexagrams?.bian?.id || 1 }}卦</div>
                    <div class="moving-line-info" v-if="result.movingLine">
                      <span class="moving-line-label">动爻：</span>
                      <span class="moving-line-value">第{{ result.movingLine }}爻</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MysticalCard>

        <!-- 解读内容 -->
        <div class="interpretation-section">
          <!-- 总体解读 -->
          <MysticalCard variant="default" size="medium" class="interpretation-card">
            <template #header>
              <h3 class="card-title">
                <i class="fas fa-eye"></i>
                总体解读
              </h3>
            </template>
            <p class="interpretation-text">{{ result.interpretation?.summary || result.interpretation?.overall || '正在为您解读卦象...' }}</p>
          </MysticalCard>

          <!-- 建议指导 -->
          <MysticalCard variant="default" size="medium" class="interpretation-card">
            <template #header>
              <h3 class="card-title">
                <i class="fas fa-lightbulb"></i>
                建议指导
              </h3>
            </template>
            <p class="interpretation-text">{{ result.interpretation?.advice || '请耐心等待专业解读...' }}</p>
          </MysticalCard>

          <!-- 时间建议 -->
          <MysticalCard variant="default" size="medium" class="interpretation-card">
            <template #header>
              <h3 class="card-title">
                <i class="fas fa-clock"></i>
                时间建议
              </h3>
            </template>
            <p class="interpretation-text">{{ result.interpretation?.timing || result.analysis?.timing || result.wuxingAnalysis?.timing || '时机分析中...' }}</p>
          </MysticalCard>

          <!-- 五行分析 -->
          <MysticalCard variant="default" size="medium" class="interpretation-card">
            <template #header>
              <h3 class="card-title">
                <i class="fas fa-star"></i>
                五行分析
              </h3>
            </template>
            <div class="wuxing-analysis">
              <div class="wuxing-item">
                <span class="wuxing-label">本卦五行：</span>
                <span class="wuxing-value">{{ result.wuxingAnalysis?.ben || result.analysis?.wuxing?.ben || '待分析' }}</span>
              </div>
              <div class="wuxing-item">
                <span class="wuxing-label">运势：</span>
                <span class="wuxing-value">{{ result.wuxingAnalysis?.fortune || result.analysis?.wuxing?.fortune || result.analysis?.fortune || '中平' }}</span>
              </div>
            </div>
          </MysticalCard>

          <!-- AI解读 -->
          <MysticalCard v-if="result.aiInterpretation" variant="primary" size="large" class="ai-interpretation-card" :glowing="true">
            <template #header>
              <h3 class="card-title">
                <i class="fas fa-robot"></i>
                AI智能解读
              </h3>
            </template>
            <div class="ai-interpretation-content">
              <div 
                class="ai-interpretation-text" 
                v-html="renderMarkdown(result.aiInterpretation.content || result.aiInterpretation.summary || 'AI解读内容')"
              ></div>
              <div v-if="result.aiInterpretation.confidence" class="ai-confidence">
                <span class="confidence-label">解读可信度：</span>
                <span class="confidence-value">{{ Math.round(result.aiInterpretation.confidence * 100) }}%</span>
              </div>
            </div>
          </MysticalCard>

          <!-- 如果没有AI解读，显示提示 -->
          <MysticalCard v-else-if="!result.aiInterpretation" variant="secondary" size="medium" class="ai-prompt-card">
            <div class="ai-prompt-content">
              <p class="ai-prompt-text">
                <i class="fas fa-info-circle"></i>
                AI解读将在占卜完成后自动生成...
              </p>
            </div>
          </MysticalCard>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <MysticalButton
            v-if="!result.aiInterpretation"
            variant="primary"
            size="medium"
            left-icon="fas fa-robot"
            @click="generateAIInterpretation"
            :loading="generatingAI"
          >
            {{ generatingAI ? '正在生成AI解读...' : '生成AI解读' }}
          </MysticalButton>
          
          <MysticalButton
            variant="outline"
            size="medium"
            left-icon="fas fa-share-alt"
            @click="shareResult"
          >
            分享结果
          </MysticalButton>
          
          <MysticalButton
            variant="secondary"
            size="medium"
            :left-icon="result.isFavorite ? 'fas fa-heart' : 'far fa-heart'"
            @click="toggleFavorite"
          >
            {{ result.isFavorite ? '已收藏' : '收藏' }}
          </MysticalButton>
          
          <MysticalButton
            variant="secondary"
            size="medium"
            left-icon="fas fa-redo"
            @click="newDivination"
          >
            重新占卜
          </MysticalButton>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else class="error-state">
        <MysticalCard variant="default" size="large">
          <div class="error-content">
            <i class="fas fa-exclamation-circle error-icon"></i>
            <h3 class="error-title">获取结果失败</h3>
            <p class="error-message">无法获取占卜结果，请稍后重试</p>
            
            <!-- 调试信息（开发环境显示） -->
            <div v-if="isDev" class="debug-info">
              <details>
                <summary>调试信息</summary>
                <pre>{{ JSON.stringify({
                  resultId: resultId,
                  hasCurrentResult: !!divinationStore.currentResult,
                  hasLastResult: !!divinationStore.lastResult,
                  userLoggedIn: userStore.isLoggedIn
                }, null, 2) }}</pre>
              </details>
            </div>
            
            <div class="error-actions">
              <MysticalButton
                variant="primary"
                size="medium"
                left-icon="fas fa-refresh"
                @click="loadResult"
              >
                重新加载
              </MysticalButton>
              <MysticalButton
                variant="outline"
                size="medium"
                left-icon="fas fa-arrow-left"
                @click="goBack"
              >
                返回
              </MysticalButton>
              <MysticalButton
                variant="secondary"
                size="medium"
                left-icon="fas fa-home"
                @click="router.push('/')"
              >
                返回首页
              </MysticalButton>
            </div>
          </div>
        </MysticalCard>
      </div>

      <!-- 分享对话框 -->
      <el-dialog
        v-model="showShareDialog"
        title="分享占卜结果"
        width="90%"
        :max-width="400"
        center
      >
        <div class="share-content">
          <div class="share-options">
            <div class="share-option" @click="shareToWeChat">
              <i class="fab fa-weixin"></i>
              <span>微信</span>
            </div>
            <div class="share-option" @click="shareToWeibo">
              <i class="fab fa-weibo"></i>
              <span>微博</span>
            </div>
            <div class="share-option" @click="copyShareLink">
              <i class="fas fa-link"></i>
              <span>复制链接</span>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </StarryBackground>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useDivinationStore } from '@/stores/divination'
import { useAppStore } from '@/stores/app'
import StarryBackground from '@/components/common/StarryBackground.vue'
import MysticalCard from '@/components/common/MysticalCard.vue'
import MysticalButton from '@/components/common/MysticalButton.vue'
import Loading from '@/components/common/Loading.vue'
import { formatDate, copyToClipboard } from '@/utils'
import { renderMarkdown } from '@/utils/markdown'

// 路由和状态管理
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const divinationStore = useDivinationStore()
const appStore = useAppStore()

// 响应式数据
const loading = ref(true)
const result = ref(null)
const animated = ref(false)
const showShareDialog = ref(false)
const generatingAI = ref(false)

// 计算属性
const resultId = computed(() => route.params.id)
const isDev = import.meta.env.DEV

// 方法
const goBack = () => {
  router.go(-1)
}

const loadResult = async () => {
  try {
    loading.value = true
    
    let response
    
    // ✅ 检查是否是临时ID（test模式下不保存到数据库）
    if (resultId.value && resultId.value.startsWith('temp_')) {
      console.log('🔍 临时ID，直接使用store中的结果')
      // 临时ID或没有ID，直接使用store中的结果
      response = { 
        success: true, 
        data: divinationStore.currentResult || divinationStore.lastResult 
      }
    } else if (resultId.value) {
      // 从API获取指定结果（真实数据库记录）
      console.log('🔍 尝试获取指定结果:', resultId.value)
      response = await divinationStore.getDivinationResult(resultId.value)
    } else {
      // 获取当前结果
      console.log('🔍 获取当前结果')
      response = { 
        success: true, 
        data: divinationStore.currentResult || divinationStore.lastResult 
      }
    }
    
    if (response.success && response.data) {
      result.value = response.data
      console.log('✅ 成功加载占卜结果:', result.value)
      
      // 延迟启动动画
      setTimeout(() => {
        animated.value = true
      }, 500)
    } else {
      throw new Error('未找到占卜结果')
    }
  } catch (error) {
    console.error('获取占卜结果失败:', error)
    ElMessage.error('获取占卜结果失败')
  } finally {
    loading.value = false
  }
}

const toggleFavorite = async () => {
  try {
    if (!result.value) return
    
    await divinationStore.toggleFavorite(result.value.id)
    result.value.isFavorite = !result.value.isFavorite
    
    ElMessage.success(result.value.isFavorite ? '已添加到收藏' : '已取消收藏')
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

const shareResult = () => {
  showShareDialog.value = true
}

const shareToWeChat = async () => {
  try {
    const shareData = await divinationStore.shareResult(result.value.id, 'wechat')
    ElMessage.success('分享链接已生成')
    showShareDialog.value = false
  } catch (error) {
    ElMessage.error('分享失败')
  }
}

const shareToWeibo = async () => {
  try {
    const shareData = await divinationStore.shareResult(result.value.id, 'weibo')
    ElMessage.success('分享链接已生成')
    showShareDialog.value = false
  } catch (error) {
    ElMessage.error('分享失败')
  }
}

const copyShareLink = async () => {
  try {
    const shareData = await divinationStore.shareResult(result.value.id, 'link')
    const success = await copyToClipboard(shareData.data.shareUrl)
    
    if (success) {
      ElMessage.success('分享链接已复制到剪贴板')
    } else {
      ElMessage.error('复制失败，请手动复制')
    }
    
    showShareDialog.value = false
  } catch (error) {
    ElMessage.error('生成分享链接失败')
  }
}

const newDivination = () => {
  if (userStore.freeCount <= 0) {
    ElMessage.warning('今日免费次数已用完')
    return
  }
  
  router.push('/divination/question')
}

// 组件挂载时初始化
onMounted(() => {
  appStore.setCurrentRoute('divination-result')
  
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 加载结果
  loadResult()
})

// AI解读相关方法
const generateAIInterpretation = async () => {
  try {
    // 🔐 检查认证状态
    if (!userStore.isLoggedIn || !userStore.token) {
      console.error('❌ 用户未登录或token无效:', {
        isLoggedIn: userStore.isLoggedIn,
        hasToken: !!userStore.token,
        userInfo: userStore.userInfo
      })
      ElMessage.error('请先登录后再使用AI解读功能')
      // 跳转到登录页面
      router.push('/login')
      return
    }

    if (!result.value) {
      ElMessage.error('没有可解读的占卜结果')
      return
    }

    generatingAI.value = true
    ElMessage.info('正在生成AI解读...')

    // 🔍 添加详细的调试日志
    console.log('🔍 AI解读调试信息:', {
      hasResult: !!result.value,
      resultId: result.value.id,
      question: result.value.question,
      hexagrams: result.value.hexagrams,
      userStore: {
        isLoggedIn: userStore.isLoggedIn,
        hasToken: !!userStore.token,
        tokenPreview: userStore.token ? userStore.token.substring(0, 50) + '...' : 'null',
        userId: userStore.userInfo?.id
      }
    })

    // ✅ 传递完整的占卜数据到后端，特别是对于临时ID
    const options = {
      divinationData: result.value, // 传递完整的占卜结果
      question: result.value.question || '您的问题是什么？'
    }

    console.log('📤 发送占卜数据到后端生成AI解读:', {
      id: result.value.id,
      isTempId: result.value.id.startsWith('div_') || result.value.id.startsWith('temp_') || result.value.id.startsWith('dev_'),
      question: result.value.question,
      mainHexagram: result.value.hexagrams?.ben?.name,
      options: options
    })

    const response = await divinationStore.generateAIInterpretation(result.value.id, options)

    if (response.success) {
      // 更新结果中的AI解读
      result.value.aiInterpretation = response.data.aiInterpretation
      ElMessage.success(response.message || 'AI解读生成成功')
    } else {
      console.error('❌ AI解读生成失败:', response)
      ElMessage.error(response.message || 'AI解读生成失败')
    }
  } catch (error) {
    console.error('生成AI解读失败:', error)
    console.error('详细错误信息:', {
      message: error.message,
      stack: error.stack,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
      details: error.details
    })

    // 🔍 处理特定错误
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限使用AI解读功能')
    } else if (error.response?.status === 404 && error.response?.data?.code === 'MISSING_DIVINATION_DATA') {
      ElMessage.error('占卜数据不完整，请重新占卜')
    } else {
      ElMessage.error(error.message || '生成AI解读失败，请稍后重试')
    }
  } finally {
    generatingAI.value = false
  }
}
</script>

<style scoped>
.result-container {
  min-height: 100vh;
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.back-button {
  position: absolute;
  top: 2rem;
  left: 1rem;
  z-index: 10;
}

.result-content {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  text-align: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.result-time {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.question-card .question-text {
  font-size: 1rem;
  color: #ffffff;
  line-height: 1.6;
  margin: 0;
}

.hexagram-card {
  text-align: center;
}

.hexagram-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.hexagrams-container {
  display: flex;
  gap: 1.5rem;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  flex-wrap: nowrap;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.hexagram-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  flex: 1;
  width: calc(33.333% - 1rem);
  padding: 1rem;
  background: transparent;
  border: none;
  transition: all 0.3s ease;
}

.hexagram-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fbbf24;
  margin-bottom: 0.5rem;
  text-align: center;
  padding: 0.5rem 1rem;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.hexagram-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.hexagram-lines {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.25rem;
}

.hexagram-line {
  position: relative;
  width: 80px;
  height: 6px;
  background: #1e3a8a;
  border-radius: 3px;
  transition: all 0.5s ease;
}

.hexagram-line.animated {
  animation: line-glow 2s ease-in-out infinite alternate;
}

.hexagram-line.broken {
  background: linear-gradient(to right,
    #1e3a8a 0%, #1e3a8a 45%,
    transparent 45%, transparent 55%,
    #1e3a8a 55%, #1e3a8a 100%);
}

.hexagram-line.changing {
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.8);
  /* 移除强制背景色，让阴阳线样式生效 */
  /* background: #fbbf24; */
}

/* 动爻的阳线样式 - 金色实线 */
.hexagram-line.changing:not(.broken) {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.8);
}

/* 动爻的阴线样式 - 金色断线 */
.hexagram-line.changing.broken {
  background: linear-gradient(90deg, 
    #fbbf24 0%, #fbbf24 45%,
    transparent 45%, transparent 55%,
    #fbbf24 55%, #fbbf24 100%);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.8);
}

.line-number {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: rgba(30, 58, 138, 0.7);
  font-weight: 500;
}

.hexagram-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.trigram-info {
  display: flex;
  gap: 2rem;
}

.trigram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.trigram-label {
  font-size: 0.75rem;
  color: rgba(30, 58, 138, 0.7);
}

.trigram-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e3a8a;
}

.hexagram-number {
  font-size: 0.875rem;
  color: rgba(30, 58, 138, 0.8);
  font-weight: 500;
}

.moving-line-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.moving-line-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.moving-line-value {
  font-size: 0.875rem;
  color: #ef4444;
  font-weight: 600;
}

.interpretation-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.interpretation-text {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
}

.wuxing-analysis {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.wuxing-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wuxing-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  min-width: 80px;
}

.wuxing-value {
  font-size: 0.875rem;
  color: #fbbf24;
  font-weight: 500;
}

.ai-interpretation-card {
  border: 2px solid rgba(251, 191, 36, 0.3);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(30, 58, 138, 0.1));
}

.ai-interpretation-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ai-interpretation-text {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.8;
  margin: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border-left: 4px solid #fbbf24;
}

/* Markdown 样式 */
.ai-interpretation-text :deep(p) {
  margin: 0.75rem 0;
  line-height: 1.8;
}

.ai-interpretation-text :deep(h1),
.ai-interpretation-text :deep(h2),
.ai-interpretation-text :deep(h3),
.ai-interpretation-text :deep(h4),
.ai-interpretation-text :deep(h5),
.ai-interpretation-text :deep(h6) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 1);
}

.ai-interpretation-text :deep(h1) {
  font-size: 1.5rem;
}

.ai-interpretation-text :deep(h2) {
  font-size: 1.3rem;
}

.ai-interpretation-text :deep(h3) {
  font-size: 1.15rem;
}

.ai-interpretation-text :deep(h4) {
  font-size: 1.05rem;
}

.ai-interpretation-text :deep(ul),
.ai-interpretation-text :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.ai-interpretation-text :deep(li) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.ai-interpretation-text :deep(strong) {
  font-weight: 600;
  color: rgba(251, 191, 36, 1);
}

.ai-interpretation-text :deep(em) {
  font-style: italic;
}

.ai-interpretation-text :deep(code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #fbbf24;
}

.ai-interpretation-text :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1rem 0;
}

.ai-interpretation-text :deep(pre code) {
  background: transparent;
  padding: 0;
}

.ai-interpretation-text :deep(blockquote) {
  border-left: 4px solid #fbbf24;
  padding-left: 1rem;
  margin: 1rem 0;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

.ai-interpretation-text :deep(a) {
  color: #fbbf24;
  text-decoration: underline;
  transition: color 0.3s;
}

.ai-interpretation-text :deep(a:hover) {
  color: #fcd34d;
}

.ai-interpretation-text :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 1.5rem 0;
}

.ai-confidence {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.confidence-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.confidence-value {
  font-size: 0.875rem;
  color: #fbbf24;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.error-content {
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.error-message {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
}

.debug-info {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.debug-info pre {
  color: #e4e4e7;
  font-size: 0.875rem;
  margin: 0;
  white-space: pre-wrap;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.share-content {
  padding: 1rem 0;
}

.share-options {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  max-width: 80px;
}

.share-option:hover {
  background: rgba(251, 191, 36, 0.2);
  transform: translateY(-2px);
}

.share-option i {
  font-size: 1.5rem;
  color: #fbbf24;
}

.share-option span {
  font-size: 0.875rem;
  color: #ffffff;
}

/* 动画定义 */
@keyframes line-glow {
  0% {
    box-shadow: 0 0 5px rgba(30, 58, 138, 0.5);
  }
  100% {
    box-shadow: 0 0 15px rgba(30, 58, 138, 0.8);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .result-container {
    padding: 1rem 0.5rem;
  }

  .back-button {
    top: 1rem;
    left: 0.5rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .hexagrams-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .hexagram-item {
    width: 100%;
  }

  .hexagram-line {
    width: 60px;
    height: 5px;
  }

  .trigram-info {
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .share-options {
    flex-direction: column;
  }

  .share-option {
    max-width: none;
    flex-direction: row;
    justify-content: flex-start;
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .hexagrams-container {
    gap: 1rem;
    padding: 1.5rem;
  }

  .hexagram-item {
    width: calc(33.333% - 0.67rem);
  }
}
</style>
