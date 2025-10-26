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
   * 生成AI回答（自动选择最佳服务）
   * @param {string} prompt - 提示词
   * @param {Object} options - 可选参数
   * @returns {Promise<Object>} AI回答结果
   */
  async generateResponse(prompt, options = {}) {
    const preferredService = options.service || 'deepseek';
    
    if (this.isServiceAvailable(preferredService)) {
      try {
        return await this.services[preferredService].generateResponse(prompt, options);
      } catch (error) {
        logger.warn(`首选服务 ${preferredService} 调用失败，尝试备用服务`, error);
      }
    }

    // 尝试其他可用服务
    for (const serviceName of this.getAvailableServices()) {
      if (serviceName !== preferredService) {
        try {
          return await this.services[serviceName].generateResponse(prompt, options);
        } catch (error) {
          logger.warn(`备用服务 ${serviceName} 调用失败`, error);
        }
      }
    }

    throw new Error('所有AI服务都不可用');
  }

  /**
   * 生成梅花易数解读
   * @param {Object} divinationData - 占卜数据
   * @param {string} question - 用户问题
   * @param {Object} options - 可选参数
   * @returns {Promise<Object>} 解读结果
   */
  async generateDivinationInterpretation(divinationData, question, options = {}) {
    const preferredService = options.service || 'deepseek';
    
    if (this.isServiceAvailable(preferredService)) {
      try {
        return await this.services[preferredService].generateDivinationInterpretation(
          divinationData, 
          question
        );
      } catch (error) {
        logger.warn(`首选服务 ${preferredService} 解读失败，尝试备用服务`, error);
      }
    }

    // 尝试其他可用服务
    for (const serviceName of this.getAvailableServices()) {
      if (serviceName !== preferredService) {
        try {
          return await this.services[serviceName].generateDivinationInterpretation(
            divinationData, 
            question
          );
        } catch (error) {
          logger.warn(`备用服务 ${serviceName} 解读失败`, error);
        }
      }
    }

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
