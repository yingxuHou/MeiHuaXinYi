/**
 * 检查服务器状态
 */

const http = require('http');

function checkServerStatus(port = 3001) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };
    
    console.log(`🔍 检查服务器状态: http://localhost:${port}`);
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ 服务器正在运行');
          console.log('📊 健康检查响应:', response);
          resolve(true);
        } catch (error) {
          console.log('⚠️ 服务器响应格式异常:', data);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ 服务器未运行:', error.message);
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('⏱️ 连接超时');
      resolve(false);
    });
    
    req.end();
  });
}

// 检查端口占用情况
function checkPortUsage(port = 3001) {
  const { exec } = require('child_process');
  
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
      if (stdout.trim()) {
        console.log(`🔌 端口 ${port} 使用情况:`);
        console.log(stdout);
        resolve(true);
      } else {
        console.log(`📭 端口 ${port} 未被占用`);
        resolve(false);
      }
    });
  });
}

async function main() {
  console.log('🧪 梅花心易服务器状态检查');
  console.log('=' .repeat(40));
  
  // 1. 检查端口占用
  console.log('\n1. 检查端口占用情况...');
  const portInUse = await checkPortUsage(3001);
  
  // 2. 检查服务器响应
  console.log('\n2. 检查服务器响应...');
  const serverRunning = await checkServerStatus(3001);
  
  // 3. 总结
  console.log('\n📋 状态总结:');
  console.log(`   端口占用: ${portInUse ? '✅ 是' : '❌ 否'}`);
  console.log(`   服务响应: ${serverRunning ? '✅ 正常' : '❌ 异常'}`);
  
  if (portInUse && serverRunning) {
    console.log('\n🎉 服务器运行正常！');
    console.log('🌐 访问地址: http://localhost:3001');
    console.log('💚 健康检查: http://localhost:3001/api/health');
  } else if (portInUse && !serverRunning) {
    console.log('\n⚠️ 端口被占用但服务器无响应');
    console.log('💡 建议: 检查是否是正确的应用占用了端口');
  } else {
    console.log('\n❌ 服务器未运行');
    console.log('💡 建议: 运行 npm run dev 启动服务器');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkServerStatus, checkPortUsage };
