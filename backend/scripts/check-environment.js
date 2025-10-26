/**
 * 环境检查脚本
 * 验证所有必要的环境变量和依赖
 */

const path = require('path');
const fs = require('fs');

// 检查.env文件是否存在
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env文件不存在');
  process.exit(1);
}

// 加载环境变量
require('dotenv').config({ path: envPath });

console.log('🔍 环境检查开始...\n');

// 1. 检查Node.js版本
console.log('📦 Node.js版本检查:');
console.log(`   版本: ${process.version}`);
const nodeVersion = parseInt(process.version.slice(1).split('.')[0]);
if (nodeVersion < 16) {
  console.error('❌ Node.js版本过低，需要16.0.0或更高版本');
} else {
  console.log('✅ Node.js版本符合要求');
}
console.log('');

// 2. 检查必需的环境变量
console.log('🔧 环境变量检查:');
const requiredVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET'
];

const optionalVars = [
  'CLAUDE_API_KEY',
  'OPENAI_API_KEY',
  'PINECONE_API_KEY'
];

let allRequired = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${varName === 'JWT_SECRET' ? '***' : value}`);
  } else {
    console.log(`   ❌ ${varName}: 未设置`);
    allRequired = false;
  }
});

console.log('\n🔧 可选环境变量:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ***`);
  } else {
    console.log(`   ⚠️ ${varName}: 未设置（某些功能可能不可用）`);
  }
});
console.log('');

// 3. 检查依赖包
console.log('📚 依赖包检查:');
const requiredPackages = [
  'mongoose',
  'express',
  'dotenv',
  'bcryptjs',
  'jsonwebtoken'
];

const optionalPackages = [
  'axios',
  'ioredis',
  '@pinecone-database/pinecone',
  'openai'
];

let allPackagesInstalled = true;

requiredPackages.forEach(packageName => {
  try {
    require(packageName);
    console.log(`   ✅ ${packageName}: 已安装`);
  } catch (error) {
    console.log(`   ❌ ${packageName}: 未安装`);
    allPackagesInstalled = false;
  }
});

console.log('\n📚 可选依赖包:');
optionalPackages.forEach(packageName => {
  try {
    require(packageName);
    console.log(`   ✅ ${packageName}: 已安装`);
  } catch (error) {
    console.log(`   ⚠️ ${packageName}: 未安装（某些功能可能不可用）`);
  }
});
console.log('');

// 4. 检查文件结构
console.log('📁 文件结构检查:');
const requiredDirs = [
  'src',
  'src/config',
  'src/models',
  'src/controllers',
  'src/routes',
  'src/middleware',
  'scripts'
];

const requiredFiles = [
  'src/config/index.js',
  'src/config/database.js',
  'src/models/index.js',
  'src/models/User.js'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    console.log(`   ✅ ${dir}/: 存在`);
  } else {
    console.log(`   ❌ ${dir}/: 不存在`);
  }
});

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}: 存在`);
  } else {
    console.log(`   ❌ ${file}: 不存在`);
  }
});
console.log('');

// 5. 测试基本模块加载
console.log('🧪 模块加载测试:');
try {
  const config = require('../src/config');
  console.log('   ✅ 配置模块: 加载成功');
  console.log(`      - 环境: ${config.app.env}`);
  console.log(`      - 端口: ${config.app.port}`);
  console.log(`      - 数据库: ${config.database.mongodb.dbName}`);
} catch (error) {
  console.log(`   ❌ 配置模块: 加载失败 - ${error.message}`);
}

try {
  const mongoose = require('mongoose');
  console.log('   ✅ Mongoose: 加载成功');
  console.log(`      - 版本: ${mongoose.version}`);
} catch (error) {
  console.log(`   ❌ Mongoose: 加载失败 - ${error.message}`);
}
console.log('');

// 6. 生成总结报告
console.log('📋 检查总结:');
console.log('=' .repeat(50));

if (allRequired && allPackagesInstalled) {
  console.log('🎉 环境检查通过！可以继续进行数据库连接测试。');
  console.log('\n💡 下一步建议:');
  console.log('   1. 确保MongoDB服务正在运行');
  console.log('   2. 运行: npm run db:test');
  console.log('   3. 如果连接成功，运行: npm run migrate:v2');
} else {
  console.log('⚠️ 环境检查发现问题，请先解决以下问题:');
  
  if (!allRequired) {
    console.log('   - 设置缺失的必需环境变量');
  }
  
  if (!allPackagesInstalled) {
    console.log('   - 安装缺失的依赖包: npm install');
  }
}

console.log('=' .repeat(50));
