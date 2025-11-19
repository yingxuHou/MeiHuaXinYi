/**
 * 梅花心易 - 增强版占卜API控制器
 * 集成DeepSeek AI解读功能
 */

const { body, param, query, validationResult } = require('express-validator');
const DivinationService = require('../services/divination.service');
const DivinationInterpretationService = require('../services/divinationInterpretation.service');
const logger = require('../utils/logger');

/**
 * 增强版占卜控制器类
 */
class EnhancedDivinationController {
  constructor() {
    this.divinationService = new DivinationService();
    this.interpretationService = new DivinationInterpretationService();
  }

  /**
   * 执行占卜并生成AI解读
   * POST /api/divination/perform-with-ai
   */
  async performDivinationWithAI(req, res) {
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

      const { question, method, params, aiOptions } = req.body;
      const userId = req.user.id;

      // 构建选项
      const options = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        location: req.body.location || null,
        user: req.user
      };

      // 记录请求日志
      logger.info('AI占卜请求', {
        userId,
        question: question.substring(0, 50) + '...',
        method,
        ip: req.ip
      });

      // 执行占卜
      const divinationResult = await this.divinationService.performDivination(
        userId,
        question,
        method,
        params,
        options
      );

      if (!divinationResult.success) {
        return res.status(500).json({
          success: false,
          message: '占卜执行失败',
          error: divinationResult.error
        });
      }

      // 生成AI解读
      let aiInterpretation = null;
      try {
        const interpretationResult = await this.interpretationService.generateAIInterpretation(
          divinationResult.data,
          aiOptions || {}
        );

        if (interpretationResult.success) {
          aiInterpretation = interpretationResult.data;
          logger.info('AI解读生成成功', {
            userId,
            divinationId: divinationResult.data.id,
            interpretationLength: aiInterpretation.content.length
          });
        } else {
          logger.warn('AI解读生成失败，使用降级解读', {
            userId,
            error: interpretationResult.error
          });
          aiInterpretation = interpretationResult.data; // 降级解读
        }
      } catch (error) {
        logger.error('AI解读服务异常', {
          userId,
          error: error.message
        });
        // 继续返回占卜结果，但不包含AI解读
      }

      // 构建响应
      const response = {
        ...divinationResult.data,
        aiInterpretation: aiInterpretation
      };

      // 记录成功日志
      logger.info('AI占卜完成', {
        userId,
        divinationId: divinationResult.data.id,
        hasAIInterpretation: !!aiInterpretation,
        processingTime: Date.now() - req.startTime
      });

