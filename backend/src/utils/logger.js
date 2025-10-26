/**
 * 梅花心易 - 日志工具
 * 统一的日志记录和管理
 */

const winston = require('winston');
const path = require('path');

/**
 * 日志级别定义
 */
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

/**
 * 日志颜色配置
 */
const LOG_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

/**
 * 自定义日志格式
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // 添加元数据
    if (Object.keys(meta).length > 0) {
      logMessage += ` | ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  })
);

/**
 * 控制台日志格式
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `${timestamp} ${level}: ${message}`;
    
    // 在开发环境下显示更多详细信息
    if (process.env.NODE_ENV === 'development' && Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

/**
 * 创建日志传输器
 */
const createTransports = () => {
  const transports = [];

  // 控制台输出
  transports.push(
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: consoleFormat
    })
  );

  // 生产环境文件日志
  if (process.env.NODE_ENV === 'production') {
    // 错误日志文件
    transports.push(
      new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );

    // 综合日志文件
    transports.push(
      new winston.transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );

    // API访问日志
    transports.push(
      new winston.transports.File({
        filename: path.join(__dirname, '../../logs/access.log'),
        level: 'http',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );
  }

  return transports;
};

/**
 * 创建Winston日志器
 */
const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports: createTransports(),
  exitOnError: false
});

// 添加颜色配置
winston.addColors(LOG_COLORS);

/**
 * 日志工具类
 */
class Logger {
  constructor() {
    this.winston = logger;
  }

  /**
   * 记录错误日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  error(message, meta = {}) {
    this.winston.error(message, this.sanitizeMeta(meta));
  }

  /**
   * 记录警告日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  warn(message, meta = {}) {
    this.winston.warn(message, this.sanitizeMeta(meta));
  }

  /**
   * 记录信息日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  info(message, meta = {}) {
    this.winston.info(message, this.sanitizeMeta(meta));
  }

  /**
   * 记录HTTP日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  http(message, meta = {}) {
    this.winston.http(message, this.sanitizeMeta(meta));
  }

  /**
   * 记录调试日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  debug(message, meta = {}) {
    this.winston.debug(message, this.sanitizeMeta(meta));
  }

  /**
   * 记录占卜相关日志
   * @param {string} action - 操作类型
   * @param {Object} data - 数据
   */
  divination(action, data = {}) {
    this.info(`占卜操作: ${action}`, {
      category: 'divination',
      action,
      ...this.sanitizeMeta(data)
    });
  }

  /**
   * 记录用户操作日志
   * @param {string} action - 操作类型
   * @param {Object} data - 数据
   */
  userAction(action, data = {}) {
    this.info(`用户操作: ${action}`, {
      category: 'user_action',
      action,
      ...this.sanitizeMeta(data)
    });
  }

  /**
   * 记录API性能日志
   * @param {Object} data - 性能数据
   */
  performance(data = {}) {
    this.http('API性能', {
      category: 'performance',
      ...this.sanitizeMeta(data)
    });
  }

  /**
   * 记录安全相关日志
   * @param {string} event - 安全事件
   * @param {Object} data - 数据
   */
  security(event, data = {}) {
    this.warn(`安全事件: ${event}`, {
      category: 'security',
      event,
      ...this.sanitizeMeta(data)
    });
  }

  /**
   * 清理敏感信息
   * @param {Object} meta - 原始元数据
   * @returns {Object} 清理后的元数据
   */
  sanitizeMeta(meta) {
    if (!meta || typeof meta !== 'object') {
      return meta;
    }

    const sanitized = { ...meta };
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'authorization',
      'cookie', 'session', 'passwordHash', 'apiKey'
    ];

    // 递归清理敏感字段
    const sanitizeObject = (obj) => {
      if (!obj || typeof obj !== 'object') {
        return obj;
      }

      const result = Array.isArray(obj) ? [] : {};

      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    return sanitizeObject(sanitized);
  }

  /**
   * 创建子日志器
   * @param {string} module - 模块名称
   * @returns {Object} 子日志器
   */
  child(module) {
    return {
      error: (message, meta = {}) => this.error(message, { module, ...meta }),
      warn: (message, meta = {}) => this.warn(message, { module, ...meta }),
      info: (message, meta = {}) => this.info(message, { module, ...meta }),
      http: (message, meta = {}) => this.http(message, { module, ...meta }),
      debug: (message, meta = {}) => this.debug(message, { module, ...meta })
    };
  }

  /**
   * 获取日志统计
   * @returns {Object} 日志统计信息
   */
  getStats() {
    return {
      level: this.winston.level,
      transports: this.winston.transports.length,
      environment: process.env.NODE_ENV,
      logDirectory: path.join(__dirname, '../../logs')
    };
  }
}

// 创建日志器实例
const loggerInstance = new Logger();

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  loggerInstance.error('未捕获的异常', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  loggerInstance.error('未处理的Promise拒绝', {
    reason: reason?.message || reason,
    stack: reason?.stack
  });
});

module.exports = loggerInstance;
