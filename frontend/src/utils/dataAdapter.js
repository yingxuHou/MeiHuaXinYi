/**
 * 数据适配器 - 将新版API数据转换为前端组件期望的格式
 */

/**
 * 检查占卜数据的一致性
 * @param {Object} data - 占卜数据
 * @returns {Object} 检查结果
 */
export function checkDivinationDataConsistency(data) {
  if (!data || !data.hexagrams) {
    return { isValid: false, issues: ['数据缺失'] }
  }
  
  const { ben, hu, bian } = data.hexagrams
  const movingLine = data.movingLine
  const issues = []
  
  // 检查主卦和变卦是否相同
  if (ben && bian && ben.lines && bian.lines) {
    const isSame = JSON.stringify(ben.lines) === JSON.stringify(bian.lines)
    if (isSame) {
      issues.push('主卦和变卦相同')
      console.error('❌ 数据问题：主卦和变卦相同！', {
        ben: ben.lines,
        bian: bian.lines,
        movingLine
      })
    }
  }
  
  // 检查动爻是否正确变化
  if (ben && bian && ben.lines && bian.lines && movingLine) {
    const benLine = ben.lines[movingLine - 1]
    const bianLine = bian.lines[movingLine - 1]
    
    if (benLine === bianLine) {
      issues.push('动爻没有变化')
      console.error('❌ 数据问题：动爻没有变化！', {
        movingLine,
        benLine,
        bianLine
      })
    }
  }
  
  return { isValid: issues.length === 0, issues }
}

/**
 * 适配占卜结果数据
 * @param {Object} apiData - 来自新版API的数据
 * @returns {Object} 适配后的数据
 */
export function adaptDivinationResult(apiData) {
  if (!apiData) return null
  
  // 首先检查数据一致性
  const consistencyCheck = checkDivinationDataConsistency(apiData)
  if (!consistencyCheck.isValid) {
    console.warn('⚠️ 检测到数据问题:', consistencyCheck.issues)
    // 在生产环境中，可以选择修复数据或返回错误
    // 这里我们记录警告但继续处理
  }

  // 新版API数据结构
  const {
    id,
    question,
    timestamp,
    createdAt,
    hexagrams = {},
    movingLine,
    analysis = {},
    interpretation = {},
    userRating,
    metadata = {}
  } = apiData

  // 确保必要字段存在 - 修复：不要使用默认值覆盖真实数据
  const safeHexagrams = {
    ben: hexagrams.ben || null,
    hu: hexagrams.hu || null,
    bian: hexagrams.bian || null
  }

  // 如果任何卦象缺失，记录警告但不使用默认值
  if (!safeHexagrams.ben) {
    console.warn('⚠️ 主卦数据缺失，可能导致显示问题')
  }
  if (!safeHexagrams.hu) {
    console.warn('⚠️ 互卦数据缺失，可能导致显示问题')
  }
  if (!safeHexagrams.bian) {
    console.warn('⚠️ 变卦数据缺失，可能导致显示问题')
  }

  const safeAnalysis = {
    fortune: analysis.fortune || '中平',
    timing: analysis.timing || '时机适中',
    wuxing: analysis.wuxing || { ben: '金', fortune: '中平', timing: '时机适中' }
  }

  const safeInterpretation = {
    summary: interpretation.summary || '专业解读正在生成中...',
    detailed: interpretation.detailed || '详细解读正在生成中...',
    advice: interpretation.advice || '请耐心等待专业建议...',
    precautions: interpretation.precautions || '暂无特别注意事项'
  }

  // 转换为前端期望的格式
  return {
    id: id || 'temp_' + Date.now(),
    question: question || '未知问题',
    timestamp: timestamp || createdAt || new Date(),
    
    // 卦象信息 - 主要使用本卦
    hexagram: {
      name: safeHexagrams.ben?.name || '未知卦象',
      number: safeHexagrams.ben?.id || 0,
      description: safeInterpretation.summary,
      lines: safeHexagrams.ben?.lines?.map((line, index) => ({
        position: 6 - index, // 从上往下排列
        type: line === 1 ? 'yang' : 'yin',
        changing: (index + 1) === movingLine
      })) || [],
      upperTrigram: safeHexagrams.ben?.upperGua?.name || '未知',
      lowerTrigram: safeHexagrams.ben?.lowerGua?.name || '未知'
    },

    // 三卦信息
    hexagrams: {
      ben: safeHexagrams.ben,
      hu: safeHexagrams.hu,
      bian: safeHexagrams.bian
    },

    // 动爻信息
    movingLine: movingLine || 1,

    // 解读信息
    interpretation: {
      overall: safeInterpretation.summary,
      summary: safeInterpretation.summary, // 添加summary字段以兼容现有代码
      detailed: safeInterpretation.detailed,
      advice: safeInterpretation.advice,
      timing: safeAnalysis.timing, // 添加timing字段
      timeRecommendation: safeAnalysis.timing,
      luckyElements: safeAnalysis.wuxing?.favorableElements || [],
      cautions: safeInterpretation.precautions ? [safeInterpretation.precautions] : []
    },

    // AI分析信息
    aiAnalysis: {
      confidence: interpretation.confidence || 0.8,
      keywords: safeHexagrams.ben?.keywords || [],
      sentiment: safeAnalysis.fortune.includes('吉') ? 'positive' : 
                safeAnalysis.fortune.includes('凶') ? 'negative' : 'neutral',
      complexity: 'medium'
    },

    // 五行分析
    wuxingAnalysis: {
      ben: safeAnalysis.wuxing?.ben || '未知',
      hu: safeAnalysis.wuxing?.hu || '未知', 
      bian: safeAnalysis.wuxing?.bian || '未知',
      fortune: safeAnalysis.wuxing?.fortune || safeAnalysis.fortune,
      timing: safeAnalysis.wuxing?.timing || safeAnalysis.timing,
      relationships: safeAnalysis.wuxing?.relationships || {}
    },

    // 分析信息（兼容性）
    analysis: {
      fortune: safeAnalysis.fortune,
      timing: safeAnalysis.timing,
      wuxing: safeAnalysis.wuxing
    },

    // 用户评价
    userRating,

    // 元数据
    metadata,

    // 兼容性字段
    status: 'completed',
    isFavorite: false, // 新版API暂不支持收藏
    category: '通用'
  }
}

