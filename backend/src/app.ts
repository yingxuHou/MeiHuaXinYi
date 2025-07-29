import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 请求限流
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 限制每个IP 100次请求
  message: {
    error: '请求过于频繁，请稍后再试',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 基础中间件
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 基础路由
app.get('/', (req, res) => {
  res.json({ 
    message: '🔮 梅花心易后端API服务',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// 导入路由
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import divinationRoutes from './routes/divination';
import { initializeDatabase } from './config/database';

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/divination', divinationRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '请求的资源不存在',
      path: req.originalUrl
    }
  });
});

// 全局错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? '服务器内部错误' 
        : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
if (require.main === module) {
  // 初始化数据库连接
  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log('🚀 梅花心易后端服务启动成功！');
        console.log(`📡 服务地址: http://localhost:${PORT}`);
        console.log(`🌟 环境: ${process.env.NODE_ENV}`);
        console.log(`🔮 Redis: ${process.env.REDIS_URL}`);
        console.log(`🍃 MongoDB: ${process.env.MONGODB_URI}`);
        console.log('📋 API路由:');
        console.log('  - POST /api/auth/register - 用户注册');
        console.log('  - POST /api/auth/login - 用户登录');
        console.log('  - GET  /api/user/profile - 获取用户信息');
        console.log('  - POST /api/divination/submit - 提交占卜');
        console.log('  - GET  /api/divination/history - 占卜历史');
        console.log('='.repeat(50));
      });
    })
    .catch((error) => {
      console.error('❌ 数据库初始化失败:', error);
      process.exit(1);
    });
}

export default app;
