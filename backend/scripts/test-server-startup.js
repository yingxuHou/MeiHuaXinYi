/**
 * 测试服务器启动
 * 验证数据库连接和服务器启动是否正常
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const http = require('http');
const config = require('../src/config');

async function testServerStartup() {
  console.log('🧪 测试服务器启动...');
  console.log('=' .repeat(40));
  
  try {
    // 1. 测试数据库连接
    console.log('🔗 1. 测试数据库连接...');
    const { databaseManager } = require('../src/config/database');
    await databaseManager.connectAll();
    console.log('✅ 数据库连接成功');
    
    // 2. 初始化应用
    console.log('\n🚀 2. 初始化应用...');
    const { initializeApp } = require('../src/app');
    const app = await initializeApp();
    console.log('✅ 应用初始化成功');
    
    // 3. 创建服务器
    console.log('\n🌐 3. 创建HTTP服务器...');
    const server = http.createServer(app);
    
    // 4. 启动服务器
    console.log('\n📡 4. 启动服务器...');
    await new Promise((resolve, reject) => {
      server.listen(config.app.port, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`✅ 服务器启动成功: http://localhost:${config.app.port}`);
          resolve();
        }
      });
    });
    
    // 5. 测试健康检查
    console.log('\n💚 5. 测试健康检查...');
    const healthCheck = await testHealthEndpoint(config.app.port);
    if (healthCheck) {
      console.log('✅ 健康检查通过');
    } else {
      console.log('⚠️ 健康检查失败');
    }
    
    // 6. 关闭服务器
    console.log('\n🔄 6. 关闭服务器...');
    await new Promise((resolve) => {
      server.close(() => {
        console.log('✅ 服务器已关闭');
        resolve();
      });
    });
    
    // 7. 关闭数据库连接
    await databaseManager.disconnectAll();
    
    console.log('\n🎉 所有测试通过！服务器可以正常启动。');
    return true;
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n🔧 可能的解决方案:');
    console.error('   - 检查MongoDB是否正在运行');
    console.error('   - 检查端口是否被占用');
    console.error('   - 检查环境变量配置');
    return false;
  }
}

/**
 * 测试健康检查端点
 */
async function testHealthEndpoint(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.success === true);
        } catch {
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// 运行测试
if (require.main === module) {
  testServerStartup().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = testServerStartup;
