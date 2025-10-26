/**
 * 通用工具函数集合
 */

/**
 * 格式化日期时间
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式化模板
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 相对时间格式化
 * @param {Date|string|number} date - 日期
 * @returns {string} 相对时间字符串
 */
export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, delay = 300) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, delay = 300) => {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return func.apply(this, args)
    }
  }
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  if (typeof obj === 'object') {
    const cloned = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

/**
 * 生成唯一ID
 * @param {string} prefix - 前缀
 * @returns {string} 唯一ID
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式（改进版）
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
export const validatePhone = (phone) => {
  if (!phone) return false

  // 清理输入：移除空格、横线、括号等分隔符
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '')

  // 验证：11位数字且以1开头
  const phoneRegex = /^1[0-9]\d{9}$/
  return phoneRegex.test(cleaned)
}

/**
 * 清理手机号输入
 * @param {string} phone - 原始手机号输入
 * @returns {string} 清理后的手机号
 */
export const cleanPhoneInput = (phone) => {
  if (!phone) return ''
  return phone.replace(/[\s\-\(\)\+]/g, '')
}

/**
 * 格式化手机号显示
 * @param {string} phone - 手机号
 * @returns {string} 格式化后的手机号
 */
export const formatPhoneDisplay = (phone) => {
  const cleaned = cleanPhoneInput(phone)
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`
  }
  return cleaned
}

/**
 * 获取手机号验证错误信息
 * @param {string} phone - 手机号
 * @returns {string} 错误信息，如果有效则返回空字符串
 */
export const getPhoneValidationError = (phone) => {
  if (!phone) return ''

  const cleaned = cleanPhoneInput(phone)

  if (cleaned.length === 0) {
    return '请输入手机号'
  }

  if (!/^\d+$/.test(cleaned)) {
    return '手机号只能包含数字'
  }

  if (cleaned.length < 11) {
    return `手机号长度不足，当前${cleaned.length}位，需要11位`
  }

  if (cleaned.length > 11) {
    return `手机号长度过长，当前${cleaned.length}位，需要11位`
  }

  if (!cleaned.startsWith('1')) {
    return '手机号必须以1开头'
  }

  return '' // 验证通过
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} 验证结果
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    strength: 'weak',
    messages: []
  }
  
  if (!password) {
    result.messages.push('密码不能为空')
    return result
  }
  
  if (password.length < 6) {
    result.messages.push('密码长度至少6位')
  }
  
  if (password.length > 20) {
    result.messages.push('密码长度不能超过20位')
  }
  
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  let strengthScore = 0
  if (hasLower) strengthScore++
  if (hasUpper) strengthScore++
  if (hasNumber) strengthScore++
  if (hasSpecial) strengthScore++
  
  if (strengthScore >= 3 && password.length >= 8) {
    result.strength = 'strong'
  } else if (strengthScore >= 2 && password.length >= 6) {
    result.strength = 'medium'
  }
  
  result.isValid = password.length >= 6 && password.length <= 20
  
  return result
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 扩展名
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * 检查是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 获取设备信息
 * @returns {Object} 设备信息
 */
export const getDeviceInfo = () => {
  const ua = navigator.userAgent
  
  return {
    isMobile: isMobile(),
    isIOS: /iPad|iPhone|iPod/.test(ua),
    isAndroid: /Android/.test(ua),
    isWeChat: /MicroMessenger/i.test(ua),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    userAgent: ua
  }
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否成功
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 滚动到指定元素
 * @param {string|Element} element - 元素选择器或元素
 * @param {Object} options - 滚动选项
 */
export const scrollToElement = (element, options = {}) => {
  const target = typeof element === 'string' ? document.querySelector(element) : element
  
  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    })
  }
}

/**
 * 本地存储工具
 */
export const storage = {
  set(key, value, expiry = null) {
    const item = {
      value,
      expiry: expiry ? Date.now() + expiry : null
    }
    localStorage.setItem(key, JSON.stringify(item))
  },
  
  get(key) {
    try {
      const item = JSON.parse(localStorage.getItem(key))
      if (!item) return null
      
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key)
        return null
      }
      
      return item.value
    } catch (error) {
      console.error('获取本地存储失败:', error)
      return null
    }
  },
  
  remove(key) {
    localStorage.removeItem(key)
  },
  
  clear() {
    localStorage.clear()
  }
}

/**
 * URL参数工具
 */
export const urlParams = {
  get(name) {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(name)
  },
  
  set(name, value) {
    const url = new URL(window.location)
    url.searchParams.set(name, value)
    window.history.replaceState({}, '', url)
  },
  
  remove(name) {
    const url = new URL(window.location)
    url.searchParams.delete(name)
    window.history.replaceState({}, '', url)
  },
  
  getAll() {
    const urlParams = new URLSearchParams(window.location.search)
    const params = {}
    for (const [key, value] of urlParams) {
      params[key] = value
    }
    return params
  }
}

/**
 * 颜色工具
 */
export const colorUtils = {
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  },
  
  getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16)
  }
}
