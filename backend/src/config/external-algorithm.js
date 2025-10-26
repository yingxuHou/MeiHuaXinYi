/**
 * 外部算法API配置
 * 管理与专业梅花易数算法服务的连接配置
 */

/**
 * 外部算法API配置类
 */
class ExternalAlgorithmConfig {
  constructor() {
    this.config = {
      // API基础配置
      baseUrl: process.env.ALGORITHM_API_URL || 'https://api.meihuaxinyi.com/algorithm',
      apiKey: process.env.ALGORITHM_API_KEY || '',
      timeout: parseInt(process.env.ALGORITHM_TIMEOUT) || 30000,
      
      // 重试配置
      retryAttempts: parseInt(process.env.ALGORITHM_RETRY_ATTEMPTS) || 3,
      retryDelay: parseInt(process.env.ALGORITHM_RETRY_DELAY) || 1000,
      
      // 缓存配置
      enableCache: process.env.ALGORITHM_ENABLE_CACHE === 'true',
      cacheTimeout: parseInt(process.env.ALGORITHM_CACHE_TIMEOUT) || 300000, // 5分钟
      
      // 降级配置
      enableFallback: process.env.ALGORITHM_ENABLE_FALLBACK !== 'false',
      fallbackMode: process.env.ALGORITHM_FALLBACK_MODE || 'placeholder',
      
      // 监控配置
      enableMetrics: process.env.ALGORITHM_ENABLE_METRICS === 'true',
      metricsEndpoint: process.env.ALGORITHM_METRICS_ENDPOINT || '',
      
      // 开发配置
      isDevelopment: process.env.NODE_ENV === 'development',
      debugMode: process.env.ALGORITHM_DEBUG === 'true'
    };
  }

  /**
   * 获取API配置
   * @returns {Object} API配置对象
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * 获取请求头
   * @returns {Object} 请求头对象
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-Client-Version': '2.0',
      'X-Client-Type': 'meihuaxinyi-backend'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  /**
   * 生成请求ID
   * @returns {string} 唯一请求ID
   */
  generateRequestId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `req_${timestamp}_${random}`;
  }

  /**
   * 验证配置
   * @returns {Object} 验证结果
   */
  validateConfig() {
    const errors = [];
    const warnings = [];

    // 检查必需配置
    if (!this.config.baseUrl) {
      errors.push('ALGORITHM_API_URL 未配置');
    }

    if (!this.config.apiKey && !this.config.isDevelopment) {
      warnings.push('ALGORITHM_API_KEY 未配置，生产环境可能无法正常工作');
    }

    // 检查URL格式
    if (this.config.baseUrl) {
      try {
        new URL(this.config.baseUrl);
      } catch (error) {
        errors.push('ALGORITHM_API_URL 格式无效');
      }
    }

    // 检查超时配置
    if (this.config.timeout < 1000) {
      warnings.push('API超时时间过短，建议至少设置为1000ms');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 获取端点URL
   * @param {string} endpoint - 端点路径
   * @returns {string} 完整URL
   */
  getEndpointUrl(endpoint) {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const path = endpoint.replace(/^\//, '');
    return `${baseUrl}/${path}`;
  }

  /**
   * 是否启用降级模式
   * @returns {boolean} 是否启用降级
   */
  isFallbackEnabled() {
    return this.config.enableFallback;
  }

  /**
   * 获取降级模式
   * @returns {string} 降级模式
   */
  getFallbackMode() {
    return this.config.fallbackMode;
  }

  /**
   * 是否为开发环境
   * @returns {boolean} 是否为开发环境
   */
  isDev() {
    return this.config.isDevelopment;
  }

  /**
   * 是否启用调试模式
   * @returns {boolean} 是否启用调试
   */
  isDebugEnabled() {
    return this.config.debugMode;
  }

  /**
   * 记录调试信息
   * @param {string} message - 调试消息
   * @param {Object} data - 调试数据
   */
  debug(message, data = {}) {
    if (this.config.debugMode) {
      console.log(`[ExternalAlgorithm] ${message}`, data);
    }
  }

  /**
   * 获取重试配置
   * @returns {Object} 重试配置
   */
  getRetryConfig() {
    return {
      attempts: this.config.retryAttempts,
      delay: this.config.retryDelay
    };
  }

  /**
   * 获取缓存配置
   * @returns {Object} 缓存配置
   */
  getCacheConfig() {
    return {
      enabled: this.config.enableCache,
      timeout: this.config.cacheTimeout
    };
  }
}

// 创建单例实例
const externalAlgorithmConfig = new ExternalAlgorithmConfig();

// 启动时验证配置
const validation = externalAlgorithmConfig.validateConfig();
if (!validation.isValid) {
  console.error('❌ 外部算法API配置验证失败:', validation.errors);
}
if (validation.warnings.length > 0) {
  console.warn('⚠️  外部算法API配置警告:', validation.warnings);
}

module.exports = externalAlgorithmConfig;
