/**
 * 梅花心易 - 占卜业务服务层
 * 处理占卜相关的业务逻辑，调用本地专业算法
 */

const axios = require('axios');
const { Divination, User } = require('../models');
const mongoose = require('mongoose');
const externalAlgorithmConfig = require('../config/external-algorithm');
const { algorithmManager } = require('../algorithms');

/**
 * 占卜业务服务类
 */
class DivinationService {
  constructor() {
    // 使用外部算法配置
    this.algorithmConfig = externalAlgorithmConfig;
  }

  /**
   * 执行占卜并保存结果
   * @param {string} userId - 用户ID
   * @param {string} question - 占卜问题
   * @param {string} method - 起卦方法
   * @param {Object} params - 起卦参数
   * @param {Object} options - 额外选项
   * @returns {Object} 占卜结果
   */
  async performDivination(userId, question, method, params, options = {}) {
    // 检查是否是开发用户或开发环境
    const isDevUser = (options.user && options.user.isDev) || process.env.NODE_ENV === 'development';

    if (isDevUser) {
      console.log('🔧 开发模式占卜，跳过数据库操作');

      // 直接调用本地算法，不保存到数据库
      const algorithmResult = await algorithmManager.performDivination(question, {
        method,
        params,
        user: options.user
      });

      return {
        success: true,
        data: {
          ...algorithmResult,
          id: 'dev_' + Date.now(), // 生成临时ID
          userId: userId,
          createdAt: new Date(),
          userRating: null,
          metadata: {
            ...algorithmResult.metadata,
            isDev: true,
            note: '开发模式，数据未保存到数据库'
          }
        }
      };
    }

    // 生产环境的正常用户数据库操作
    try {
      // 1. 验证用户权限
      await this.validateUserPermission(userId, null);

      // 2. 调用本地专业算法
      const algorithmResult = await algorithmManager.performDivination(question, {
        method,
        params,
        user: options.user
      });

      // 3. 构建数据库记录
      const divinationRecord = await this.createDivinationRecord(
        userId, algorithmResult, options, null
      );

      // 4. 更新用户统计
      await this.updateUserStats(userId, null);

      return {
        success: true,
        data: {
          id: divinationRecord._id,
          ...algorithmResult,
          createdAt: divinationRecord.createdAt,
          userRating: null
        }
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取占卜详情
   * @param {string} divinationId - 占卜ID
   * @param {string} userId - 用户ID
   * @returns {Object} 占卜详情
   */
  async getDivinationById(divinationId, userId) {
    try {
      const divination = await Divination.findOne({
        _id: divinationId,
        userId: userId
      }).populate('userId', 'username profile.nickname');

      if (!divination) {
        throw new Error('占卜记录不存在或无权访问');
      }

      return {
        success: true,
        data: this.formatDivinationResponse(divination)
      };

    } catch (error) {
      throw new Error(`获取占卜详情失败: ${error.message}`);
    }
  }

  /**
   * 获取用户占卜历史
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Object} 占卜历史列表
   */
  async getUserDivinationHistory(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        method,
        sortBy = 'createdAt',
        sortOrder = -1
      } = options;

      // 构建查询条件
      const query = { userId };
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      if (method) {
        query.method = method;
      }

      // 执行查询
      const skip = (page - 1) * limit;
      const [divinations, total] = await Promise.all([
        Divination.find(query)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .select('question method hexagrams.ben.name analysis.wuxing.fortune userRating createdAt'),
        Divination.countDocuments(query)
      ]);

      return {
        success: true,
        data: {
          divinations: divinations.map(d => this.formatDivinationSummary(d)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      throw new Error(`获取占卜历史失败: ${error.message}`);
    }
  }

  /**
   * 用户评价占卜结果
   * @param {string} divinationId - 占卜ID
   * @param {string} userId - 用户ID
   * @param {Object} ratingData - 评价数据
   * @returns {Object} 更新结果
   */
  async rateDivination(divinationId, userId, ratingData) {
    try {
      const divination = await Divination.findOne({
        _id: divinationId,
        userId: userId
      });

      if (!divination) {
        throw new Error('占卜记录不存在或无权访问');
      }

      // 更新评价
      divination.userRating = {
        overall: ratingData.overall,
        accuracy: ratingData.accuracy,
        helpfulness: ratingData.helpfulness,
        feedback: ratingData.feedback,
        ratedAt: new Date()
      };

      await divination.save();

      return {
        success: true,
        message: '评价提交成功',
        data: {
          id: divinationId,
          rating: divination.userRating
        }
      };

    } catch (error) {
      throw new Error(`提交评价失败: ${error.message}`);
    }
  }

  /**
   * 获取用户占卜统计
   * @param {string} userId - 用户ID
   * @returns {Object} 统计数据
   */
  async getUserDivinationStats(userId) {
    try {
      const stats = await Divination.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalDivinations: { $sum: 1 },
            methodStats: {
              $push: '$method'
            },
            fortuneStats: {
              $push: '$analysis.wuxing.fortune'
            },
            averageRating: {
              $avg: '$userRating.overall'
            },
            thisMonth: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      '$createdAt',
                      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      const result = stats[0] || {
        totalDivinations: 0,
        methodStats: [],
        fortuneStats: [],
        averageRating: null,
        thisMonth: 0
      };

      return {
        success: true,
        data: {
          total: result.totalDivinations,
          thisMonth: result.thisMonth,
          averageRating: result.averageRating ? Number(result.averageRating.toFixed(2)) : null,
          methodDistribution: this.calculateDistribution(result.methodStats),
          fortuneDistribution: this.calculateDistribution(result.fortuneStats)
        }
      };

    } catch (error) {
      throw new Error(`获取统计数据失败: ${error.message}`);
    }
  }

  /**
   * 验证用户权限
   * @param {string} userId - 用户ID
   * @param {Object} session - 数据库会话
   */
  async validateUserPermission(userId, session) {
    const query = User.findById(userId);
    const user = session ? await query.session(session) : await query;

    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查今日免费次数
    const today = new Date();
    const lastResetDate = new Date(user.usage.lastResetDate);

    // 如果是新的一天，重置免费次数
    if (today.toDateString() !== lastResetDate.toDateString()) {
      user.usage.freeCountToday = 10;
      user.usage.lastResetDate = today;
      const saveOptions = session ? { session } : {};
      await user.save(saveOptions);
    }

    // 检查使用权限
    if (user.subscription.type === 'free') {
      if (user.usage.freeCountToday <= 0) {
        throw new Error('今日免费占卜次数已用完，请升级会员或明日再试');
      }
    }

    return user;
  }

  /**
   * 创建占卜记录
   * @param {string} userId - 用户ID
   * @param {Object} algorithmResult - 算法结果
   * @param {Object} options - 选项
   * @param {Object} session - 数据库会话
   * @returns {Object} 占卜记录
   */
  async createDivinationRecord(userId, algorithmResult, options, session) {
    const divinationData = {
      userId,
      question: algorithmResult.question,
      method: algorithmResult.method,
      hexagrams: algorithmResult.hexagrams,
      movingLine: algorithmResult.movingLine,
      analysis: algorithmResult.analysis,
      interpretation: algorithmResult.interpretation,
      metadata: {
        ...algorithmResult.metadata,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        location: options.location
      }
    };

    const divination = new Divination(divinationData);
    const saveOptions = session ? { session } : {};
    return await divination.save(saveOptions);
  }

  /**
   * 更新用户统计
   * @param {string} userId - 用户ID
   * @param {Object} session - 数据库会话
   */
  async updateUserStats(userId, session) {
    const query = User.findById(userId);
    const user = session ? await query.session(session) : await query;

    // 更新占卜次数
    user.usage.divinationCount += 1;

    // 如果是免费用户，减少今日免费次数
    if (user.subscription.type === 'free') {
      user.usage.freeCountToday = Math.max(0, user.usage.freeCountToday - 1);
    }

    // 更新最后活跃时间
    user.usage.lastActiveAt = new Date();

    const saveOptions = session ? { session } : {};
    await user.save(saveOptions);
  }

  /**
   * 格式化占卜响应
   * @param {Object} divination - 占卜记录
   * @returns {Object} 格式化后的响应
   */
  formatDivinationResponse(divination) {
    return {
      id: divination._id,
      question: divination.question,
      method: divination.method,
      hexagrams: divination.hexagrams,
      movingLine: divination.movingLine,
      analysis: divination.analysis,
      interpretation: divination.interpretation,
      userRating: divination.userRating,
      createdAt: divination.createdAt,
      metadata: {
        processingTime: divination.metadata.processingTime,
        algorithmVersion: divination.metadata.algorithmVersion
      }
    };
  }

  /**
   * 格式化占卜摘要
   * @param {Object} divination - 占卜记录
   * @returns {Object} 格式化后的摘要
   */
  formatDivinationSummary(divination) {
    return {
      id: divination._id,
      question: divination.question,
      method: divination.method,
      hexagram: divination.hexagrams.ben.name,
      fortune: divination.analysis.wuxing.fortune,
      rating: divination.userRating?.overall || null,
      createdAt: divination.createdAt
    };
  }

  /**
   * 计算分布统计
   * @param {Array} data - 数据数组
   * @returns {Object} 分布统计
   */
  calculateDistribution(data) {
    const distribution = {};
    data.forEach(item => {
      distribution[item] = (distribution[item] || 0) + 1;
    });
    return distribution;
  }

  /**
   * 调用外部专业算法API
   * @param {string} question - 占卜问题
   * @param {string} method - 起卦方法
   * @param {Object} params - 起卦参数
   * @param {Object} options - 额外选项
   * @returns {Object} 算法结果
   */
  async callExternalAlgorithmAPI(question, method, params, options = {}) {
    const config = this.algorithmConfig.getConfig();
    const startTime = Date.now();

    // 开发环境或测试模式下直接使用本地算法
    if (config.isDevelopment || process.env.NODE_ENV === 'development') {
      console.log('🔧 开发模式：使用本地算法而非外部API');
      
      try {
        // 使用本地算法
        const algorithmResult = await algorithmManager.performDivination(question, {
          method,
          params,
          user: options.user
        });

        const processingTime = Date.now() - startTime;

        return {
          ...algorithmResult,
          metadata: {
            ...algorithmResult.metadata,
            processingTime,
            algorithmVersion: 'local-dev-v1.0',
            externalApi: false,
            fallback: false,
            isDevelopment: true,
            note: '开发模式使用本地算法'
          }
        };
      } catch (error) {
        console.error('❌ 本地算法调用失败:', error);
        // 如果本地算法也失败，使用占位符
        return this.generateFallbackResult(question, method, params, {
          processingTime: Date.now() - startTime,
          error: error.message,
          fallback: true,
          fallbackMode: 'local-fallback'
        });
      }
    }

    // 生产环境才调用外部API
    try {
      const requestId = this.algorithmConfig.generateRequestId();

      this.algorithmConfig.debug('开始调用外部算法API', {
        requestId,
        question: question.substring(0, 50) + '...',
        method
      });

      // 构建API请求数据
      const requestData = {
        question,
        method,
        params,
        timestamp: new Date().toISOString(),
        requestId,
        userContext: {
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
          location: options.location
        }
      };

      // 获取配置
      const config = this.algorithmConfig.getConfig();
      const headers = {
        ...this.algorithmConfig.getHeaders(),
        'X-Request-ID': requestId
      };

      // 调用外部算法API
      const response = await axios.post(
        this.algorithmConfig.getEndpointUrl('/divination/perform'),
        requestData,
        {
          headers,
          timeout: config.timeout
        }
      );

      const processingTime = Date.now() - startTime;

      // 验证API响应
      if (!response.data || !response.data.success) {
        throw new Error(`外部算法API返回错误: ${response.data?.message || '未知错误'}`);
      }

      // 格式化返回结果，确保与原有接口兼容
      const algorithmResult = response.data.data;

      return {
        question,
        timestamp: new Date(),
        method,
        params,
        hexagrams: algorithmResult.hexagrams || {
          ben: { id: 1, name: '待算法实现', upperGua: {}, lowerGua: {}, lines: [] },
          hu: { id: 1, name: '待算法实现', upperGua: {}, lowerGua: {}, lines: [] },
          bian: { id: 1, name: '待算法实现', upperGua: {}, lowerGua: {}, lines: [] }
        },
        analysis: algorithmResult.analysis || {
          wuxing: {
            ben: '待分析',
            hu: '待分析',
            bian: '待分析',
            relationships: {},
            fortune: '待算法实现',
            timing: '待算法实现'
          },
          fortune: '待算法实现',
          timing: '待算法实现'
        },
        interpretation: algorithmResult.interpretation || {
          summary: '专业算法正在开发中，敬请期待。',
          detailed: '梅花易数专业算法团队正在精心开发中，将为您提供最准确的占卜解读。',
          advice: '请耐心等待专业算法上线。',
          timing: '算法开发完成后将提供精准时机分析。'
        },
        metadata: {
          processingTime,
          algorithmVersion: algorithmResult.metadata?.algorithmVersion || 'external-v1.0',
          apiProvider: 'external-algorithm-service',
          isExternal: true,
          note: '调用外部专业算法API'
        }
      };

    } catch (error) {
      this.algorithmConfig.debug('外部算法API调用失败', {
        error: error.message,
        stack: error.stack
      });

      // 如果启用了降级模式，返回占位结果
      if (this.algorithmConfig.isFallbackEnabled()) {
        console.warn('外部算法API调用失败，使用降级模式:', error.message);

        return this.generatePlaceholderResult(question, method, params, {
          error: error.message,
          fallback: true,
          fallbackMode: this.algorithmConfig.getFallbackMode()
        });
      } else {
        // 如果未启用降级模式，抛出错误
        throw new Error(`外部算法API调用失败: ${error.message}`);
      }
    }
  }

  /**
   * 生成占位结果（当外部API不可用时）
   * @param {string} question - 占卜问题
   * @param {string} method - 起卦方法
   * @param {Object} params - 起卦参数
   * @param {Object} metadata - 元数据
   * @returns {Object} 占位结果
   */
  /**
   * 生成降级结果（当算法失败时使用）
   * @param {string} question - 占卜问题
   * @param {string} method - 起卦方法
   * @param {Object} params - 起卦参数
   * @param {Object} metadata - 元数据
   * @returns {Object} 降级结果
   */
  generateFallbackResult(question, method, params, metadata = {}) {
    return this.generatePlaceholderResult(question, method, params, {
      ...metadata,
      fallback: true,
      fallbackMode: metadata.fallbackMode || 'placeholder'
    });
  }

  generatePlaceholderResult(question, method, params, metadata = {}) {
    return {
      question,
      timestamp: new Date(),
      method,
      params,
      hexagrams: {
        ben: {
          id: 1,
          name: '乾为天',
          upperGua: { name: '乾', symbol: '☰', element: '金' },
          lowerGua: { name: '乾', symbol: '☰', element: '金' },
          lines: [1, 1, 1, 1, 1, 1]
        },
        hu: {
          id: 1,
          name: '乾为天',
          upperGua: { name: '乾', symbol: '☰', element: '金' },
          lowerGua: { name: '乾', symbol: '☰', element: '金' },
          lines: [1, 1, 1, 1, 1, 1]
        },
        bian: {
          id: 2,
          name: '坤为地',
          upperGua: { name: '坤', symbol: '☷', element: '土' },
          lowerGua: { name: '坤', symbol: '☷', element: '土' },
          lines: [0, 0, 0, 0, 0, 0]
        }
      },
      analysis: {
        wuxing: {
          ben: '金',
          hu: '金',
          bian: '土',
          relationships: {
            benToHu: { type: 'same', meaning: '同' },
            benToBian: { type: 'generation', meaning: '生' },
            huToBian: { type: 'generation', meaning: '生' }
          },
          fortune: '中吉',
          timing: '当前时机适中'
        },
        fortune: '中吉',
        timing: '当前时机适中'
      },
      interpretation: {
        summary: '专业梅花易数算法正在开发中。当前显示的是示例结果，仅供参考。',
        detailed: '我们正在与专业的梅花易数算法团队合作，开发最准确的占卜系统。完成后将为您提供基于正宗梅花易数理论的精准解读。',
        advice: '请耐心等待专业算法上线，届时将为您提供更准确的指导建议。',
        timing: '专业算法完成后，将提供精确的时机分析和建议。'
      },
      metadata: {
        processingTime: 50,
        algorithmVersion: 'placeholder-v1.0',
        isPlaceholder: true,
        note: '占位结果 - 等待专业算法实现',
        ...metadata
      }
    };
  }
}

module.exports = DivinationService;
