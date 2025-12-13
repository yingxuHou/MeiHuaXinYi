import request from './request'

/**
 * 梅花心易占卜API接口 v2.0
 * 集成后端真实API调用
 */

/**
 * 执行占卜
 * @param {Object} data - 占卜参数
 * @param {string} data.question - 占卜问题
 * @param {string} data.method - 起卦方法 (time|number|manual)
 * @param {Object} data.params - 起卦参数
 * @param {Object} data.location - 位置信息（可选）
 * @returns {Promise} 占卜结果
 */
export const performDivination = (data) => {
  // 使用正式的占卜端点，而非测试端点
  // 开发环境使用 dev-perform（跳过数据库），生产环境使用 perform
  const endpoint = import.meta.env.DEV ? '/divination/dev-perform' : '/divination/perform';

  // 🔍 添加调试日志
  console.log('🚀 发送占卜请求:', {
    endpoint,
    method: 'POST',
    hasAuth: true,
    data: JSON.stringify(data, null, 2)
  });

  return request({
    url: endpoint,
    method: 'POST',
    data
  })
}

/**
 * 获取占卜详情
 * @param {string} id - 占卜ID
 * @returns {Promise} 占卜详情
 */
export const getDivinationById = (id) => {
  return request({
    url: `/divination/${id}`,
    method: 'GET'
  })
}

/**
 * 获取占卜历史
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.method - 起卦方法筛选
 * @param {string} params.sortBy - 排序字段
 * @param {string} params.sortOrder - 排序方向
 * @returns {Promise} 占卜历史列表
 */
export const getDivinationHistory = (params = {}) => {
  // 开发环境使用专用端点
  const endpoint = import.meta.env.DEV ? '/divination/dev-history' : '/divination/history';

  return request({
    url: endpoint,
    method: 'GET',
    params
  })
}

/**
 * 获取占卜统计
 * @returns {Promise} 占卜统计数据
 */
export const getDivinationStats = () => {
  return request({
    url: '/divination/stats',
    method: 'GET'
  })
}

/**
 * 评价占卜结果
 * @param {string} id - 占卜ID
 * @param {Object} ratingData - 评价数据
 * @param {number} ratingData.overall - 总体评分 (1-5)
 * @param {number} ratingData.accuracy - 准确性评分 (1-5)
 * @param {number} ratingData.helpfulness - 有用性评分 (1-5)
 * @param {string} ratingData.feedback - 反馈内容（可选）
 * @returns {Promise} 评价结果
 */
export const rateDivination = (id, ratingData) => {
  return request({
    url: `/divination/${id}/rating`,
    method: 'PUT',
    data: ratingData
  })
}

/**
 * 获取API健康状态
 * @returns {Promise} 健康状态
 */
export const getHealthStatus = () => {
  return request({
    url: '/divination/health',
    method: 'GET'
  })
}

/**
 * 获取API信息
 * @returns {Promise} API信息
 */
export const getAPIInfo = () => {
  return request({
    url: '/divination/info',
    method: 'GET'
  })
}

/**
 * 为占卜结果生成AI解读
 * @param {string} id - 占卜ID
 * @param {Object} options - AI解读选项
 * @returns {Promise} AI解读结果
 */
export const generateAIInterpretation = (id, options = {}) => {
  return request({
    url: `/divination/${id}/interpretation`,
    method: 'POST',
    data: options
  })
}

/**
 * 检查AI服务状态
 * @returns {Promise} AI服务状态
 */
export const checkAIStatus = () => {
  return request({
    url: '/divination/ai-status',
    method: 'GET'
  })
}

/**
 * 获取解读模板
 * @returns {Promise} 解读模板列表
 */
export const getInterpretationTemplates = () => {
  return request({
    url: '/divination/interpretation-templates',
    method: 'GET'
  })
}

