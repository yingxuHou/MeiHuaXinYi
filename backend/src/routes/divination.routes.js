/**
 * 梅花心易 - 占卜API路由
 * 定义占卜相关的API路由和中间件
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const { divinationController, validationRules } = require('../controllers/divination.controller');
const authMiddleware = require('../middleware/auth.middleware');
const subscriptionMiddleware = require('../middleware/subscription.middleware');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * 占卜API限流配置
 */
const divinationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: (req) => {
    // 根据用户订阅类型设置不同的限制
    if (req.user?.subscription?.type === 'premium') {
      return 100; // 会员用户15分钟内最多100次
    } else if (req.user?.subscription?.type === 'basic') {
      return 30; // 基础会员15分钟内最多30次
    } else {
      return 10; // 免费用户15分钟内最多10次
    }
  },
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  handler: (req, res, next, options) => {
    logger.warn('占卜API限流触发', {
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(options.statusCode).json(options.message);
  }
});

/**
 * 查询API限流配置（更宽松）
 */
const queryRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 200, // 15分钟内最多200次查询
  message: {
    success: false,
    message: '查询请求过于频繁，请稍后再试',
    code: 'QUERY_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 请求日志中间件
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('API请求', {
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
};

/**
 * 错误处理中间件
 */
const errorHandler = (error, req, res, next) => {
  logger.error('API错误', {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
    error: error.message,
    stack: error.stack
  });

  // 根据错误类型返回不同的状态码
  let statusCode = 500;
  let message = '服务器内部错误';
  let code = 'INTERNAL_ERROR';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = '数据验证失败';
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = '参数格式错误';
    code = 'INVALID_PARAMETER';
  } else if (error.message.includes('权限')) {
    statusCode = 403;
    message = error.message;
    code = 'PERMISSION_DENIED';
  } else if (error.message.includes('不存在')) {
    statusCode = 404;
    message = error.message;
    code = 'NOT_FOUND';
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// 应用全局中间件
router.use(requestLogger);

/**
 * 无需认证的API路由
 */

// 测试占卜接口（无需认证）
router.post('/test',
  validationRules.testDivination,
  async (req, res, next) => {
    try {
      await divinationController.testDivination(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// 开发环境专用占卜接口（需要认证但跳过数据库）
router.post('/dev-perform',
  authMiddleware.authenticate,
  validationRules.performDivination,
  async (req, res, next) => {
    try {
      const { question, method, params } = req.body;

      // 直接调用占卜算法，不经过服务层
      const MeihuaDivinationCore = require('../algorithms/core/meihuaDivinationCore');
      const divinationCore = new MeihuaDivinationCore();

      const result = await divinationCore.performDivination(
        question, method, params, {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      );

      res.json({
        success: true,
        data: {
          ...result,
          id: 'dev_' + Date.now(),
          userId: req.user.id,
          createdAt: new Date(),
          userRating: null,
          metadata: {
            ...result.metadata,
            isDev: true,
            note: '开发模式，数据未保存到数据库'
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 开发环境专用历史记录接口（返回模拟数据）
router.get('/dev-history',
  authMiddleware.authenticate,
  async (req, res, next) => {
    try {
      // 返回模拟的历史记录数据
      const mockHistory = {
        success: true,
        data: {
          items: [
            {
              id: 'dev_' + (Date.now() - 86400000), // 1天前
              question: '今日运势如何？',
              method: 'time',
              hexagrams: {
                ben: { name: '乾为天', id: 1 },
                hu: { name: '坤为地', id: 2 },
                bian: { name: '泽天夬', id: 43 }
              },
              analysis: {
                fortune: '大吉',
                wuxing: { ben: '金', compatibility: 0.8 }
              },
              interpretation: {
                summary: '运势极佳，宜主动出击',
                confidence: 0.85
              },
              createdAt: new Date(Date.now() - 86400000),
              userRating: { overall: 5 }
            },
            {
              id: 'dev_' + (Date.now() - 172800000), // 2天前
              question: '工作发展如何？',
              method: 'time',
              hexagrams: {
                ben: { name: '风水涣', id: 59 },
                hu: { name: '山地剥', id: 23 },
                bian: { name: '天水讼', id: 6 }
              },
              analysis: {
                fortune: '中平',
                wuxing: { ben: '木', compatibility: 0.6 }
              },
              interpretation: {
                summary: '需要耐心等待时机',
                confidence: 0.75
              },
              createdAt: new Date(Date.now() - 172800000),
              userRating: { overall: 4 }
            }
          ],
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        },
        message: '开发模式：返回模拟历史记录'
      };

      res.json(mockHistory);
    } catch (error) {
      next(error);
    }
  }
);

// 健康检查接口
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '占卜服务运行正常',
    timestamp: new Date(),
    version: '2.0'
  });
});

// API信息接口
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: '梅花心易占卜API',
      version: '2.0',
      description: '基于传统梅花易数理论的智能占卜系统',
      endpoints: [
        'POST /api/divination/perform - 执行占卜（需要认证）',
        'POST /api/divination/dev-perform - 开发环境占卜（需要认证，跳过数据库）',
        'GET /api/divination/dev-history - 开发环境历史记录（需要认证，返回模拟数据）',
        'POST /api/divination/test - 测试占卜（无需认证）',
        'GET /api/divination/:id - 获取占卜详情',
        'GET /api/divination/history - 获取占卜历史',
        'GET /api/divination/stats - 获取占卜统计',
        'PUT /api/divination/:id/rating - 评价占卜结果'
      ],
      supportedMethods: ['time', 'number', 'manual'],
      rateLimit: {
        free: '10 requests per 15 minutes',
        basic: '30 requests per 15 minutes',
        premium: '100 requests per 15 minutes'
      }
    }
  });
});

/**
 * 需要认证的API路由
 */
router.use(authMiddleware.authenticate); // 以下所有API都需要认证

// 执行占卜
router.post('/perform',
  divinationRateLimit,
  subscriptionMiddleware.checkDivinationPermission,
  validationRules.performDivination,
  async (req, res, next) => {
    try {
      await divinationController.performDivination(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// 获取占卜历史（必须在 /:id 之前，避免路由冲突）
router.get('/history',
  queryRateLimit,
  validationRules.getDivinationHistory,
  async (req, res, next) => {
    try {
      await divinationController.getDivinationHistory(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// 获取占卜统计（必须在 /:id 之前，避免路由冲突）
router.get('/stats',
  queryRateLimit,
  async (req, res, next) => {
    try {
      await divinationController.getDivinationStats(req, res);
    } catch (error) {
      next(error);
    }
  }
);


// 获取占卜详情（必须在所有具体路由之后）
router.get('/:id',
  queryRateLimit,
  validationRules.getDivinationById,
  async (req, res, next) => {
    try {
      await divinationController.getDivinationById(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// 评价占卜结果
router.put('/:id/rating',
  queryRateLimit,
  validationRules.rateDivination,
  async (req, res, next) => {
    try {
      await divinationController.rateDivination(req, res);
    } catch (error) {
      next(error);
    }
  }
);




// 应用错误处理中间件
router.use(errorHandler);

module.exports = router;