      res.json({
        success: true,
        data: response,
        message: '占卜和AI解读完成'
      });

    } catch (error) {
      logger.error('AI占卜请求处理失败', {
        userId: req.user?.id,
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
      });
    }
  }

  /**
   * 为现有占卜结果生成AI解读（带性能监控和超时处理）
   * POST /api/divination/:id/interpretation
   */
  async generateInterpretation(req, res) {
    const controllerStartTime = Date.now();
    let dbQueryDuration = 0;
    let aiServiceDuration = 0;
    
    // 设置响应超时处理
    const responseTimeout = setTimeout(() => {
      logger.error('解读请求响应超时', {
        elapsed: Date.now() - controllerStartTime,
        divinationId: req.params.id,
        userId: req.user?.id
      });
      
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: '请求处理超时，请稍后重试',
          code: 'REQUEST_TIMEOUT'
        });
      }
    }, 200000); // 200秒超时，比AI服务稍长

    try {
      const { id } = req.params;
      const { customPrompt, options, divinationData } = req.body;
      const userId = req.user?.id;

      logger.info('开始处理AI解读请求', {
        divinationId: id,
        userId,
        hasCustomPrompt: !!customPrompt,
        hasDivinationData: !!divinationData,
        options: {
          temperature: options?.temperature,
          maxTokens: options?.maxTokens,
          service: options?.service
        }
      });

      // ✅ 优先使用前端传来的完整占卜数据（避免数据库查找）
      if (divinationData) {
        logger.info('使用前端传来的完整占卜数据', {
          question: divinationData.question?.substring(0, 50) + '...',
          mainHexagram: divinationData.hexagrams?.ben?.name
        });

        try {
          const aiServiceStart = Date.now();
          const interpretation = await this.interpretationService.generateAIInterpretation(
            divinationData,
            {
              ...options,
              timeout: 180000, // 确保AI服务有足够时间
              maxRetries: 2
            }
          );
          aiServiceDuration = Date.now() - aiServiceStart;

          clearTimeout(responseTimeout);
          
          const totalDuration = Date.now() - controllerStartTime;
          
          logger.info('AI解读请求完成（使用前端数据）', {
            totalDuration: `${totalDuration}ms`,
            aiServiceDuration: `${aiServiceDuration}ms`,
            success: interpretation.success
          });

          return res.json({
            success: true,
            data: interpretation.data,
            message: 'AI解读生成完成（使用真实数据）',
            performanceMetrics: {
              totalDuration,
              aiServiceDuration,
              dbQueryDuration
            }
          });
        } catch (error) {
          logger.error('基于传入数据生成AI解读失败', {
            error: error.message,
            code: error.code,
            isTimeout: error.code === 'ECONNABORTED'
          });
          throw error;
        }
      }

      // 如果没有提供数据，尝试从数据库获取
      let divinationResult;
      try {
        const dbQueryStart = Date.now();
        // 尝试获取真实的占卜结果
        const dbResult = await this.divinationService.getDivinationById(id, userId);
        dbQueryDuration = Date.now() - dbQueryStart;
        
        if (!dbResult.success) {
          throw new Error('占卜记录不存在');
        }
        
        divinationResult = dbResult.data;
        
        logger.info('数据库查询完成', {
          dbQueryDuration: `${dbQueryDuration}ms`,
          divinationId: id
        });
      } catch (error) {
        logger.warn('无法获取占卜结果，尝试使用模拟数据', {
          error: error.message,
          divinationId: id,
          dbQueryDuration: `${dbQueryDuration}ms`
        });
        
        clearTimeout(responseTimeout);
        
        // 使用模拟数据作为最后降级方案
        return res.status(400).json({
          success: false,
          message: '无法找到占卜数据。请确保已提供完整的占卜数据或访问正确的占卜记录。',
          suggestion: '建议在前端传递完整的占卜结果数据到 divinationData 参数',
          performanceMetrics: {
            totalDuration: Date.now() - controllerStartTime,
            dbQueryDuration,
            aiServiceDuration
          }
        });
      }

      // 使用从数据库获取的数据生成AI解读
      let interpretation;
      const aiServiceStart = Date.now();
      
      try {
        if (customPrompt) {
          // 自定义解读
          interpretation = await this.interpretationService.generateCustomInterpretation(
            divinationResult,
            customPrompt,
            {
              ...options,
              timeout: 180000,
              maxRetries: 2
            }
          );
        } else {
          // 标准解读
          interpretation = await this.interpretationService.generateAIInterpretation(
            divinationResult,
            {
              ...options,
              timeout: 180000,
              maxRetries: 2
            }
          );
        }
        aiServiceDuration = Date.now() - aiServiceStart;
      } catch (error) {
        aiServiceDuration = Date.now() - aiServiceStart;
        throw error;
      }

      clearTimeout(responseTimeout);
      
      const totalDuration = Date.now() - controllerStartTime;

      if (!interpretation.success) {
        logger.warn('AI解读生成失败', {
          userId,
          divinationId: id,
          error: interpretation.error,
          totalDuration: `${totalDuration}ms`,
          aiServiceDuration: `${aiServiceDuration}ms`,
          dbQueryDuration: `${dbQueryDuration}ms`
        });
      } else {
        logger.info('AI解读请求完成（使用数据库数据）', {
          totalDuration: `${totalDuration}ms`,
          aiServiceDuration: `${aiServiceDuration}ms`,
          dbQueryDuration: `${dbQueryDuration}ms`,
          success: interpretation.success
        });
      }

      res.json({
        success: true,
        data: interpretation.data,
        message: customPrompt ? '自定义解读生成完成' : 'AI解读生成完成',
        performanceMetrics: {
          totalDuration,
          aiServiceDuration,
          dbQueryDuration
        }
      });

    } catch (error) {
      clearTimeout(responseTimeout);
      
      const totalDuration = Date.now() - controllerStartTime;
      const errorType = this.classifyError(error);
      
      logger.error('生成AI解读失败', {
        userId: req.user?.id,
        divinationId: req.params.id,
        error: error.message,
        errorType,
        code: error.code,
        totalDuration: `${totalDuration}ms`,
        aiServiceDuration: `${aiServiceDuration}ms`,
        dbQueryDuration: `${dbQueryDuration}ms`,
        isTimeout: error.code === 'ECONNABORTED' || error.message.includes('timeout')
      });

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: '生成AI解读失败',
          error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试',
          errorType,
          performanceMetrics: {
            totalDuration,
            aiServiceDuration,
            dbQueryDuration
          }
        });
      }
    }
  }

  /**
   * 分类错误类型
   * @param {Error} error - 错误对象
   * @returns {string} 错误类型
   */
  classifyError(error) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'TIMEOUT';
    }
    if (error.message.includes('所有AI服务都不可用')) {
      return 'SERVICE_UNAVAILABLE';
    }
    if (error.message.includes('DeepSeek API')) {
      return 'AI_SERVICE_ERROR';
    }
    if (error.message.includes('占卜记录不存在')) {
      return 'DIVINATION_NOT_FOUND';
    }
    return 'UNKNOWN_ERROR';
  }

  /**
   * 检查AI服务状态
   * GET /api/divination/ai-status
   */
  async checkAIStatus(req, res) {
    try {
      const status = await this.interpretationService.checkAIStatus();
      
      res.json({
        success: true,
        data: status.data || status,
        message: 'AI服务状态检查完成'
      });

    } catch (error) {
      logger.error('检查AI服务状态失败', {
        error: error.message
      });

      res.status(500).json({
        success: false,
        message: '检查AI服务状态失败',
        error: error.message
      });
    }
  }

  /**
   * 获取解读模板
   * GET /api/divination/interpretation-templates
   */
  async getInterpretationTemplates(req, res) {
    try {
      const templates = {
        basic: {
          name: '基础解读',
          description: '标准的梅花易数解读',
          prompt: '你是梅花易数专家。请解读这个占卜，分析卦象含义、对问题的启示和具体建议。'
        },
        career: {
          name: '事业发展',
          description: '从职场发展角度分析',
          prompt: '请从职场发展的角度分析这个卦象，重点关注当前职业阶段特征、未来发展趋势、需要提升的能力和具体行动建议。'
        },
        relationship: {
          name: '感情运势',
          description: '从感情关系角度分析',
          prompt: '请从感情关系的角度解读这个卦象，分析当前感情状态、双方关系特点、感情发展趋势和维护关系的建议。'
        },
        wealth: {
          name: '财运分析',
          description: '从财运角度分析',
          prompt: '请从财运的角度分析这个卦象，包括当前财务状况、投资理财建议、风险提示和财富积累策略。'
        },
        health: {
          name: '健康运势',
          description: '从健康角度分析',
          prompt: '请从健康的角度解读这个卦象，分析身体状况、需要注意的健康问题、养生建议和预防措施。'
        }
      };

      res.json({
        success: true,
        data: templates,
        message: '解读模板获取成功'
      });

    } catch (error) {
      logger.error('获取解读模板失败', {
        error: error.message
      });

      res.status(500).json({
        success: false,
        message: '获取解读模板失败',
        error: error.message
      });
    }
  }

  /**
   * 批量生成解读
   * POST /api/divination/batch-interpretation
   */
  async batchGenerateInterpretation(req, res) {
    try {
      const { divinationIds, template } = req.body;
      const userId = req.user.id;

      if (!Array.isArray(divinationIds) || divinationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的占卜ID列表'
        });
      }

      if (divinationIds.length > 10) {
        return res.status(400).json({
          success: false,
          message: '批量解读最多支持10个占卜记录'
        });
      }

      const results = [];
      
      for (const divinationId of divinationIds) {
        try {
          // 获取占卜结果
          const divinationResult = await this.divinationService.getDivinationById(divinationId, userId);
          
          if (divinationResult.success) {
            // 生成解读
            const interpretation = await this.interpretationService.generateCustomInterpretation(
              divinationResult.data,
              template.prompt || '请解读这个占卜结果',
              { temperature: 0.7, maxTokens: 1500 }
            );

            results.push({
              divinationId,
              success: interpretation.success,
              data: interpretation.data || interpretation.error
            });
          } else {
            results.push({
              divinationId,
              success: false,
              error: '占卜记录不存在或无权访问'
            });
          }

          // 避免API限流，添加延迟
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          results.push({
            divinationId,
            success: false,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        data: results,
        message: `批量解读完成，成功 ${results.filter(r => r.success).length}/${results.length} 个`
      });

    } catch (error) {
      logger.error('批量生成解读失败', {
        userId: req.user?.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        message: '批量生成解读失败',
        error: error.message
      });
    }
  }
}

module.exports = EnhancedDivinationController;