// 为了向后兼容，保留旧的API接口格式
export const divinationAPI = {
  /**
   * 开始占卜 - 兼容旧版本
   * @param {Object} divinationData - 占卜数据
   * @returns {Promise} API响应
   */
  async startDivination(divinationData) {
    try {
      const { question, category, method = 'time', ...params } = divinationData

      const data = {
        question,
        method,
        params: method === 'time' ? { datetime: new Date().toISOString() } : params
      }

      const response = await performDivination(data)

      // 转换为旧格式
      return {
        success: response.success,
        data: {
          id: response.data.id,
          question: response.data.question,
          timestamp: response.data.timestamp,
          hexagram: {
            name: response.data.hexagrams.ben.name,
            number: response.data.hexagrams.ben.id,
            description: response.data.interpretation.summary,
            lines: response.data.hexagrams.ben.lines.map((line, index) => ({
              position: 6 - index,
              type: line === 1 ? 'yang' : 'yin',
              changing: index + 1 === response.data.movingLine
            })),
            upperTrigram: response.data.hexagrams.ben.upperGua.name,
            lowerTrigram: response.data.hexagrams.ben.lowerGua.name
          },
          interpretation: {
            overall: response.data.interpretation.summary,
            advice: response.data.interpretation.advice,
            timeRecommendation: response.data.analysis.timing,
            luckyElements: response.data.analysis.wuxing.favorableElements || [],
            cautions: [response.data.interpretation.precautions]
          },
          aiAnalysis: {
            confidence: response.data.interpretation.confidence,
            keywords: response.data.hexagrams.ben.keywords || [],
            sentiment: response.data.analysis.fortune.includes('吉') ? 'positive' : 'neutral',
            complexity: 'medium'
          },
          status: 'completed'
        },
        message: '占卜完成'
      }
    } catch (error) {
      console.error('开始占卜API错误:', error)
      throw error
    }
  },

  /**
   * 获取占卜结果 - 兼容旧版本
   * @param {string|number} id - 占卜结果ID
   * @returns {Promise} API响应
   */
  async getDivinationResult(id) {
    try {
      const response = await getDivinationById(id)

      // 转换为旧格式
      return {
        success: response.success,
        data: {
          id: response.data.id,
          question: response.data.question,
          timestamp: response.data.timestamp || response.data.createdAt,
          hexagram: {
            name: response.data.hexagrams.ben.name,
            number: response.data.hexagrams.ben.id,
            description: response.data.interpretation.summary
          },
          interpretation: {
            overall: response.data.interpretation.summary,
            advice: response.data.interpretation.advice
          },
          status: 'completed'
        }
      }
    } catch (error) {
      console.error('获取占卜结果API错误:', error)
      throw error
    }
  },

  /**
   * 获取占卜历史记录 - 兼容旧版本
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.category - 类别筛选
   * @param {string} params.keyword - 关键词搜索
   * @returns {Promise} API响应
   */
  async getHistory(params = {}) {
    try {
      const { page = 1, pageSize = 10, category, keyword } = params

      const queryParams = {
        page,
        limit: pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      const response = await getDivinationHistory(queryParams)

      // 转换为旧格式
      const items = response.data.divinations.map(item => ({
        id: item.id,
        question: item.question,
        timestamp: item.createdAt,
        hexagram: {
          name: item.hexagram,
          number: 1, // 默认值，因为新API没有返回number
          description: item.hexagram
        },
        interpretation: {
          overall: `${item.hexagram}卦，运势${item.fortune}`,
          advice: '查看完整结果获取详细建议'
        },
        status: 'completed',
        isFavorite: false, // 新API暂不支持收藏功能
        category: category || '通用'
      }))

      return {
        success: response.success,
        data: {
          items,
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          totalPages: response.data.pagination.pages
        }
      }
    } catch (error) {
      console.error('获取历史记录API错误:', error)
      throw error
    }
  },

  /**
   * 删除历史记录 - 兼容旧版本（暂不支持）
   * @param {string|number} id - 记录ID
   * @returns {Promise} API响应
   */
  async deleteHistoryItem(id) {
    try {
      // 新版API暂不支持删除历史记录
      await new Promise(resolve => setTimeout(resolve, 300))

      return {
        success: true,
        message: '删除功能将在后续版本中支持'
      }
    } catch (error) {
      console.error('删除历史记录API错误:', error)
      throw error
    }
  },

  /**
   * 切换收藏状态 - 兼容旧版本（暂不支持）
   * @param {string|number} id - 记录ID
   * @returns {Promise} API响应
   */
  async toggleFavorite(id) {
    try {
      // 新版API暂不支持收藏功能
      await new Promise(resolve => setTimeout(resolve, 300))

      return {
        success: true,
        data: {
          id,
          isFavorite: false
        },
        message: '收藏功能将在后续版本中支持'
      }
    } catch (error) {
      console.error('切换收藏状态API错误:', error)
      throw error
    }
  },

  /**
   * 分享占卜结果
   * @param {string|number} id - 结果ID
   * @param {string} platform - 分享平台
   * @returns {Promise} API响应
   */
  async shareResult(id, platform = 'link') {
    try {
      // TODO: 替换为实际API调用
      // const response = await axios.post(`/divination/share/${id}`, { platform })
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        success: true,
        data: {
          shareUrl: `https://meihua.example.com/share/${id}`,
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          title: '梅花心易占卜结果',
          description: '查看我的占卜结果，获得智慧指引',
          platform
        },
        message: '分享链接已生成'
      }
    } catch (error) {
      console.error('分享结果API错误:', error)
      throw error
    }
  },

  /**
   * 获取占卜统计信息 - 使用新API
   * @returns {Promise} API响应
   */
  async getStatistics() {
    try {
      const response = await getDivinationStats()

      // 转换为旧格式
      return {
        success: response.success,
        data: {
          totalDivinations: response.data.total,
          thisMonthCount: response.data.thisMonth,
          favoriteCount: 0, // 新API暂不支持收藏
          categoryStats: response.data.methodDistribution || {},
          fortuneStats: response.data.fortuneDistribution || {},
          averageRating: response.data.averageRating,
          recentActivity: [] // 新API暂不提供活动数据
        }
      }
    } catch (error) {
      console.error('获取统计信息API错误:', error)
      throw error
    }
  },

  /**
   * 验证问题内容 - 客户端验证
   * @param {string} question - 问题内容
   * @returns {Promise} API响应
   */
  async validateQuestion(question) {
    try {
      // 客户端验证，无需API调用
      await new Promise(resolve => setTimeout(resolve, 100))

      // 简单的内容验证
      const isValid = question.length >= 1 && question.length <= 200
      const containsSensitiveWords = /违法|暴力|色情/.test(question)

      return {
        success: true,
        data: {
          isValid: isValid && !containsSensitiveWords,
          suggestions: isValid ? [] : ['问题长度应在1-200字之间'],
          warnings: containsSensitiveWords ? ['问题包含敏感词汇'] : []
        }
      }
    } catch (error) {
      console.error('验证问题API错误:', error)
      throw error
    }
  },

  /**
   * 评价占卜结果 - 新增功能
   * @param {string} id - 占卜ID
   * @param {Object} ratingData - 评价数据
   * @returns {Promise} API响应
   */
  async rateResult(id, ratingData) {
    try {
      const response = await rateDivination(id, ratingData)
      return {
        success: response.success,
        data: response.data,
        message: response.message
      }
    } catch (error) {
      console.error('评价结果API错误:', error)
      throw error
    }
  },

  /**
   * 为占卜结果生成AI解读 - 新增功能
   * @param {string} id - 占卜ID
   * @param {Object} options - AI解读选项
   * @returns {Promise} API响应
   */
  async generateAIInterpretationForResult(id, options = {}) {
    try {
      const response = await generateAIInterpretation(id, options)
      return {
        success: response.success,
        data: response.data,
        message: response.message
      }
    } catch (error) {
      console.error('生成AI解读错误:', error)
      throw new Error('生成AI解读失败')
    }
  },

  /**
   * 检查AI服务状态 - 新增功能
   * @returns {Promise} API响应
   */
  async checkAIStatus() {
    try {
      const response = await checkAIStatus()
      return {
        success: response.success,
        data: response.data,
        message: response.message
      }
    } catch (error) {
      console.error('检查AI服务状态错误:', error)
      throw error
    }
  },

  /**
   * 获取解读模板 - 新增功能
   * @returns {Promise} API响应
   */
  async getInterpretationTemplates() {
    try {
      const response = await getInterpretationTemplates()
      return {
        success: response.success,
        data: response.data,
        message: response.message
      }
    } catch (error) {
      console.error('获取解读模板错误:', error)
      throw error
    }
  }
}
