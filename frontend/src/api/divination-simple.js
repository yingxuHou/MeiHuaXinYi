/**
 * 简化的占卜API - 用于测试前后端集成
 */

import axios from 'axios'

// 创建专用的axios实例，用于测试
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 180000, // 增加到180秒
  headers: {
    'Content-Type': 'application/json'
  }
})

// 简单的请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('🚀 发送请求:', config.method.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => {
    console.error('❌ 请求错误:', error)
    return Promise.reject(error)
  }
)

// 简单的响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('✅ 收到响应:', response.status, response.data)
    return response.data
  },
  (error) => {
    console.error('❌ 响应错误:', error.response?.status, error.response?.data || error.message)
    return Promise.reject(error)
  }
)

/**
 * 测试API连接
 */
export const testConnection = async () => {
  try {
    const response = await api.get('/health')
    return response
  } catch (error) {
    throw new Error(`API连接测试失败: ${error.message}`)
  }
}

/**
 * 执行时间起卦
 */
export const performTimeDivination = async (question = '测试占卜') => {
  try {
    const response = await api.post('/divination/test', {
      question,
      method: 'time',
      params: {
        datetime: new Date().toISOString()
      }
    })
    return response
  } catch (error) {
    throw new Error(`时间起卦失败: ${error.message}`)
  }
}

/**
 * 执行数字起卦
 */
export const performNumberDivination = async (question = '测试占卜', numbers = [123, 456]) => {
  try {
    const response = await api.post('/divination/test', {
      question,
      method: 'number',
      params: {
        numbers
      }
    })
    return response
  } catch (error) {
    throw new Error(`数字起卦失败: ${error.message}`)
  }
}

/**
 * 执行手动起卦
 */
export const performManualDivination = async (question = '测试占卜', upperGua = 1, lowerGua = 2, movingLine = 3) => {
  try {
    const response = await api.post('/divination/test', {
      question,
      method: 'manual',
      params: {
        upperGua,
        lowerGua,
        movingLine
      }
    })
    return response
  } catch (error) {
    throw new Error(`手动起卦失败: ${error.message}`)
  }
}

/**
 * 获取占卜历史
 */
export const getDivinationHistory = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/divination/history', {
      params: { page, limit }
    })
    return response
  } catch (error) {
    throw new Error(`获取占卜历史失败: ${error.message}`)
  }
}

/**
 * 获取占卜统计
 */
export const getDivinationStats = async () => {
  try {
    const response = await api.get('/divination/stats')
    return response
  } catch (error) {
    throw new Error(`获取占卜统计失败: ${error.message}`)
  }
}

/**
 * 完整的API测试套件
 */
export const runAPITests = async () => {
  const results = {
    connection: null,
    timeDivination: null,
    numberDivination: null,
    manualDivination: null,
    history: null,
    stats: null,
    errors: []
  }

  console.log('🧪 开始API测试套件...')

  // 1. 测试连接
  try {
    console.log('\n1️⃣ 测试API连接...')
    results.connection = await testConnection()
    console.log('✅ API连接测试通过')
  } catch (error) {
    console.error('❌ API连接测试失败:', error.message)
    results.errors.push({ test: 'connection', error: error.message })
  }

  // 2. 测试时间起卦
  try {
    console.log('\n2️⃣ 测试时间起卦...')
    results.timeDivination = await performTimeDivination('前后端集成测试 - 时间起卦')
    console.log('✅ 时间起卦测试通过')
  } catch (error) {
    console.error('❌ 时间起卦测试失败:', error.message)
    results.errors.push({ test: 'timeDivination', error: error.message })
  }

  // 3. 测试数字起卦
  try {
    console.log('\n3️⃣ 测试数字起卦...')
    results.numberDivination = await performNumberDivination('前后端集成测试 - 数字起卦', [888, 999])
    console.log('✅ 数字起卦测试通过')
  } catch (error) {
    console.error('❌ 数字起卦测试失败:', error.message)
    results.errors.push({ test: 'numberDivination', error: error.message })
  }

  // 4. 测试手动起卦
  try {
    console.log('\n4️⃣ 测试手动起卦...')
    results.manualDivination = await performManualDivination('前后端集成测试 - 手动起卦', 3, 6, 4)
    console.log('✅ 手动起卦测试通过')
  } catch (error) {
    console.error('❌ 手动起卦测试失败:', error.message)
    results.errors.push({ test: 'manualDivination', error: error.message })
  }

  // 5. 测试历史查询
  try {
    console.log('\n5️⃣ 测试历史查询...')
    results.history = await getDivinationHistory(1, 5)
    console.log('✅ 历史查询测试通过')
  } catch (error) {
    console.error('❌ 历史查询测试失败:', error.message)
    results.errors.push({ test: 'history', error: error.message })
  }

  // 6. 测试统计查询
  try {
    console.log('\n6️⃣ 测试统计查询...')
    results.stats = await getDivinationStats()
    console.log('✅ 统计查询测试通过')
  } catch (error) {
    console.error('❌ 统计查询测试失败:', error.message)
    results.errors.push({ test: 'stats', error: error.message })
  }

  // 测试总结
  const totalTests = 6
  const passedTests = totalTests - results.errors.length
  const successRate = ((passedTests / totalTests) * 100).toFixed(1)

  console.log('\n📊 测试总结:')
  console.log(`   总测试数: ${totalTests}`)
  console.log(`   通过测试: ${passedTests}`)
  console.log(`   失败测试: ${results.errors.length}`)
  console.log(`   成功率: ${successRate}%`)

  if (results.errors.length > 0) {
    console.log('\n❌ 失败的测试:')
    results.errors.forEach(({ test, error }) => {
      console.log(`   - ${test}: ${error}`)
    })
  }

  if (passedTests === totalTests) {
    console.log('\n🎉 所有API测试通过！前后端集成成功！')
  } else {
    console.log('\n⚠️ 部分API测试失败，请检查后端服务状态')
  }

  return results
}

export default {
  testConnection,
  performTimeDivination,
  performNumberDivination,
  performManualDivination,
  getDivinationHistory,
  getDivinationStats,
  runAPITests
}
