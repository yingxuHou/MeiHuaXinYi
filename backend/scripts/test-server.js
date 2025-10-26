/**
 * 最小测试服务器
 * 用于验证基本的HTTP服务功能
 */

const express = require('express');

const app = express();
const PORT = 3002;

// 基本中间件
app.use(express.json());

// 测试路由
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '测试服务器运行正常',
    timestamp: new Date()
  });
});

// 占卜健康检查路由
app.get('/api/divination/health', (req, res) => {
  res.json({
    success: true,
    message: '占卜服务运行正常',
    timestamp: new Date(),
    version: '2.0'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 测试服务器启动成功！`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`💚 测试地址: http://localhost:${PORT}/test`);
  console.log(`🔮 占卜健康检查: http://localhost:${PORT}/api/divination/health`);
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});
