import express from 'express';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 基础中间件
app.use(express.json());

// 基础路由
app.get('/', (req, res) => {
  res.json({ 
    message: '🔮 梅花心易后端API服务 (简化版)',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 梅花心易后端服务启动成功！');
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🌟 环境: ${process.env.NODE_ENV}`);
});

export default app;
