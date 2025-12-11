/**
 * 梅花心易 - 占卜API控制器
 * 处理占卜相关的HTTP请求和响应
 */

const { body, param, query, validationResult } = require('express-validator');
const DivinationService = require('../services/divination.service');
const DivinationInterpretationService = require('../services/divinationInterpretation.service');
const logger = require('../utils/logger');

/**
 * 占卜控制器类
 */
class DivinationController {
  constructor() {
    this.divinationService = new DivinationService();
    this.interpretationService = new DivinationInterpretationService();
  }

  /**
   * 执行占卜
   * POST /api/divination/perform
   */
  async performDivination(req, res) {
    try {
      // 验证请求参数
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '请求参数验证失败',
          errors: errors.array()
        });
      }

      const { question, method, params } = req.body;
      const userId = req.user.id;

      // 构建选项
      const options = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        location: req.body.location || null
      };

      // 记录请求日志
      logger.info('占卜请求', {
        userId,
        question: question.substring(0, 50) + '...',
        method,
        ip: req.ip
      });

      // 执行占卜
      const result = await this.divinationService.performDivination(
        userId, question, method, params, { ...options, user: req.user }
      );

      // 记录成功日志
      logger.info('占卜完成', {
        userId,
        divinationId: result.data.id,
        fortune: result.data.wuxing?.fortune?.level || result.data.analysis?.fortune || '中平',
        processingTime: result.data.metadata.processingTime
      });

      res.json(result);

    } catch (error) {
      logger.error('占卜执行失败', {
        userId: req.user?.id,
        error: error.message,
        stack: error.stack
      });

      res.status(400).json({
        success: false,
        message: error.message,
        code: 'DIVINATION_ERROR'
      });
    }
  }

  /**
   * 获取占卜详情
   * GET /api/divination/:id
   */
  async getDivinationById(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '请求参数验证失败',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const userId = req.user.id;

      const result = await this.divinationService.getDivinationById(id, userId);

      res.json(result);

    } catch (error) {
      logger.error('获取占卜详情失败', {
        userId: req.user?.id,
        divinationId: req.params.id,
        error: error.message
      });

      res.status(404).json({
        success: false,
        message: error.message,
        code: 'DIVINATION_NOT_FOUND'
      });
    }
  }

  /**
   * 获取用户占卜历史
   * GET /api/divination/history
   */
  async getDivinationHistory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('占卜历史参数验证失败', {
          userId: req.user?.id,
          errors: errors.array(),
          query: req.query
        });
        return res.status(400).json({
          success: false,
          message: '请求参数验证失败',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 10, 50), // 最大50条
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        method: req.query.method,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder === 'asc' ? 1 : -1
      };

      const result = await this.divinationService.getUserDivinationHistory(userId, options);

      res.json(result);

    } catch (error) {
      logger.error('获取占卜历史失败', {
        userId: req.user?.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        message: error.message,
        code: 'HISTORY_ERROR'
      });
    }
  }

  /**
   * 用户评价占卜结果
   * PUT /api/divination/:id/rating
   */
  async rateDivination(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '请求参数验证失败',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const userId = req.user.id;
      const ratingData = req.body;

      const result = await this.divinationService.rateDivination(id, userId, ratingData);

      logger.info('占卜评价提交', {
        userId,
        divinationId: id,
        rating: ratingData.overall
      });

      res.json(result);

    } catch (error) {
      logger.error('提交占卜评价失败', {
        userId: req.user?.id,
        divinationId: req.params.id,
        error: error.message
      });

      res.status(400).json({
        success: false,
        message: error.message,
        code: 'RATING_ERROR'
      });
    }
  }

  /**
   * 获取用户占卜统计
   * GET /api/divination/stats
   */
  async getDivinationStats(req, res) {
    try {
      const userId = req.user.id;

      const result = await this.divinationService.getUserDivinationStats(userId);

      res.json(result);

    } catch (error) {
      logger.error('获取占卜统计失败', {
        userId: req.user?.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        message: error.message,
        code: 'STATS_ERROR'
      });
    }
  }

  /**
   * 测试专用占卜接口（无需认证）
   * POST /api/divination/test
   */
  async testDivination(req, res) {
    try {
      // 验证请求参数
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '请求参数验证失败',
          errors: errors.array()
        });
      }

      const { question, method, params } = req.body;

      // 构建选项
      const options = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        location: req.body.location || null,
        testMode: true // 标记为测试模式
      };

      // 记录测试请求日志
      logger.info('测试占卜请求', {
        question: question.substring(0, 50) + '...',
        method,
        ip: req.ip
      });

      // 直接调用外部算法API，不保存到数据库
      const result = await this.divinationService.callExternalAlgorithmAPI(
        question, method, params, options
      );

      // 记录成功日志
      logger.info('测试占卜完成', {
        fortune: result.wuxing?.fortune?.level || result.analysis?.fortune || '中平',
        processingTime: result.metadata.processingTime
      });

      // ✅ 方案A：AI解读异步生成（不阻塞响应）
      // 立即返回基础占卜结果，让动画快速开始
      const divinationId = result.id || `test_${Date.now()}`;
      
      res.json({
        success: true,
        data: {
          ...result,
          id: divinationId,
          aiInterpretation: null, // 初始为null，后台生成
          aiInterpretationStatus: 'generating', // 标记为正在生成
          testMode: true,
          notice: '这是测试模式，结果不会保存到数据库，AI解读正在后台生成'
        }
      });

      // 后台异步生成AI解读（不阻塞响应）
      setImmediate(async () => {
        try {
          logger.info('开始后台生成AI解读', {
            question: question.substring(0, 50) + '...',
            mainHexagram: result.hexagrams?.ben?.name || '未知'
          });

          const interpretationResult = await this.interpretationService.generateAIInterpretation(
            result,
            { 
              temperature: 0.8, 
              maxTokens: 2000 
            }
          );
          
          if (interpretationResult.success) {
            logger.info('✅ AI解读生成成功（异步）', {
              divinationId: divinationId,
              interpretationLength: interpretationResult.data.content?.length || 0
            });
          } else {
            logger.warn('AI解读生成失败（异步）', {
              error: interpretationResult.error
            });
          }
        } catch (aiError) {
          logger.error('AI解读生成异常（异步）', {
            error: aiError.message,
            stack: aiError.stack
          });
        }
      });

    } catch (error) {
      logger.error('测试占卜执行失败', {
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: '占卜执行失败',
        code: 'DIVINATION_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 生成AI解读
   * POST /api/divination/:id/interpretation
   */
  async generateAIInterpretation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '请求参数验证失败',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const userId = req.user.id;

      // 记录请求日志
      logger.info('AI解读请求', {
        userId,
        divinationId: id,
        ip: req.ip,
        isTempId: id.startsWith('div_') || id.startsWith('temp_') || id.startsWith('dev_')
      });

      let divination = null;

      // 处理不同类型的ID
      if (id.startsWith('div_') || id.startsWith('temp_') || id.startsWith('dev_')) {
        // 临时ID：从前端请求体获取占卜数据
        const { divinationData } = req.body;

        if (!divinationData) {
          return res.status(400).json({
            success: false,
            message: '临时ID需要提供占卜数据',
            code: 'MISSING_DIVINATION_DATA'
          });
        }

        // 构建占卜数据对象
        divination = {
          success: true,
          data: {
            id: id,
            userId: userId,
            question: divinationData.question,
            method: divinationData.method || 'time',
            hexagrams: divinationData.hexagrams || {},
            movingLine: divinationData.movingLine,
            analysis: divinationData.analysis || {},
            interpretation: divinationData.interpretation || {},
            aiInterpretation: null,
            aiInterpretationStatus: 'pending',
            timestamp: divinationData.timestamp || new Date().toISOString(),
            metadata: {
              isTemp: true,
              originalId: id
            }
          }
        };

        logger.info('使用前端提供的占卜数据', {
          divinationId: id,
          question: divination.data.question?.substring(0, 50) + '...'
        });
      } else {
        // 正常MongoId：从数据库获取
        divination = await this.divinationService.getDivinationById(id, userId);

        if (!divination.success) {
          return res.status(404).json({
            success: false,
            message: '占卜记录不存在',
            code: 'DIVINATION_NOT_FOUND'
          });
        }

        // 检查是否已有AI解读
        if (divination.data.aiInterpretation) {
          return res.json({
            success: true,
            message: 'AI解读已存在',
            data: {
              aiInterpretation: divination.data.aiInterpretation,
              aiInterpretationStatus: 'completed'
            }
          });
        }
      }

      // 生成AI解读
      const interpretationResult = await this.interpretationService.generateAIInterpretation(
        divination.data,
        {
          temperature: 0.7,
          maxTokens: 4000
        }
      );

      if (interpretationResult.success) {
        // 只有非临时ID才更新数据库
        if (!id.startsWith('div_') && !id.startsWith('temp_') && !id.startsWith('dev_')) {
          try {
            await this.divinationService.updateAIInterpretation(id, userId, interpretationResult.data);
          } catch (dbError) {
            logger.warn('更新数据库AI解读失败', {
              error: dbError.message,
              divinationId: id
            });
          }
        }

        // 记录成功日志
        logger.info('AI解读生成成功', {
          userId,
          divinationId: id,
          interpretationLength: interpretationResult.data.content?.length || 0,
          isTempId: id.startsWith('div_') || id.startsWith('temp_') || id.startsWith('dev_')
        });

        res.json({
          success: true,
          message: 'AI解读生成成功',
          data: {
            aiInterpretation: interpretationResult.data,
            aiInterpretationStatus: 'completed'
          }
        });
      } else {
        // 记录失败日志
        logger.error('AI解读生成失败', {
          userId,
          divinationId: id,
          error: interpretationResult.error,
          isTempId: id.startsWith('div_') || id.startsWith('temp_') || id.startsWith('dev_')
        });

        // 返回降级解读而不是错误
        const fallbackInterpretation = await this.interpretationService.generateFallbackInterpretation(divination.data);

        res.json({
          success: true,
          message: 'AI解读服务暂不可用，已提供基础解读',
          data: {
            aiInterpretation: fallbackInterpretation,
            aiInterpretationStatus: 'fallback'
          }
        });
      }

    } catch (error) {
      logger.error('AI解读处理失败', {
        userId: req.user?.id,
        divinationId: req.params.id,
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: '服务器内部错误',
        code: 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

/**
 * 请求验证规则
 */
const validationRules = {
  // 执行占卜验证
  performDivination: [
    body('question')
      .isString()
      .isLength({ min: 1, max: 200 })
      .withMessage('问题必须是1-200个字符的字符串')
      .trim(),
    
    body('method')
      .isIn(['time', 'number', 'manual'])
      .withMessage('起卦方法必须是time、number或manual'),
    
    body('params')
      .isObject()
      .withMessage('参数必须是对象'),
    
    // 时间起卦参数验证
    body('params.datetime')
      .if(body('method').equals('time'))
      .optional()
      .isISO8601()
      .withMessage('时间格式必须是ISO8601'),
    
    // 数字起卦参数验证
    body('params.numbers')
      .if(body('method').equals('number'))
      .isArray({ min: 2 })
      .withMessage('数字起卦需要至少2个数字'),
    
    body('params.numbers.*')
      .if(body('method').equals('number'))
      .isInt({ min: 1 })
      .withMessage('数字必须是正整数'),
    
    // 手动起卦参数验证
    body('params.upperGua')
      .if(body('method').equals('manual'))
      .isInt({ min: 1, max: 8 })
      .withMessage('上卦必须是1-8的整数'),
    
    body('params.lowerGua')
      .if(body('method').equals('manual'))
      .isInt({ min: 1, max: 8 })
      .withMessage('下卦必须是1-8的整数'),
    
    body('params.movingLine')
      .if(body('method').equals('manual'))
      .isInt({ min: 1, max: 6 })
      .withMessage('动爻必须是1-6的整数'),
    
    body('location')
      .optional()
      .isObject()
      .withMessage('位置信息必须是对象')
  ],

  // 获取占卜详情验证
  getDivinationById: [
    param('id')
      .isMongoId()
      .withMessage('占卜ID格式无效')
  ],

  // 生成AI解读验证
  generateAIInterpretation: [
    param('id')
      .isString()
      .withMessage('占卜ID必须是字符串')
      .isLength({ min: 1 })
      .withMessage('占卜ID不能为空')
      .custom((value) => {
        // 支持MongoId格式和临时ID格式
        const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
        const tempIdPattern = /^(div_|temp_|dev_)/;
        return mongoIdPattern.test(value) || tempIdPattern.test(value);
      })
      .withMessage('占卜ID格式无效，应为MongoId或临时ID')
  ],

  // 获取历史记录验证
  getDivinationHistory: [
    query('page')
      .optional({ nullable: true, checkFalsy: true })
      .toInt()
      .isInt({ min: 1 })
      .withMessage('页码必须是正整数'),
    
    query('limit')
      .optional({ nullable: true, checkFalsy: true })
      .toInt()
      .isInt({ min: 1, max: 50 })
      .withMessage('每页数量必须是1-50的整数'),
    
    query('startDate')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isISO8601()
      .withMessage('开始日期格式无效'),
    
    query('endDate')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isISO8601()
      .withMessage('结束日期格式无效'),
    
    query('method')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isIn(['time', 'number', 'manual'])
      .withMessage('起卦方法必须是time、number或manual'),
    
    query('sortBy')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isIn(['createdAt', 'question', 'method'])
      .withMessage('排序字段无效'),
    
    query('sortOrder')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isIn(['asc', 'desc'])
      .withMessage('排序方向必须是asc或desc')
  ],

  // 评价占卜验证
  rateDivination: [
    param('id')
      .isMongoId()
      .withMessage('占卜ID格式无效'),
    
    body('overall')
      .isInt({ min: 1, max: 5 })
      .withMessage('总体评分必须是1-5的整数'),
    
    body('accuracy')
      .isInt({ min: 1, max: 5 })
      .withMessage('准确性评分必须是1-5的整数'),
    
    body('helpfulness')
      .isInt({ min: 1, max: 5 })
      .withMessage('有用性评分必须是1-5的整数'),
    
    body('feedback')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('反馈内容不能超过500个字符')
      .trim()
  ],

  // 测试占卜验证（与performDivination相同，但无需认证）
  testDivination: [
    body('question')
      .isString()
      .isLength({ min: 1, max: 200 })
      .withMessage('问题必须是1-200个字符的字符串')
      .trim(),

    body('method')
      .isIn(['time', 'number', 'manual'])
      .withMessage('起卦方法必须是time、number或manual'),

    body('params')
      .isObject()
      .withMessage('参数必须是对象'),

    // 时间起卦参数验证
    body('params.datetime')
      .if(body('method').equals('time'))
      .optional()
      .isISO8601()
      .withMessage('时间格式必须是ISO8601'),

    // 数字起卦参数验证
    body('params.numbers')
      .if(body('method').equals('number'))
      .isArray({ min: 2 })
      .withMessage('数字起卦需要至少两个数字'),

    body('params.numbers.*')
      .if(body('method').equals('number'))
      .isInt({ min: 1 })
      .withMessage('数字必须是正整数'),

    // 手动起卦参数验证
    body('params.upperGua')
      .if(body('method').equals('manual'))
      .isInt({ min: 1, max: 8 })
      .withMessage('上卦序号必须是1-8的整数'),

    body('params.lowerGua')
      .if(body('method').equals('manual'))
      .isInt({ min: 1, max: 8 })
      .withMessage('下卦序号必须是1-8的整数'),

    body('params.movingLine')
      .if(body('method').equals('manual'))
      .isInt({ min: 1, max: 6 })
      .withMessage('动爻位置必须是1-6的整数')
  ]
};

// 创建控制器实例
const divinationController = new DivinationController();

module.exports = {
  divinationController,
  validationRules
};
