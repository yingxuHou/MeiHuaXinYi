/**
 * 梅花心易 - 中间件集合
 * 统一管理所有Express中间件
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * 安全中间件配置
 */
const setupSecurity = (app) => {
  // Helmet - 安全头设置
  app.use(helmet(config.security.helmet));

  // CORS - 跨域资源共享
  app.use(cors(config.security.cors));

  // 压缩响应
  app.use(compression());

  // 请求体解析
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  console.log('✅ 安全中间件配置完成');
};

/**
 * 日志中间件配置
 */
const setupLogging = (app) => {
  // 自定义日志格式
  const logFormat = config.app.isDevelopment 
    ? 'dev' 
    : ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

  app.use(morgan(logFormat, {
    skip: (req, res) => {
      // 跳过健康检查请求的日志
      return req.url === '/api/health' && res.statusCode < 400;
    }
  }));

  console.log('✅ 日志中间件配置完成');
};

/**
 * 限流中间件配置
 */
const setupRateLimit = (app) => {
  // 全局限流
  const globalLimiter = rateLimit({
    windowMs: config.security.rateLimit.windowMs,
    max: config.security.rateLimit.max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: config.security.rateLimit.message
      }
    },
    standardHeaders: config.security.rateLimit.standardHeaders,
    legacyHeaders: config.security.rateLimit.legacyHeaders
  });

  // API限流
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 200, // API请求限制更宽松
    message: {
      success: false,
      error: {
        code: 'API_RATE_LIMIT_EXCEEDED',
        message: 'API请求过于频繁，请稍后再试'
      }
    }
  });

  // 认证限流（更严格）
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 10, // 认证请求限制较严格
    message: {
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: '登录尝试过于频繁，请15分钟后再试'
      }
    }
  });

  app.use(globalLimiter);
  app.use('/api', apiLimiter);
  app.use('/api/auth', authLimiter);

  console.log('✅ 限流中间件配置完成');
};

/**
 * 请求ID中间件
 */
const requestId = (req, res, next) => {
  req.id = require('crypto').randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * 请求时间戳中间件
 */
const requestTimestamp = (req, res, next) => {
  req.timestamp = new Date();
  next();
};

/**
 * 响应时间中间件
 */
const responseTime = (req, res, next) => {
  const start = Date.now();

  // 在响应发送前设置头部
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;

    // 只在头部未发送时设置
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }

    // 记录慢请求
    if (duration > 1000) {
      console.warn(`⚠️ 慢请求检测: ${req.method} ${req.url} - ${duration}ms`);
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * 健康检查中间件
 */
const healthCheck = (req, res, next) => {
  if (req.url === '/health' || req.url === '/api/health') {
    return res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: config.app.version,
        environment: config.app.env
      }
    });
  }
  next();
};

/**
 * 404处理中间件
 */
const notFound = (req, res, next) => {
  const error = new Error(`路由未找到: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
};

/**
 * 全局错误处理中间件
 */
const errorHandler = (error, req, res, next) => {
  // 设置默认错误状态码
  const status = error.status || error.statusCode || 500;
  
  // 构建错误响应
  const errorResponse = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || '服务器内部错误',
      ...(config.app.isDevelopment && { 
        stack: error.stack,
        details: error.details 
      })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    requestId: req.id
  };

  // 记录错误日志
  if (status >= 500) {
    console.error('❌ 服务器错误:', {
      error: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  } else if (status >= 400) {
    console.warn('⚠️ 客户端错误:', {
      error: error.message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
  }

  res.status(status).json(errorResponse);
};

/**
 * 设置所有中间件
 */
const setupMiddleware = (app) => {
  console.log('🔧 正在配置中间件...');

  // 基础中间件
  app.use(requestId);
  app.use(requestTimestamp);
  app.use(responseTime);
  app.use(healthCheck);

  // 安全和日志中间件
  setupSecurity(app);
  setupLogging(app);
  setupRateLimit(app);

  // 静态文件服务
  app.use('/uploads', express.static('uploads'));

  console.log('✅ 所有中间件配置完成');
};

/**
 * 设置错误处理中间件
 */
const setupErrorHandling = (app) => {
  // 404处理
  app.use(notFound);
  
  // 全局错误处理
  app.use(errorHandler);
  
  console.log('✅ 错误处理中间件配置完成');
};

module.exports = {
  setupMiddleware,
  setupErrorHandling,
  requestId,
  requestTimestamp,
  responseTime,
  healthCheck,
  notFound,
  errorHandler
};
