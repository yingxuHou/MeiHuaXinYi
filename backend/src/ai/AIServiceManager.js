/**
 * AI服务管理器
 * 统一管理各种AI服务的调用
 */

const DeepSeekAPI = require('./deepseek/DeepSeekAPI');
const config = require('../config');
const logger = require('../utils/logger');

class AIServiceManager {
  constructor() {
    this.services = {};
    this.initializeServices();
  }

  /**
   * 初始化AI服务
   */
  initializeServices() {
    try {
      // 初始化DeepSeek服务
      if (config.ai.deepseek.apiKey) {
        this.services.deepseek = new DeepSeekAPI();
        logger.info('DeepSeek AI服务初始化成功');
      } else {
        logger.warn('DeepSeek API密钥未配置，跳过初始化');
      }

      // 可以在这里添加其他AI服务的初始化
      // 例如：Claude、OpenAI等

    } catch (error) {
      logger.error('AI服务初始化失败', error);
    }
  }

  /**
   * 获取可用的AI服务
   * @returns {Array} 可用服务列表
   */
  getAvailableServices() {
    return Object.keys(this.services);
  }

  /**
   * 检查服务是否可用
   * @param {string} serviceName - 服务名称
   * @returns {boolean} 是否可用
   */
  isServiceAvailable(serviceName) {
    return this.services[serviceName] !== undefined;
  }

