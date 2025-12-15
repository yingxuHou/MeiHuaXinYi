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
    const logger = require('../utils/logger');

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
    let algorithmResult;

    try {
      // 1. 验证用户权限
      await this.validateUserPermission(userId, null);
      logger.info('用户权限验证通过', { userId });

      // 2. 调用本地专业算法，增加异常处理
      try {
        algorithmResult = await algorithmManager.performDivination(question, {
          method,
          params,
          user: options.user
        });
        logger.info('算法调用成功', {
          userId,
          question: question.substring(0, 30) + '...',
          hasAnalysis: !!algorithmResult.analysis,
          hasInterpretation: !!algorithmResult.interpretation
        });
      } catch (algorithmError) {
        logger.error('算法调用失败，使用降级方案', {
          userId,
          error: algorithmError.message,
          stack: algorithmError.stack
        });

        // 算法失败时生成降级结果
        algorithmResult = this.generateFallbackDivinationResult(question, method, params);
      }

      // 3. 构建数据库记录，添加数据验证和错误处理
      let divinationRecord;
      try {
        divinationRecord = await this.createDivinationRecord(
          userId, algorithmResult, options, null, false
        );
        logger.info('数据库记录创建成功', {
          userId,
          divinationId: divinationRecord._id
        });
      } catch (dbError) {
        logger.error('数据库记录创建失败，尝试修复数据', {
          userId,
          error: dbError.message,
          validationErrors: dbError.errors
        });

        // 如果是数据验证错误，尝试修复数据后重新保存
        if (dbError.name === 'ValidationError') {
          const repairedResult = this.repairAlgorithmResult(algorithmResult, dbError);
          divinationRecord = await this.createDivinationRecord(
            userId, repairedResult, options, null, true  // 标记为重试调用
          );
          logger.info('数据修复成功，重新保存成功', { userId });
        } else {
          throw dbError; // 非验证错误，直接抛出
        }
      }

      // 4. 更新用户统计
      try {
        await this.updateUserStats(userId, null);
        logger.info('用户统计更新成功', { userId });
      } catch (statsError) {
        logger.warn('用户统计更新失败（不影响主流程）', {
          userId,
          error: statsError.message
        });
      }

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
      logger.error('占卜执行失败', {
        userId,
        question: question.substring(0, 30) + '...',
        error: error.message,
        stack: error.stack
      });

      // 确保所有错误都有明确的错误信息
      if (error.message.includes('validation failed')) {
        throw new Error('占卜数据验证失败，请稍后重试');
      } else if (error.message.includes('用户不存在')) {
        throw new Error('用户信息验证失败，请重新登录');
      } else if (error.message.includes('免费占卜次数')) {
        throw new Error(error.message); // 直接传递免费次数限制信息
      } else {
        throw new Error('占卜服务暂时不可用，请稍后重试');
      }
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
      // 如果是开发模式的ID，返回模拟数据
      if (divinationId.startsWith('dev_')) {
        // 返回一个模拟的占卜记录
        return {
          success: true,
          data: {
            id: divinationId,
            question: '开发模式占卜问题',
            method: 'time',
            hexagrams: {
              ben: { name: '乾为天', id: 1 },
              hu: { name: '坤为地', id: 2 },
              bian: { name: '泽天夬', id: 43 }
            },
            movingLine: 4,
            analysis: {
              wuxing: {
                ben: '金',
                hu: '土',
                relationships: {},
                fortune: '大吉'
              },
              fortune: '大吉',
              timing: '时机适宜'
            },
            interpretation: {
              summary: '开发模式解读',
              detailed: '这是一个开发模式的占卜解读',
              advice: '建议继续开发'
            },
            userRating: null,
            aiInterpretation: null,
            aiInterpretationStatus: 'pending',
            createdAt: new Date(),
            metadata: {
              processingTime: 50,
              algorithmVersion: 'dev-v1.0',
              isDev: true
            }
          }
        };
      }

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
   * @param {boolean} isRetry - 是否为重试调用
   * @returns {Object} 占卜记录
   */
  async createDivinationRecord(userId, algorithmResult, options, session, isRetry = false) {
    try {
      // 数据完整性检查和填充
      const completeAnalysis = this.ensureCompleteAnalysis(algorithmResult.analysis);
      const completeInterpretation = this.ensureCompleteInterpretation(algorithmResult.interpretation, algorithmResult.analysis);
      const completeHexagrams = this.ensureCompleteHexagrams(algorithmResult.hexagrams);

      const divinationData = {
        userId,
        question: algorithmResult.question || '占卜问题',
        method: algorithmResult.method || 'time',
        hexagrams: completeHexagrams,
        movingLine: algorithmResult.movingLine || 1,
        analysis: completeAnalysis,
        interpretation: completeInterpretation,
        metadata: {
          processingTime: algorithmResult.metadata?.processingTime || 0,
          algorithmVersion: algorithmResult.metadata?.algorithmVersion || 'v2.0',
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
          location: options.location
        }
      };

      const divination = new Divination(divinationData);
      const saveOptions = session ? { session } : {};
      return await divination.save(saveOptions);
    } catch (saveError) {
      // 如果已经是重试调用，直接抛出错误避免无限递归
      if (isRetry) {
        throw new Error(`数据库验证失败，无法修复: ${saveError.message}`);
      }
      throw saveError;
    }
  }

  /**
   * 更新AI解读
   * @param {string} divinationId - 占卜ID
   * @param {string} userId - 用户ID
   * @param {Object} aiInterpretation - AI解读数据
   * @returns {Object} 更新结果
   */
  async updateAIInterpretation(divinationId, userId, aiInterpretation) {
    try {
      // 如果是开发模式的占卜记录，直接返回成功
      if (divinationId.startsWith('dev_')) {
        return {
          success: true,
          message: '开发模式：AI解读更新成功（虚拟）',
          data: aiInterpretation
        };
      }

      // 更新数据库中的占卜记录
      const divination = await Divination.findOneAndUpdate(
        {
          _id: divinationId,
          userId: userId
        },
        {
          $set: {
            'aiInterpretation': aiInterpretation,
            'aiInterpretationStatus': 'completed',
            'aiInterpretationCreatedAt': new Date()
          }
        },
        { new: true }
      );

      if (!divination) {
        throw new Error('占卜记录不存在或无权访问');
      }

      return {
        success: true,
        message: 'AI解读更新成功',
        data: aiInterpretation
      };

    } catch (error) {
      throw new Error(`更新AI解读失败: ${error.message}`);
    }
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
   * 确保分析数据的完整性
   * @param {Object} analysis - 原始分析数据
   * @returns {Object} 完整的分析数据
   */
  ensureCompleteAnalysis(analysis) {
    const wuxing = analysis?.wuxing || {};

    return {
      wuxing: {
        ben: wuxing.ben || '金',
        hu: wuxing.hu || '金',
        bian: wuxing.bian || '土',
        relationships: {
          benToHu: wuxing.relationships?.benToHu || {
            type: 'same',
            strength: 'neutral',
            meaning: '同',
            description: '体用相同，关系平和'
          },
          benToBian: wuxing.relationships?.benToBian || {
            type: 'generation',
            strength: 'neutral',
            meaning: '生',
            description: '体生变卦，利于发展'
          },
          huToBian: wuxing.relationships?.huToBian || {
            type: 'generation',
            strength: 'neutral',
            meaning: '生',
            description: '用生变卦，过程顺利'
          }
        },
        fortune: wuxing.fortune || '中吉',
        timing: wuxing.timing || '时机平和',
        favorableElements: wuxing.favorableElements || ['金'],
        unfavorableElements: wuxing.unfavorableElements || ['木']
      },
      compatibility: analysis?.compatibility || 0.5,
      elements: {
        favorable: analysis?.elements?.favorable || ['金'],
        unfavorable: analysis?.elements?.unfavorable || ['木'],
        neutral: analysis?.elements?.neutral || ['土']
      }
    };
  }

  /**
   * 确保解读数据的完整性
   * @param {Object} interpretation - 原始解读数据
   * @param {Object} analysis - 分析数据
   * @returns {Object} 完整的解读数据
   */
  ensureCompleteInterpretation(interpretation, analysis) {
    const wuxingTiming = analysis?.wuxing?.timing || '时机平和';

    return {
      summary: interpretation?.summary || '占卜结果显示需要谨慎行事',
      detailed: interpretation?.detailed || '根据当前卦象分析，建议保持谨慎态度，多观察等待合适的时机行动。',
      advice: interpretation?.advice || '建议保持冷静，谨慎行事，不要急于做决定',
      timing: interpretation?.timing || wuxingTiming,
      precautions: interpretation?.precautions || '占卜结果仅供参考，实际决策需结合具体情况',
      aiGenerated: interpretation?.aiGenerated !== undefined ? interpretation.aiGenerated : false,
      confidence: interpretation?.confidence || 0.7,
      promptUsed: interpretation?.promptUsed || 'professional_interpretation',
      model: interpretation?.model || 'claude-3-5-sonnet',
      tokensUsed: interpretation?.tokensUsed || 0
    };
  }

  /**
   * 确保卦象数据的完整性
   * @param {Object} hexagrams - 原始卦象数据
   * @returns {Object} 完整的卦象数据
   */
  ensureCompleteHexagrams(hexagrams) {
    const createDefaultBagua = (number, name, symbol, element, nature) => ({
      number: number || 1,
      name: name || '乾',
      symbol: symbol || '☰',
      element: element || '金',
      nature: nature || '天',
      direction: this.getBaguaDirection(name || '乾'),
      attributes: {
        family: '父',
        body: '首',
        animal: '马',
        color: '大赤',
        season: '秋'
      }
    });

    const createDefaultHexagram = (id, name, lines) => {
      // 确保lines是正确的格式
      const validLines = (lines && Array.isArray(lines) && lines.length === 6)
        ? lines.map(line => line === 0 || line === 1 ? line : 1)
        : [1, 1, 1, 1, 1, 1];

      // 根据卦名或ID确定上下卦
      const hexagramInfo = this.getHexagramInfo(id, name);

      return {
        id: (id && id >= 1 && id <= 64) ? id : 1,
        name: name || '乾为天',
        upperGua: createDefaultBagua(
          hexagramInfo.upperNumber,
          hexagramInfo.upperName,
          hexagramInfo.upperSymbol,
          hexagramInfo.upperElement,
          hexagramInfo.upperNature
        ),
        lowerGua: createDefaultBagua(
          hexagramInfo.lowerNumber,
          hexagramInfo.lowerName,
          hexagramInfo.lowerSymbol,
          hexagramInfo.lowerElement,
          hexagramInfo.lowerNature
        ),
        lines: validLines,
        traditional: {
          judgment: '元亨利贞',
          image: '天行健，君子以自强不息',
          meaning: '刚健中正，纯粹精也'
        }
      };
    };

    return {
      ben: hexagrams?.ben ? createDefaultHexagram(
        hexagrams.ben.id,
        hexagrams.ben.name,
        hexagrams.ben.lines
      ) : createDefaultHexagram(1, '乾为天', [1, 1, 1, 1, 1, 1]),

      hu: hexagrams?.hu ? createDefaultHexagram(
        hexagrams.hu.id,
        hexagrams.hu.name,
        hexagrams.hu.lines
      ) : createDefaultHexagram(11, '地天泰', [0, 0, 0, 1, 1, 1]),

      bian: hexagrams?.bian ? createDefaultHexagram(
        hexagrams.bian.id,
        hexagrams.bian.name,
        hexagrams.bian.lines
      ) : createDefaultHexagram(2, '坤为地', [0, 0, 0, 0, 0, 0])
    };
  }

  /**
   * 获取八卦的方向属性
   * @param {string} baguaName - 八卦名称
   * @returns {string} 方向
   */
  getBaguaDirection(baguaName) {
    const directions = {
      '乾': '西北',
      '兑': '西',
      '离': '南',
      '震': '东',
      '巽': '东南',
      '坎': '北',
      '艮': '东北',
      '坤': '西南'
    };
    return directions[baguaName] || '西北';
  }

  /**
   * 获取六十四卦的信息，用于创建完整的卦象数据
   * @param {number} id - 卦象ID
   * @param {string} name - 卦象名称
   * @returns {Object} 卦象信息
   */
  getHexagramInfo(id, name) {
    // 六十四卦信息映射表（部分常用卦）
    const hexagramMap = {
      1: { name: '乾为天', upperName: '乾', lowerName: '乾', upperNumber: 1, lowerNumber: 1, symbol: '☰', element: '金', nature: '天' },
      2: { name: '坤为地', upperName: '坤', lowerName: '坤', upperNumber: 8, lowerNumber: 8, symbol: '☷', element: '土', nature: '地' },
      11: { name: '地天泰', upperName: '坤', lowerName: '乾', upperNumber: 8, lowerNumber: 1, symbol: '☷/☰', element: '土', nature: '地天' },
      12: { name: '天地否', upperName: '乾', lowerName: '坤', upperNumber: 1, lowerNumber: 8, symbol: '☰/☷', element: '金', nature: '天地' }
    };

    const info = hexagramMap[id] || hexagramMap[1];

    return {
      upperName: info.upperName,
      lowerName: info.lowerName,
      upperNumber: info.upperNumber,
      lowerNumber: info.lowerNumber,
      upperSymbol: info.upperName === '乾' ? '☰' : info.upperName === '坤' ? '☷' : '☰',
      lowerSymbol: info.lowerName === '乾' ? '☰' : info.lowerName === '坤' ? '☷' : '☰',
      upperElement: this.getBaguaElement(info.upperName),
      lowerElement: this.getBaguaElement(info.lowerName),
      upperNature: info.upperName,
      lowerNature: info.lowerName
    };
  }

  /**
   * 获取八卦的五行属性
   * @param {string} baguaName - 八卦名称
   * @returns {string} 五行属性
   */
  getBaguaElement(baguaName) {
    const elements = {
      '乾': '金',
      '兑': '金',
      '离': '火',
      '震': '木',
      '巽': '木',
      '坎': '水',
      '艮': '土',
      '坤': '土'
    };
    return elements[baguaName] || '金';
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

  /**
   * 生成算法失败时的降级占卜结果
   * @param {string} question - 占卜问题
   * @param {string} method - 起卦方法
   * @param {Object} params - 起卦参数
   * @returns {Object} 降级占卜结果
   */
  generateFallbackDivinationResult(question, method, params) {
    const fallbackResult = this.generatePlaceholderResult(question, method, params, {
      fallback: true,
      fallbackMode: 'algorithm-failure',
      error: '算法执行失败，使用降级方案'
    });

    // 确保数据结构完整
    return {
      ...fallbackResult,
      analysis: this.ensureCompleteAnalysis(fallbackResult.analysis),
      interpretation: this.ensureCompleteInterpretation(fallbackResult.interpretation, fallbackResult.analysis),
      hexagrams: this.ensureCompleteHexagrams(fallbackResult.hexagrams),
      movingLine: fallbackResult.movingLine || 1
    };
  }

  /**
   * 修复算法结果中的数据验证错误
   * @param {Object} algorithmResult - 原始算法结果
   * @param {Error} validationError - 验证错误
   * @returns {Object} 修复后的算法结果
   */
  repairAlgorithmResult(algorithmResult, validationError) {
    const logger = require('../utils/logger');

    logger.info('开始修复算法结果数据', {
      missingFields: validationError.errors ? Object.keys(validationError.errors) : 'unknown'
    });

    // 创建修复后的结果
    const repairedResult = {
      ...algorithmResult,
      question: algorithmResult.question || '占卜问题',
      method: algorithmResult.method || 'time',
      movingLine: algorithmResult.movingLine || 1,
      timestamp: algorithmResult.timestamp || new Date(),
      metadata: {
        processingTime: algorithmResult.metadata?.processingTime || 0,
        algorithmVersion: algorithmResult.metadata?.algorithmVersion || 'v2.0',
        repaired: true,
        originalError: validationError.message,
        ...algorithmResult.metadata
      }
    };

    // 确保所有必需的数据结构都存在且完整
    repairedResult.analysis = this.ensureCompleteAnalysis(algorithmResult.analysis);
    repairedResult.interpretation = this.ensureCompleteInterpretation(algorithmResult.interpretation, repairedResult.analysis);
    repairedResult.hexagrams = this.ensureCompleteHexagrams(algorithmResult.hexagrams);

    logger.info('算法结果数据修复完成', {
      hasAnalysis: !!repairedResult.analysis,
      hasInterpretation: !!repairedResult.interpretation,
      hasHexagrams: !!repairedResult.hexagrams
    });

    return repairedResult;
  }

  generatePlaceholderResult(question, method, params, metadata = {}) {
    // 使用修复后的卦象创建方法
    const completeHexagrams = this.ensureCompleteHexagrams({
      ben: { id: 1, name: '乾为天', lines: [1, 1, 1, 1, 1, 1] },
      hu: { id: 11, name: '地天泰', lines: [0, 0, 0, 1, 1, 1] },
      bian: { id: 2, name: '坤为地', lines: [0, 0, 0, 0, 0, 0] }
    });

    return {
      question,
      timestamp: new Date(),
      method,
      params,
      hexagrams: completeHexagrams,
      analysis: {
        wuxing: {
          ben: '金',
          hu: '金',
          bian: '土',
          relationships: {
            benToHu: { type: 'same', strength: 'neutral', meaning: '同', description: '体用相同，关系平和' },
            benToBian: { type: 'generation', strength: 'neutral', meaning: '生', description: '体生变卦，利于发展' },
            huToBian: { type: 'generation', strength: 'neutral', meaning: '生', description: '用生变卦，过程顺利' }
          },
          fortune: '中吉',
          timing: '当前时机适中',
          favorableElements: ['金'],
          unfavorableElements: ['木']
        },
        fortune: '中吉',
        timing: '当前时机适中'
      },
      interpretation: {
        summary: '专业梅花易数算法正在开发中。当前显示的是示例结果，仅供参考。',
        detailed: '我们正在与专业的梅花易数算法团队合作，开发最准确的占卜系统。完成后将为您提供基于正宗梅花易数理论的精准解读。',
        advice: '请耐心等待专业算法上线，届时将为您提供更准确的指导建议。',
        timing: '专业算法完成后，将提供精确的时机分析和建议。',
        precautions: '占卜结果仅供参考，实际决策需结合具体情况',
        aiGenerated: false,
        confidence: 0.5,
        promptUsed: 'professional_interpretation',
        model: 'placeholder',
        tokensUsed: 0
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
