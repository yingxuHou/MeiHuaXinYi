/**
 * 简单的连接测试
 */

const http = require('http');

console.log('🔍 测试服务器连接...');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/divination/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ 连接成功! 状态码: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 响应内容:', body);
    try {
      const data = JSON.parse(body);
      console.log('📊 解析后的数据:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.log('⚠️ 无法解析JSON:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ 连接失败:', error.message);
  console.log('错误详情:', error);
});

req.on('timeout', () => {
  console.log('⏰ 连接超时');
  req.destroy();
});

req.setTimeout(5000);
req.end();

console.log('📡 请求已发送，等待响应...');
