/**
 * 简化的数据库连接测试
 * 用于验证基本配置是否正确
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔄 测试数据库连接...');
  console.log(`📡 连接字符串: ${process.env.MONGODB_URI}`);
  
  try {
    // 设置连接选项 (Mongoose 8.x 兼容)
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      // bufferMaxEntries 在 Mongoose 6.0+ 中已被移除
      // 使用 bufferCommands: false 来禁用缓冲
    };
    
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ 数据库连接成功！');
    
    // 获取连接信息
    const connection = mongoose.connection;
    console.log(`📊 数据库名称: ${connection.name}`);
    console.log(`🏠 主机: ${connection.host}`);
    console.log(`🔌 端口: ${connection.port}`);
    console.log(`📈 连接状态: ${connection.readyState}`);
    
    // 测试简单操作
    const collections = await connection.db.listCollections().toArray();
    console.log(`📁 集合数量: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 现有集合:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    // 测试ping
    const pingResult = await connection.db.admin().ping();
    console.log(`🏓 Ping结果: ${pingResult.ok === 1 ? '成功' : '失败'}`);
    
  } catch (error) {
    console.error('❌ 数据库连接失败:');
    console.error(`   错误类型: ${error.name}`);
    console.error(`   错误信息: ${error.message}`);
    
    if (error.name === 'MongoNetworkError') {
      console.error('💡 建议: 请检查MongoDB服务是否启动，或网络连接是否正常');
    } else if (error.name === 'MongoAuthenticationError') {
      console.error('💡 建议: 请检查用户名和密码是否正确');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('💡 建议: 请检查连接字符串是否正确');
    }
    
    throw error;
  } finally {
    // 关闭连接
    await mongoose.disconnect();
    console.log('👋 数据库连接已关闭');
  }
}

// 运行测试
if (require.main === module) {
  testConnection().catch(error => {
    console.error('\n💥 测试失败，退出程序');
    process.exit(1);
  });
}

module.exports = testConnection;
