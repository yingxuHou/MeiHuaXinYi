import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 180000, // 增加到180秒
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const appStore = useAppStore()
    
    // 添加认证token
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
      console.log('🔐 添加认证token:', {
        hasToken: !!userStore.token,
        tokenPreview: userStore.token.substring(0, 50) + '...',
        isDevToken: userStore.token.includes('dev-signature'),
        authHeader: config.headers.Authorization
      })
    } else {
      console.log('⚠️ 没有token可用于认证')
    }

    // 添加请求ID用于追踪
    config.headers['X-Request-ID'] = Date.now().toString()

    // 添加设备信息
    config.headers['X-Device-Info'] = JSON.stringify({
      isMobile: appStore.isMobile,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    })

    // 开始加载状态
    appStore.setLoading(true, '请求处理中...')

    console.log('📤 发送请求:', {
      url: config.url,
      method: config.method,
      hasAuth: !!config.headers.Authorization,
      data: config.data,
      params: config.params
    })
    
    return config
  },
  (error) => {
    const appStore = useAppStore()
    appStore.setLoading(false)
    appStore.addError({
      message: '请求配置错误',
      type: 'request',
      stack: error.stack
    })
    
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const appStore = useAppStore()
    appStore.setLoading(false)
    
    console.log('收到响应:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    
    // 检查业务状态码
    if (response.data && response.data.success === false) {
      const errorMessage = response.data.error?.message || response.data.message || '请求失败'
      
      // 显示错误消息
      ElMessage.error(errorMessage)
      
      // 记录错误
      appStore.addError({
        message: errorMessage,
        type: 'business',
        code: response.data.error?.code || response.data.code
      })
      
      return Promise.reject(new Error(errorMessage))
    }
    
    return response.data
  },
  async (error) => {
    const userStore = useUserStore()
    const appStore = useAppStore()
    appStore.setLoading(false)
    
    console.error('响应错误:', error)
    
    let errorMessage = '网络错误，请稍后重试'
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误'
          break
        case 401:
          errorMessage = '登录已过期，请重新登录'
          // 尝试刷新token
          try {
            await userStore.refreshAccessToken()
            // 重新发送原请求
            return request(error.config)
          } catch (refreshError) {
            // 刷新失败，清除登录状态
            userStore.logout()
            // 跳转到登录页
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
          }
          break
        case 403:
          errorMessage = '没有权限访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 429:
          errorMessage = '请求过于频繁，请稍后重试'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        case 502:
          errorMessage = '网关错误'
          break
        case 503:
          errorMessage = '服务暂时不可用'
          break
        default:
          errorMessage = data?.message || `请求失败 (${status})`
      }
    } else if (error.request) {
      // 网络错误
      if (!appStore.isOnline) {
        errorMessage = '网络连接已断开，请检查网络设置'
      } else {
        errorMessage = '网络请求超时，请检查网络连接'
      }
    } else {
      errorMessage = error.message || '请求配置错误'
    }
    
    // 显示错误消息
    ElMessage.error(errorMessage)
    
    // 记录错误
    appStore.addError({
      message: errorMessage,
      type: 'network',
      status: error.response?.status,
      stack: error.stack
    })
    
    return Promise.reject(error)
  }
)

// 请求重试机制
const retryRequest = (config, retryCount = 0) => {
  const maxRetries = 3
  
  return request(config).catch(error => {
    if (retryCount < maxRetries && shouldRetry(error)) {
      console.log(`请求重试 ${retryCount + 1}/${maxRetries}:`, config.url)
      
      // 指数退避延迟
      const delay = Math.pow(2, retryCount) * 1000
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(retryRequest(config, retryCount + 1))
        }, delay)
      })
    }
    
    return Promise.reject(error)
  })
}

// 判断是否应该重试
const shouldRetry = (error) => {
  // 网络错误或5xx服务器错误可以重试
  return !error.response || 
         error.response.status >= 500 || 
         error.code === 'NETWORK_ERROR' ||
         error.code === 'TIMEOUT'
}

// 取消请求的token管理
const cancelTokens = new Map()

// 创建可取消的请求
export const createCancelableRequest = (config) => {
  const cancelToken = axios.CancelToken.source()
  const requestKey = `${config.method}_${config.url}_${JSON.stringify(config.params || {})}`
  
  // 取消之前的相同请求
  if (cancelTokens.has(requestKey)) {
    cancelTokens.get(requestKey).cancel('请求被新请求取消')
  }
  
  cancelTokens.set(requestKey, cancelToken)
  
  return request({
    ...config,
    cancelToken: cancelToken.token
  }).finally(() => {
    cancelTokens.delete(requestKey)
  })
}

// 批量请求
export const batchRequest = (requests) => {
  return Promise.allSettled(requests.map(config => request(config)))
}

// 文件上传请求
export const uploadRequest = (url, file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(progress)
      }
    }
  })
}

// 下载文件请求
export const downloadRequest = (url, filename) => {
  return request({
    url,
    method: 'GET',
    responseType: 'blob'
  }).then(response => {
    const blob = new Blob([response])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  })
}

// 导出默认实例
export default request
