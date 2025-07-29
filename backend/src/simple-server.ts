import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 基础中间件
app.use(cors());
app.use(express.json());

// 模拟用户数据
const mockUsers = [
  {
    id: '1',
    email: 'test@meihua.com',
    password: 'test123456',
    nickname: '测试用户',
    freeCount: 10,
    totalCount: 0
  }
];

// 模拟占卜数据
const mockDivinations: any[] = [];

// 基础路由
app.get('/', (req, res) => {
  res.json({ 
    message: '🔮 梅花心易后端API服务 (简化版)',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/auth/register - 用户注册',
      'POST /api/auth/login - 用户登录',
      'POST /api/divination/submit - 提交占卜',
      'GET /api/divination/history - 占卜历史'
    ]
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 用户注册 (简化版)
app.post('/api/auth/register', (req, res) => {
  const { email, password, nickname } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: '邮箱和密码是必填项' }
    });
  }
  
  // 检查用户是否已存在
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: { code: 'USER_ALREADY_EXISTS', message: '用户已存在' }
    });
  }
  
  // 创建新用户
  const newUser = {
    id: String(mockUsers.length + 1),
    email,
    password,
    nickname: nickname || email.split('@')[0],
    freeCount: 10,
    totalCount: 0
  };
  
  mockUsers.push(newUser);
  
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
        freeCount: newUser.freeCount,
        totalCount: newUser.totalCount
      },
      token: 'mock-jwt-token-' + newUser.id
    }
  });
});

// 用户登录 (简化版)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: '邮箱和密码是必填项' }
    });
  }
  
  // 查找用户
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' }
    });
  }
  
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        freeCount: user.freeCount,
        totalCount: user.totalCount
      },
      token: 'mock-jwt-token-' + user.id
    }
  });
});

// 提交占卜 (简化版)
app.post('/api/divination/submit', (req, res) => {
  const { question, category = '其他' } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '缺少认证Token' }
    });
  }
  
  if (!question || question.length < 5) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: '问题至少需要5个字符' }
    });
  }
  
  // 模拟占卜结果
  const mockResult = {
    id: String(mockDivinations.length + 1),
    question,
    category,
    hexagram: {
      original: {
        name: '乾卦',
        symbol: '☰',
        number: 1,
        lines: ['阳', '阳', '阳', '阳', '阳', '阳']
      },
      changingLines: [1, 3]
    },
    aiInterpretation: {
      overall: '运势整体向好，需要把握时机',
      advice: ['保持积极态度', '注重团队合作', '谨慎决策'],
      timing: '近期是发展的好时机',
      confidence: 0.85
    },
    status: 'completed',
    createdAt: new Date().toISOString()
  };
  
  mockDivinations.push(mockResult);
  
  res.status(201).json({
    success: true,
    data: {
      divinationId: mockResult.id,
      status: 'completed',
      result: mockResult
    }
  });
});

// 获取占卜历史 (简化版)
app.get('/api/divination/history', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '缺少认证Token' }
    });
  }
  
  res.json({
    success: true,
    data: mockDivinations.slice(-10) // 返回最近10条记录
  });
});

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
      message: '服务器内部错误'
    },
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 梅花心易后端服务启动成功！(简化版)');
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🌟 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log('📋 可用API:');
  console.log('  - POST /api/auth/register - 用户注册');
  console.log('  - POST /api/auth/login - 用户登录');
  console.log('  - POST /api/divination/submit - 提交占卜');
  console.log('  - GET  /api/divination/history - 占卜历史');
  console.log('='.repeat(50));
});

export default app;
