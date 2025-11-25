/**
 * 梅花心易 - Express应用配置
 * 主应用文件，配置Express服务器和所有中间件
 */

const express = require('express');
const path = require('path');
const config = require('./config');
const { setupMiddleware, setupErrorHandling } = require('./middleware');
const { databaseManager } = require('./config/database');

/**
 * 创建Express应用
 */
const createApp = async () => {
  const app = express();

  // 设置应用信息
  app.set('trust proxy', 1);
  app.set('x-powered-by', false);

  // 配置中间件
  setupMiddleware(app);

  // API路由前缀
  const API_PREFIX = '/api';

  // 根路由 - API信息
  app.get('/', (req, res) => {
    res.json({
      success: true,
      data: {
        name: config.app.name,
        version: config.app.version,
        environment: config.app.env,
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/api/health',
          auth: '/api/auth',
          user: '/api/user',
          divination: '/api/divination'
        }
      }
    });
  });

  // API路由
  try {
    // 认证路由
    // const authRoutes = require('./routes/auth');
    // app.use(`${API_PREFIX}/auth`, authRoutes);

    // 用户路由
    // const userRoutes = require('./routes/user');
    // app.use(`${API_PREFIX}/user`, userRoutes);

    // 占卜路由
    // const divinationRoutes = require('./routes/divination.routes');
    // app.use(`${API_PREFIX}/divination`, divinationRoutes);
    
    // 暂时禁用增强版占卜路由
    // const enhancedDivinationRoutes = require('./routes/enhancedDivination.routes');
    // app.use(`${API_PREFIX}/divination`, enhancedDivinationRoutes);

    console.log('✅ API路由配置完成');
  } catch (error) {
    console.warn('⚠️ 部分路由模块未找到，将在后续实现');
  }

  // 生产环境下提供前端静态文件服务
  if (config.app.isProduction) {
    const frontendDistPath = path.join(__dirname, '../../frontend/dist');

    // 提供静态文件服务
    app.use(express.static(frontendDistPath, {
      maxAge: '1y', // 静态资源缓存1年
      etag: true,
      lastModified: true
    }));

    console.log('✅ 生产环境静态文件服务已启用');
    console.log(`📁 静态文件路径: ${frontendDistPath}`);
  }

  // 健康检查路由
  app.get(`${API_PREFIX}/health`, async (req, res) => {
    try {
      // 检查数据库连接状态
      const dbStatus = await databaseManager.healthCheck();
      
      const healthStatus = {
        success: true,
        data: {
          status: dbStatus.overall ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: config.app.version,
          environment: config.app.env,
          database: dbStatus,
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            external: Math.round(process.memoryUsage().external / 1024 / 1024)
          },
          cpu: process.cpuUsage()
        }
      };

      const statusCode = dbStatus.overall ? 200 : 503;
      res.status(statusCode).json(healthStatus);
    } catch (error) {
      res.status(503).json({
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: '健康检查失败',
          details: error.message
        }
      });
    }
  });

  // 详细健康检查路由
  app.get(`${API_PREFIX}/health/detailed`, async (req, res) => {
    try {
      const dbStatus = await databaseManager.healthCheck();
      const dbDetails = databaseManager.getStatus();

      res.json({
        success: true,
        data: {
          application: {
            name: config.app.name,
            version: config.app.version,
            environment: config.app.env,
            uptime: process.uptime(),
            pid: process.pid,
            nodeVersion: process.version
          },
          database: {
            status: dbStatus,
            details: dbDetails
          },
          system: {
            platform: process.platform,
            arch: process.arch,
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            loadAverage: require('os').loadavg()
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'DETAILED_HEALTH_CHECK_FAILED',
          message: '详细健康检查失败',
          details: error.message
        }
      });
    }
  });

  // 生产环境下处理Vue Router的history模式（SPA fallback）
  if (config.app.isProduction) {
    // 暂时禁用Vue Router的history模式支持
    console.log('⚠️ Vue Router history模式支持已禁用（暂时）');
    
    // app.get('*', (req, res, next) => {
    //   // 如果请求的是API路由，跳过处理
    //   if (req.path.startsWith('/api/')) {
    //     return next();
    //   }

    //   // 对于所有非API请求，返回index.html让前端路由处理
    //   const indexPath = path.join(__dirname, '../../frontend/dist/index.html');
    //   res.sendFile(indexPath, (err) => {
    //     if (err) {
    //       console.error('❌ 发送index.html失败:', err);
    //       res.status(500).json({
    //         success: false,
    //         error: {
    //           code: 'STATIC_FILE_ERROR',
    //           message: '静态文件服务错误'
    //         }
    //       });
    //     }
    //   });
    // });

    // console.log('✅ Vue Router history模式支持已启用');
  }

  // 配置错误处理中间件（必须在最后）
  setupErrorHandling(app);

  return app;
};

/**
 * 初始化应用
 */
const initializeApp = async () => {
  try {
    console.log('🚀 正在初始化梅花心易应用...');

    // 验证配置
    if (!config.validate()) {
      throw new Error('配置验证失败');
    }

    // 连接数据库
    await databaseManager.connectAll();

    // 创建Express应用
    const app = await createApp();

    console.log('✅ 应用初始化完成');
    return app;
  } catch (error) {
    console.error('❌ 应用初始化失败:', error.message);
    throw error;
  }
};

/**
 * 优雅关闭应用
 */
const gracefulShutdown = async (server) => {
  console.log('🔄 正在优雅关闭应用...');

  // 停止接受新连接
  server.close(async () => {
    console.log('📡 HTTP服务器已关闭');

    try {
      // 关闭数据库连接
      await databaseManager.disconnectAll();
      console.log('✅ 应用已优雅关闭');
      process.exit(0);
    } catch (error) {
      console.error('❌ 关闭过程中发生错误:', error.message);
      process.exit(1);
    }
  });

  // 强制关闭超时
  setTimeout(() => {
    console.error('❌ 强制关闭应用');
    process.exit(1);
  }, 10000);
};

module.exports = {
  createApp,
  initializeApp,
  gracefulShutdown
};
