/**
 * 梅花心易 - 服务器启动文件
 * 启动HTTP服务器并处理进程信号
 */

const http = require('http');
const config = require('./config');
const { initializeApp, gracefulShutdown } = require('./app');

/**
 * 启动服务器
 */
const startServer = async () => {
  try {
    // 打印启动信息
    console.log('🌟 梅花心易后端服务启动中...');
    console.log('='.repeat(50));
    config.printInfo();
    console.log('='.repeat(50));

    // 初始化应用
    const app = await initializeApp();

    // 创建HTTP服务器
    const server = http.createServer(app);

    // 启动服务器
    server.listen(config.app.port, () => {
      console.log('🎉 服务器启动成功!');
      console.log(`📡 服务地址: http://localhost:${config.app.port}`);
      console.log(`🔗 API文档: http://localhost:${config.app.port}/api`);
      console.log(`💚 健康检查: http://localhost:${config.app.port}/api/health`);
      console.log('='.repeat(50));
    });

    // 处理服务器错误
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.app.port === 'string'
        ? 'Pipe ' + config.app.port
        : 'Port ' + config.app.port;

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} 需要提升权限`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ ${bind} 已被占用`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // 设置优雅关闭处理
    setupGracefulShutdown(server);

    return server;
  } catch (error) {
    console.error('❌ 服务器启动失败:', error.message);
    console.error('❌ 错误堆栈:', error.stack);
    process.exit(1);
  }
};

/**
 * 设置优雅关闭处理
 */
const setupGracefulShutdown = (server) => {
  // 处理进程信号
  const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  
  signals.forEach((signal) => {
    process.on(signal, () => {
      console.log(`\n📨 收到 ${signal} 信号，开始优雅关闭...`);
      gracefulShutdown(server);
    });
  });

  // 处理未捕获的异常
  process.on('uncaughtException', (error) => {
    console.error('❌ 未捕获的异常:', error);
    gracefulShutdown(server);
  });

  // 处理未处理的Promise拒绝
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的Promise拒绝:', reason);
    console.error('Promise:', promise);
    gracefulShutdown(server);
  });

  // 处理警告
  process.on('warning', (warning) => {
    console.warn('⚠️ Node.js警告:', warning.name, warning.message);
  });
};

/**
 * 主函数
 */
const main = async () => {
  try {
    await startServer();
  } catch (error) {
    console.error('❌ 启动失败:', error.message);
    process.exit(1);
  }
};

// 如果直接运行此文件，则启动服务器
if (require.main === module) {
  main();
}

module.exports = {
  startServer,
  setupGracefulShutdown
};
