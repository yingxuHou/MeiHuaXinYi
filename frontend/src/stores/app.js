import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const isLoading = ref(false)
  const loadingText = ref('加载中...')
  const theme = ref('dark') // 主题：dark/light
  const language = ref('zh-CN') // 语言
  const isOnline = ref(navigator.onLine)
  const deviceInfo = ref({
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  })
  
  // 导航状态
  const currentRoute = ref('')
  const navigationHistory = ref([])
  const showMobileNav = ref(true)
  
  // 应用配置
  const appConfig = ref({
    version: '1.0.0',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    enableDevMode: import.meta.env.DEV,
    maxRetryAttempts: 3,
    requestTimeout: 10000
  })
  
  // 错误状态
  const errors = ref([])
  const lastError = ref(null)
  
  // 计算属性
  const isMobile = computed(() => deviceInfo.value.isMobile)
  const isTablet = computed(() => deviceInfo.value.screenWidth >= 768 && deviceInfo.value.screenWidth < 1024)
  const isDesktop = computed(() => deviceInfo.value.screenWidth >= 1024)
  const hasErrors = computed(() => errors.value.length > 0)
  
  // 操作方法
  const setLoading = (loading, text = '加载中...') => {
    isLoading.value = loading
    loadingText.value = text
  }
  
  const setTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    
    // 更新HTML类名
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  const setLanguage = (lang) => {
    language.value = lang
    localStorage.setItem('language', lang)
  }
  
  const updateDeviceInfo = () => {
    deviceInfo.value = {
      ...deviceInfo.value,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    }
  }
  
  const setOnlineStatus = (status) => {
    isOnline.value = status
  }
  
  const setCurrentRoute = (route) => {
    currentRoute.value = route
    
    // 添加到导航历史
    if (navigationHistory.value[navigationHistory.value.length - 1] !== route) {
      navigationHistory.value.push(route)
      
      // 限制历史记录长度
      if (navigationHistory.value.length > 10) {
        navigationHistory.value.shift()
      }
    }
  }
  
  const toggleMobileNav = () => {
    showMobileNav.value = !showMobileNav.value
  }
  
  const setMobileNavVisibility = (visible) => {
    showMobileNav.value = visible
  }
  
  // 错误处理
  const addError = (error) => {
    const errorObj = {
      id: Date.now(),
      message: error.message || '未知错误',
      type: error.type || 'error',
      timestamp: new Date().toISOString(),
      stack: error.stack
    }
    
    errors.value.push(errorObj)
    lastError.value = errorObj
    
    // 限制错误记录数量
    if (errors.value.length > 50) {
      errors.value.shift()
    }
    
    console.error('应用错误:', errorObj)
  }
  
  const removeError = (errorId) => {
    const index = errors.value.findIndex(error => error.id === errorId)
    if (index > -1) {
      errors.value.splice(index, 1)
    }
  }
  
  const clearErrors = () => {
    errors.value = []
    lastError.value = null
  }
  
  // 网络状态监听
  const initNetworkListeners = () => {
    window.addEventListener('online', () => setOnlineStatus(true))
    window.addEventListener('offline', () => setOnlineStatus(false))
  }
  
  // 窗口大小监听
  const initResizeListener = () => {
    window.addEventListener('resize', updateDeviceInfo)
  }
  
  // 全局错误处理
  const initErrorHandlers = () => {
    // 捕获未处理的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      addError({
        message: event.reason?.message || '未处理的Promise错误',
        type: 'promise',
        stack: event.reason?.stack
      })
    })
    
    // 捕获JavaScript错误
    window.addEventListener('error', (event) => {
      addError({
        message: event.message || 'JavaScript错误',
        type: 'javascript',
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })
  }
  
  // 初始化应用
  const initializeApp = () => {
    // 恢复主题设置
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    
    // 恢复语言设置
    const savedLanguage = localStorage.getItem('language') || 'zh-CN'
    setLanguage(savedLanguage)
    
    // 初始化监听器
    initNetworkListeners()
    initResizeListener()
    initErrorHandlers()
    
    // 更新设备信息
    updateDeviceInfo()
    
    console.log('应用初始化完成', {
      theme: theme.value,
      language: language.value,
      deviceInfo: deviceInfo.value,
      isOnline: isOnline.value
    })
  }
  
  // 重置应用状态
  const resetApp = () => {
    setLoading(false)
    clearErrors()
    navigationHistory.value = []
    currentRoute.value = ''
    
    // 清除本地存储（除了用户相关数据）
    const keysToKeep = ['token', 'refreshToken', 'userInfo', 'freeCount']
    const allKeys = Object.keys(localStorage)
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key)
      }
    })
    
    console.log('应用状态已重置')
  }
  
  // 获取应用统计信息
  const getAppStats = () => {
    return {
      version: appConfig.value.version,
      uptime: Date.now() - performance.timing.navigationStart,
      errorCount: errors.value.length,
      navigationCount: navigationHistory.value.length,
      isOnline: isOnline.value,
      deviceInfo: deviceInfo.value,
      theme: theme.value,
      language: language.value
    }
  }
  
  return {
    // 状态
    isLoading,
    loadingText,
    theme,
    language,
    isOnline,
    deviceInfo,
    currentRoute,
    navigationHistory,
    showMobileNav,
    appConfig,
    errors,
    lastError,
    
    // 计算属性
    isMobile,
    isTablet,
    isDesktop,
    hasErrors,
    
    // 方法
    setLoading,
    setTheme,
    setLanguage,
    updateDeviceInfo,
    setOnlineStatus,
    setCurrentRoute,
    toggleMobileNav,
    setMobileNavVisibility,
    addError,
    removeError,
    clearErrors,
    initializeApp,
    resetApp,
    getAppStats
  }
})