/**
 * 适配占卜历史列表数据
 * @param {Object} apiData - 来自新版API的数据
 * @returns {Object} 适配后的数据
 */
export function adaptDivinationHistory(apiData) {
  if (!apiData || !apiData.divinations) return { items: [], pagination: {} }

  const items = apiData.divinations.map(item => ({
    id: item.id,
    question: item.question,
    timestamp: item.createdAt,
    hexagram: {
      name: item.hexagram,
      number: 1, // 默认值
      description: item.hexagram
    },
    interpretation: {
      overall: `${item.hexagram}卦，运势${item.fortune}`,
      advice: '查看详情获取完整解读'
    },
    status: 'completed',
    isFavorite: false,
    category: '通用',
    fortune: item.fortune,
    rating: item.rating
  }))

  return {
    items,
    total: apiData.pagination.total,
    page: apiData.pagination.page,
    pageSize: apiData.pagination.limit,
    totalPages: apiData.pagination.pages,
    pagination: apiData.pagination
  }
}

/**
 * 适配占卜统计数据
 * @param {Object} apiData - 来自新版API的数据
 * @returns {Object} 适配后的数据
 */
export function adaptDivinationStats(apiData) {
  if (!apiData) return {}

  return {
    totalDivinations: apiData.total,
    thisMonthCount: apiData.thisMonth,
    favoriteCount: 0, // 新版API暂不支持收藏
    averageRating: apiData.averageRating,
    
    // 方法分布
    categoryStats: apiData.methodDistribution || {},
    
    // 运势分布
    fortuneStats: apiData.fortuneDistribution || {},
    
    // 兼容性字段
    recentActivity: []
  }
}

/**
 * 适配起卦参数
 * @param {Object} formData - 前端表单数据
 * @returns {Object} API期望的参数格式
 */
export function adaptDivinationParams(formData) {
  const { question, method, category, ...otherParams } = formData

  let params = {}

  switch (method) {
    case 'time':
      params = {
        datetime: otherParams.datetime || new Date().toISOString()
      }
      break
    
    case 'number':
      params = {
        numbers: otherParams.numbers || []
      }
      break
    
    case 'manual':
      params = {
        upperGua: otherParams.upperGua,
        lowerGua: otherParams.lowerGua,
        movingLine: otherParams.movingLine
      }
      break
  }

  return {
    question,
    method,
    params,
    location: otherParams.location || null
  }
}

/**
 * 适配错误信息
 * @param {Object} error - API错误对象
 * @returns {string} 用户友好的错误信息
 */
export function adaptErrorMessage(error) {
  if (!error) return '未知错误'

  // 如果是响应错误
  if (error.response?.data) {
    const { message, code } = error.response.data
    
    // 根据错误代码返回友好提示
    const errorMessages = {
      'TOKEN_MISSING': '请先登录',
      'TOKEN_INVALID': '登录已过期，请重新登录',
      'USER_NOT_FOUND': '用户不存在',
      'ACCOUNT_DISABLED': '账户已被禁用',
      'FREE_QUOTA_EXCEEDED': '今日免费占卜次数已用完，请升级会员或明日再试',
      'PERMISSION_DENIED': '权限不足',
      'RATE_LIMIT_EXCEEDED': '请求过于频繁，请稍后再试',
      'VALIDATION_ERROR': '参数验证失败',
      'DIVINATION_ERROR': '占卜计算失败',
      'NOT_FOUND': '资源不存在',
      'INTERNAL_ERROR': '服务器内部错误'
    }

    return errorMessages[code] || message || '操作失败'
  }

  // 网络错误
  if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
    return '网络连接失败，请检查网络设置'
  }

  // 超时错误
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return '请求超时，请重试'
  }

  return error.message || '操作失败，请重试'
}

/**
 * 检查是否为新版API响应格式
 * @param {Object} data - 响应数据
 * @returns {boolean} 是否为新版格式
 */
export function isNewAPIFormat(data) {
  return data && 
         typeof data.success === 'boolean' && 
         data.hasOwnProperty('data')
}

/**
 * 统一响应处理
 * @param {Object} response - API响应
 * @returns {Object} 处理后的响应
 */
export function handleAPIResponse(response) {
  // 如果已经是新版格式，直接返回
  if (isNewAPIFormat(response)) {
    return response
  }

  // 如果是旧版格式，转换为新版格式
  return {
    success: true,
    data: response,
    message: '操作成功'
  }
}