  /**
   * 生成AI回答（自动选择最佳服务，带智能重试）
   * @param {string} prompt - 提示词
   * @param {Object} options - 可选参数
   * @returns {Promise<Object>} AI回答结果
   */
  async generateResponse(prompt, options = {}) {
    const maxRetries = options.maxRetries || 1;
    const preferredService = options.service || 'deepseek';
    const requestStartTime = Date.now();
    
    logger.info('AI服务管理器开始处理请求', {
      promptLength: prompt.length,
      preferredService,
      maxRetries,
      availableServices: this.getAvailableServices()
    });

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        // 首选服务
        if (this.isServiceAvailable(preferredService)) {
          try {
            logger.info(`尝试使用首选服务 ${preferredService} (尝试 ${attempt}/${maxRetries + 1})`);
            const result = await this.services[preferredService].generateResponse(prompt, {
              ...options,
              attempt: attempt,
              maxRetries: 0 // 在服务管理器层面控制重试，避免底层重复重试
            });
            
            logger.info('首选服务调用成功', {
              service: preferredService,
              attempt,
              totalDuration: Date.now() - requestStartTime
            });
            
            return result;
          } catch (error) {
            logger.warn(`首选服务 ${preferredService} 调用失败 (尝试 ${attempt}/${maxRetries + 1})`, {
              error: error.message,
              code: error.code,
              isLastAttempt: attempt === maxRetries + 1
            });
            
            // 如果不是最后一次尝试，继续重试
            if (attempt <= maxRetries) {
              const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
              logger.info(`等待 ${delay}ms 后重试首选服务...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
        }

        // 尝试其他可用服务
        for (const serviceName of this.getAvailableServices()) {
          if (serviceName !== preferredService) {
            try {
              logger.info(`尝试使用备用服务 ${serviceName}`);
              const result = await this.services[serviceName].generateResponse(prompt, {
                ...options,
                attempt: 1,
                maxRetries: 0 // 备用服务不重试
              });
              
              logger.info('备用服务调用成功', {
                service: serviceName,
                totalDuration: Date.now() - requestStartTime
              });
              
              return result;
            } catch (error) {
              logger.warn(`备用服务 ${serviceName} 调用失败`, {
                error: error.message,
                code: error.code
              });
            }
          }
        }

        // 如果所有服务都失败了
        break;
      } catch (error) {
        logger.error(`AI服务管理器处理请求失败 (尝试 ${attempt}/${maxRetries + 1})`, {
          error: error.message,
          stack: error.stack
        });
        
        if (attempt <= maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
          logger.info(`等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    const totalDuration = Date.now() - requestStartTime;
    logger.error('所有AI服务都不可用或重试失败', {
      totalDuration: `${totalDuration}ms`,
      totalAttempts: maxRetries + 1,
      preferredService
    });
    
    throw new Error('所有AI服务都不可用');
  }

  /**
   * 生成梅花易数解读（带智能重试和监控）
   * @param {Object} divinationData - 占卜数据
   * @param {string} question - 用户问题
   * @param {Object} options - 可选参数
   * @returns {Promise<Object>} 解读结果
   */
  async generateDivinationInterpretation(divinationData, question, options = {}) {
    const maxRetries = options.maxRetries || 1;
    const preferredService = options.service || 'deepseek';
    const requestStartTime = Date.now();
    
    logger.info('开始生成梅花易数解读', {
      question: question.substring(0, 50) + '...',
      mainHexagram: divinationData.mainHexagram,
      preferredService,
      maxRetries
    });

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        // 首选服务
        if (this.isServiceAvailable(preferredService)) {
          try {
            logger.info(`尝试使用首选服务生成解读 ${preferredService} (尝试 ${attempt}/${maxRetries + 1})`);
            
            const result = await this.services[preferredService].generateDivinationInterpretation(
              divinationData,
              question,
              {
                ...options,
                attempt: attempt,
                maxRetries: 0 // 在服务管理器层面控制重试
              }
            );
            
            const totalDuration = Date.now() - requestStartTime;
            logger.info('梅花易数解读生成成功', {
              service: preferredService,
              attempt,
              totalDuration: `${totalDuration}ms`,
              interpretationLength: result.interpretation?.length || 0
            });
            
            return result;
          } catch (error) {
            logger.warn(`首选服务解读失败 ${preferredService} (尝试 ${attempt}/${maxRetries + 1})`, {
              error: error.message,
              code: error.code,
              isTimeout: error.code === 'ECONNABORTED',
              isLastAttempt: attempt === maxRetries + 1
            });
            
            // 如果不是最后一次尝试，继续重试
            if (attempt <= maxRetries) {
              const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
              logger.info(`等待 ${delay}ms 后重试解读生成...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
        }

        // 尝试其他可用服务
        for (const serviceName of this.getAvailableServices()) {
          if (serviceName !== preferredService) {
            try {
              logger.info(`尝试使用备用服务生成解读 ${serviceName}`);
              
              const result = await this.services[serviceName].generateDivinationInterpretation(
                divinationData,
                question,
                {
                  ...options,
                  attempt: 1,
                  maxRetries: 0
                }
              );
              
              const totalDuration = Date.now() - requestStartTime;
              logger.info('备用服务解读生成成功', {
                service: serviceName,
                totalDuration: `${totalDuration}ms`
              });
              
              return result;
            } catch (error) {
              logger.warn(`备用服务解读失败 ${serviceName}`, {
                error: error.message,
                code: error.code
              });
            }
          }
        }

        // 如果所有服务都失败了
        break;
      } catch (error) {
        logger.error(`解读生成处理失败 (尝试 ${attempt}/${maxRetries + 1})`, {
          error: error.message,
          stack: error.stack
        });
        
        if (attempt <= maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
          logger.info(`等待 ${delay}ms 后重试解读生成...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    const totalDuration = Date.now() - requestStartTime;
    logger.error('所有AI服务都无法生成梅花易数解读', {
      totalDuration: `${totalDuration}ms`,
      totalAttempts: maxRetries + 1,
      preferredService,
      question: question.substring(0, 50) + '...'
    });
    
    throw new Error('所有AI服务都无法生成解读');
  }

  /**
   * 检查所有服务的连接状态
   * @returns {Promise<Object>} 各服务的连接状态
   */
  async checkAllConnections() {
    const results = {};
    
    for (const serviceName of this.getAvailableServices()) {
      try {
        results[serviceName] = await this.services[serviceName].checkConnection();
      } catch (error) {
        results[serviceName] = false;
        logger.error(`检查服务 ${serviceName} 连接状态失败`, error);
      }
    }
    
    return results;
  }

  /**
   * 获取服务统计信息
   * @returns {Object} 统计信息
   */
  getServiceStats() {
    return {
      totalServices: this.getAvailableServices().length,
      availableServices: this.getAvailableServices(),
      config: {
        deepseek: {
          configured: !!config.ai.deepseek.apiKey,
          model: config.ai.deepseek.model
        },
        claude: {
          configured: !!config.ai.claude.apiKey,
          model: config.ai.claude.model
        },
        openai: {
          configured: !!config.ai.openai.apiKey,
          model: config.ai.openai.model
        }
      }
    };
  }
}

module.exports = AIServiceManager;
