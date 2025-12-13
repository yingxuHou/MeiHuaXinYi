import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  performDivination,
  getDivinationById,
  getDivinationHistory,
  getDivinationStats,
  rateDivination,
  divinationAPI
} from '@/api/divination'
import {
  adaptDivinationResult,
  adaptDivinationHistory,
  adaptDivinationStats,
  adaptDivinationParams,
  adaptErrorMessage
} from '@/utils/dataAdapter'

export const useDivinationStore = defineStore('divination', () => {
  // 状态
  const currentQuestion = ref('')
  const currentDivination = ref(null)
  const divinationHistory = ref([])
  const isProcessing = ref(false)
  const processingStep = ref('')
  const processingProgress = ref(0)
  
  // 占卜结果状态
  const currentResult = ref(null)
  const lastResult = ref(null)
  
  // 历史记录状态
  const historyLoading = ref(false)
  const historyPage = ref(1)
  const historyTotal = ref(0)
  const historyPageSize = ref(10)
  
  // 计算属性
  const hasCurrentDivination = computed(() => !!currentDivination.value)
  const hasHistory = computed(() => divinationHistory.value.length > 0)
  const canLoadMoreHistory = computed(() => 
    divinationHistory.value.length < historyTotal.value
  )
  
  // 操作方法
  const setCurrentQuestion = (question) => {
    currentQuestion.value = question
  }
  
  const setProcessing = (processing, step = '', progress = 0) => {
    isProcessing.value = processing
    processingStep.value = step
    processingProgress.value = progress
  }
  
  const updateProcessingProgress = (progress, step = '') => {
    processingProgress.value = progress
    if (step) {
      processingStep.value = step
    }
  }
  
  // 开始占卜 - 使用真实API
  const startDivination = async (divinationData) => {
    try {
      // 兼容旧版本调用方式
      if (typeof divinationData === 'string') {
        divinationData = { question: divinationData, method: 'time' }
      }

      setCurrentQuestion(divinationData.question)
      setProcessing(true, '正在生成卦象...', 10)

      // 适配参数格式
      const apiParams = adaptDivinationParams(divinationData)

      // 🔍 添加调试日志
      console.log('🔧 适配后的API参数:', JSON.stringify(apiParams, null, 2));

      // 直接调用真实API，移除模拟进度条
      const response = await performDivination(apiParams)

      if (response.success) {
        // 适配数据格式
        const adaptedData = adaptDivinationResult(response.data)

        currentDivination.value = adaptedData
        currentResult.value = adaptedData
        lastResult.value = adaptedData

        // 刷新历史记录
        await loadHistory(1)

        setProcessing(false)
        return { success: true, data: adaptedData }
      } else {
        throw new Error(response.message || '占卜失败')
      }
    } catch (error) {
      setProcessing(false)
      console.error('占卜错误:', error)
      const errorMessage = adaptErrorMessage(error)
      throw new Error(errorMessage)
    }
  }
  
  // 获取占卜结果 - 使用新API
  const getDivinationResult = async (id) => {
    try {
      if (currentResult.value && currentResult.value.id === id) {
        return { success: true, data: currentResult.value }
      }

      // 从历史记录中查找
      const historyResult = divinationHistory.value.find(item => item.id === id)
      if (historyResult) {
        currentResult.value = historyResult
        return { success: true, data: historyResult }
      }

      // 调用新版API
      const response = await getDivinationById(id)

      if (response.success) {
        // 适配数据格式
        const adaptedData = adaptDivinationResult(response.data)
        currentResult.value = adaptedData
        return { success: true, data: adaptedData }
      } else {
        throw new Error(response.message || '获取占卜结果失败')
      }
    } catch (error) {
      console.error('获取占卜结果错误:', error)
      const errorMessage = adaptErrorMessage(error)
      throw new Error(errorMessage)
    }
  }
  
  // 获取历史记录 - 使用新API
  const getHistory = async (page = 1, pageSize = 10) => {
    try {
      historyLoading.value = true

      // 调用新版API
      const response = await getDivinationHistory({
        page,
        limit: pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })

      if (response.success) {
        // 适配数据格式
        const adaptedData = adaptDivinationHistory(response.data)

        if (page === 1) {
          divinationHistory.value = adaptedData.items
        } else {
          divinationHistory.value.push(...adaptedData.items)
        }

        historyTotal.value = adaptedData.total
        historyPage.value = page

        return {
          success: true,
          data: adaptedData
        }
      } else {
        throw new Error(response.message || '获取历史记录失败')
      }
    } catch (error) {
      console.error('获取历史记录错误:', error)
      const errorMessage = adaptErrorMessage(error)
      throw new Error(errorMessage)
    } finally {
      historyLoading.value = false
    }
  }

  // 加载历史记录的便捷方法
  const loadHistory = async (page = 1) => {
    return await getHistory(page, 10)
  }
  
  // 删除历史记录
  const deleteHistoryItem = async (id) => {
    try {
      // TODO: 替换为实际API调用
      const response = await divinationAPI.deleteHistoryItem(id)
      
      // 模拟删除成功
      const mockResponse = { success: true }
      
      if (mockResponse.success) {
        const index = divinationHistory.value.findIndex(item => item.id === id)
        if (index > -1) {
          divinationHistory.value.splice(index, 1)
          historyTotal.value -= 1
        }
        
        return mockResponse
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      console.error('删除历史记录错误:', error)
      throw error
    }
  }
  
  // 收藏/取消收藏
  const toggleFavorite = async (id) => {
    try {
      // TODO: 替换为实际API调用
      const response = await divinationAPI.toggleFavorite(id)
      
      // 模拟切换收藏状态
      const item = divinationHistory.value.find(item => item.id === id)
      if (item) {
        item.isFavorite = !item.isFavorite
      }
      
      if (currentResult.value && currentResult.value.id === id) {
        currentResult.value.isFavorite = !currentResult.value.isFavorite
      }
      
      return { success: true }
    } catch (error) {
      console.error('切换收藏状态错误:', error)
      throw error
    }
  }
  
  // 分享占卜结果
  const shareResult = async (id, platform = 'link') => {
    try {
      // TODO: 替换为实际API调用
      const response = await divinationAPI.shareResult(id, platform)
      
      // 模拟分享链接生成
      const mockResponse = {
        success: true,
        data: {
          shareUrl: `https://meihua.example.com/share/${id}`,
          qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
          title: '梅花心易占卜结果',
          description: '查看我的占卜结果'
        }
      }
      
      return mockResponse
    } catch (error) {
      console.error('分享错误:', error)
      throw error
    }
  }
  
  // 清除当前占卜
  const clearCurrentDivination = () => {
    currentDivination.value = null
    currentResult.value = null
    currentQuestion.value = ''
    setProcessing(false)
  }
  
  // 重置状态
  const resetState = () => {
    clearCurrentDivination()
    divinationHistory.value = []
    historyPage.value = 1
    historyTotal.value = 0
    lastResult.value = null
  }

  // 评价占卜结果 - 新增功能
  const rateResult = async (id, ratingData) => {
    try {
      const response = await rateDivination(id, ratingData)

      if (response.success) {
        // 更新本地数据
        if (currentResult.value && currentResult.value.id === id) {
          currentResult.value.userRating = response.data.rating
        }

        // 更新历史记录中的评价
        const historyItem = divinationHistory.value.find(item => item.id === id)
        if (historyItem) {
          historyItem.userRating = response.data.rating
        }

        return response
      } else {
        throw new Error(response.message || '评价提交失败')
      }
    } catch (error) {
      console.error('评价结果错误:', error)
      const errorMessage = adaptErrorMessage(error)
      throw new Error(errorMessage)
    }
  }

  // 获取占卜统计 - 新增功能
  const getStats = async () => {
    try {
      const response = await getDivinationStats()

      if (response.success) {
        // 适配数据格式
        const adaptedStats = adaptDivinationStats(response.data)
        return {
          success: true,
          data: adaptedStats
        }
      } else {
        throw new Error(response.message || '获取统计失败')
      }
    } catch (error) {
      console.error('获取统计错误:', error)
      const errorMessage = adaptErrorMessage(error)
      throw new Error(errorMessage)
    }
  }

  // 生成AI解读 - 新增功能
  const generateAIInterpretation = async (id, options = {}) => {
    try {
      const response = await divinationAPI.generateAIInterpretationForResult(id, options)

      if (response.success) {
        // 更新当前结果中的AI解读
        if (currentResult.value && currentResult.value.id === id) {
          currentResult.value.aiInterpretation = response.data
        }

        // 更新历史记录中的AI解读
        const historyItem = divinationHistory.value.find(item => item.id === id)
        if (historyItem) {
          historyItem.aiInterpretation = response.data
        }

        return response
      } else {
        throw new Error(response.message || '生成AI解读失败')
      }
    } catch (error) {
      console.error('生成AI解读错误:', error)
      const errorMessage = adaptErrorMessage(error)
      throw new Error(errorMessage)
    }
  }

  // 检查AI服务状态 - 新增功能
  const checkAIStatus = async () => {
    try {
      const response = await divinationAPI.checkAIStatus()
      return response
    } catch (error) {
      console.error('检查AI服务状态错误:', error)
      throw error
    }
  }

  // 获取解读模板 - 新增功能
  const getInterpretationTemplates = async () => {
    try {
      const response = await divinationAPI.getInterpretationTemplates()
      return response
    } catch (error) {
      console.error('获取解读模板错误:', error)
      throw error
    }
  }
  
  return {
    // 状态
    currentQuestion,
    currentDivination,
    divinationHistory,
    isProcessing,
    processingStep,
    processingProgress,
    currentResult,
    lastResult,
    historyLoading,
    historyPage,
    historyTotal,
    historyPageSize,
    
    // 计算属性
    hasCurrentDivination,
    hasHistory,
    canLoadMoreHistory,
    
    // 方法
    setCurrentQuestion,
    setProcessing,
    updateProcessingProgress,
    startDivination,
    getDivinationResult,
    getHistory,
    loadHistory,
    deleteHistoryItem,
    toggleFavorite,
    shareResult,
    clearCurrentDivination,
    resetState,
    rateResult,
    getStats,
    generateAIInterpretation,
    checkAIStatus,
    getInterpretationTemplates
  }
})
