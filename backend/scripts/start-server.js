/**
 * 简单的服务器启动脚本
 * 用于测试服务器启动，不依赖环境变量
 */

const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

// 设置默认环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '3001';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yingxu0102:rK6Pax3ORKUJ8H3g@clustermeihuaxinyi.bzdajgt.mongodb.net/meihuaxinyi?retryWrites=true&w=majority';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'meihuaxinyi-jwt-secret-key-2025-change-in-production';

console.log('🌟 启动梅花心易后端服务器...');
console.log('📋 环境配置:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  PORT: ${process.env.PORT}`);
console.log(`  MONGODB_URI: ${process.env.MONGODB_URI ? '已配置' : '未配置'}`);
console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '已配置' : '未配置'}`);

// 启动服务器
try {
  require('../src/server.js');
} catch (error) {
  console.error('❌ 服务器启动失败:', error.message);
  console.error('错误详情:', error.stack);
  process.exit(1);
}

