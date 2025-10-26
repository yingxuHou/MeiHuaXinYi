/**
 * 梅花心易 - 数据库连接测试 v2.0
 * 兼容 Mongoose 8.x，支持本地和云数据库
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

/**
 * 数据库连接测试类
 */
class DatabaseConnectionTest {
  constructor() {
    this.connectionString = process.env.MONGODB_URI;
    this.isConnected = false;
    this.startTime = null;
  }

  /**
   * 执行完整的数据库连接测试
   */
  async runFullTest() {
    console.log('🧪 梅花心易数据库连接测试 v2.0');
    console.log('=' .repeat(50));
    
    this.startTime = Date.now();
    
    try {
      // 1. 验证环境配置
      await this.validateEnvironment();
      
      // 2. 测试数据库连接
      await this.testConnection();
      
      // 3. 测试基本操作
      await this.testBasicOperations();
      
      // 4. 测试性能
      await this.testPerformance();
      
      console.log('\n✅ 所有测试通过！');
      console.log(`⏱️ 总耗时: ${Date.now() - this.startTime}ms`);
      
      return true;
      
    } catch (error) {
      console.error('\n❌ 测试失败:', error.message);
      this.provideTroubleshootingAdvice(error);
      return false;
      
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 验证环境配置
   */
  async validateEnvironment() {
    console.log('\n🔍 1. 验证环境配置...');
    
    if (!this.connectionString) {
      throw new Error('MONGODB_URI 环境变量未设置');
    }
    
    console.log(`📡 连接字符串: ${this.maskConnectionString(this.connectionString)}`);
    
    // 检查连接字符串格式
    if (!this.connectionString.startsWith('mongodb://') && 
        !this.connectionString.startsWith('mongodb+srv://')) {
      throw new Error('MongoDB连接字符串格式不正确');
    }
    
    // 检测连接类型
    const isAtlas = this.connectionString.includes('mongodb.net');
    const isLocal = this.connectionString.includes('localhost') || 
                   this.connectionString.includes('127.0.0.1');
    
    console.log(`🌐 连接类型: ${isAtlas ? 'MongoDB Atlas (云数据库)' : isLocal ? '本地数据库' : '自定义数据库'}`);
    console.log('✅ 环境配置验证通过');
  }

  /**
   * 测试数据库连接
   */
  async testConnection() {
    console.log('\n🔗 2. 测试数据库连接...');
    
    // Mongoose 8.x 兼容的连接选项
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      autoIndex: true,
      autoCreate: true,
      // 针对不同环境的优化
      retryWrites: true,
      retryReads: true,
      readPreference: 'primary'
    };
    
    const connectStart = Date.now();
    
    try {
      await mongoose.connect(this.connectionString, options);
      this.isConnected = true;
      
      const connectTime = Date.now() - connectStart;
      console.log(`✅ 连接成功 (${connectTime}ms)`);
      
      // 获取连接信息
      const connection = mongoose.connection;
      console.log(`📊 数据库: ${connection.name}`);
      console.log(`🏠 主机: ${connection.host || 'Atlas Cluster'}`);
      console.log(`🔌 端口: ${connection.port || 'Default'}`);
      console.log(`📈 连接状态: ${this.getReadyStateText(connection.readyState)}`);
      
    } catch (error) {
      throw new Error(`数据库连接失败: ${error.message}`);
    }
  }

  /**
   * 测试基本数据库操作
   */
  async testBasicOperations() {
    console.log('\n🔧 3. 测试基本操作...');
    
    const connection = mongoose.connection;
    
    try {
      // 测试 ping
      const pingResult = await connection.db.admin().ping();
      console.log(`🏓 Ping: ${pingResult.ok === 1 ? '✅ 成功' : '❌ 失败'}`);
      
      // 列出集合
      const collections = await connection.db.listCollections().toArray();
      console.log(`📁 集合数量: ${collections.length}`);
      
      if (collections.length > 0) {
        console.log('📋 现有集合:');
        collections.slice(0, 5).forEach(col => {
          console.log(`   - ${col.name}`);
        });
        if (collections.length > 5) {
          console.log(`   ... 还有 ${collections.length - 5} 个集合`);
        }
      }
      
      // 测试简单的写入和读取
      const testCollection = connection.db.collection('connection_test');
      const testDoc = {
        _id: 'test_' + Date.now(),
        message: '数据库连接测试',
        timestamp: new Date(),
        version: 'v2.0'
      };
      
      await testCollection.insertOne(testDoc);
      console.log('✅ 写入测试: 成功');
      
      const foundDoc = await testCollection.findOne({ _id: testDoc._id });
      console.log('✅ 读取测试: 成功');
      
      await testCollection.deleteOne({ _id: testDoc._id });
      console.log('✅ 删除测试: 成功');
      
    } catch (error) {
      throw new Error(`基本操作测试失败: ${error.message}`);
    }
  }

  /**
   * 测试数据库性能
   */
  async testPerformance() {
    console.log('\n⚡ 4. 性能测试...');
    
    const connection = mongoose.connection;
    
    try {
      // 测试多次ping的平均延迟
      const pingTimes = [];
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await connection.db.admin().ping();
        pingTimes.push(Date.now() - start);
      }
      
      const avgPing = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
      console.log(`📊 平均延迟: ${avgPing.toFixed(2)}ms`);
      
      if (avgPing < 50) {
        console.log('🚀 延迟优秀 (< 50ms)');
      } else if (avgPing < 200) {
        console.log('✅ 延迟良好 (< 200ms)');
      } else {
        console.log('⚠️ 延迟较高 (> 200ms)');
      }
      
      // 获取数据库统计信息
      try {
        const stats = await connection.db.stats();
        console.log(`💾 数据大小: ${this.formatBytes(stats.dataSize)}`);
        console.log(`🗄️ 存储大小: ${this.formatBytes(stats.storageSize)}`);
        console.log(`📇 索引数量: ${stats.indexes}`);
      } catch (error) {
        console.log('⚠️ 无法获取数据库统计信息 (权限限制)');
      }
      
    } catch (error) {
      console.warn(`⚠️ 性能测试部分失败: ${error.message}`);
    }
  }

  /**
   * 清理资源
   */
  async cleanup() {
    if (this.isConnected) {
      try {
        await mongoose.disconnect();
        console.log('\n👋 数据库连接已关闭');
      } catch (error) {
        console.error('⚠️ 关闭连接时出错:', error.message);
      }
    }
  }

  /**
   * 提供故障排除建议
   */
  provideTroubleshootingAdvice(error) {
    console.log('\n🔧 故障排除建议:');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('📡 网络连接问题:');
      console.log('   - 检查网络连接是否正常');
      console.log('   - 确认MongoDB服务是否启动 (本地数据库)');
      console.log('   - 检查防火墙设置');
      
    } else if (error.message.includes('Authentication failed')) {
      console.log('🔐 认证问题:');
      console.log('   - 检查用户名和密码是否正确');
      console.log('   - 确认用户是否有数据库访问权限');
      console.log('   - 检查IP白名单设置 (Atlas)');
      
    } else if (error.message.includes('Server selection timed out')) {
      console.log('⏱️ 服务器选择超时:');
      console.log('   - 检查连接字符串是否正确');
      console.log('   - 确认MongoDB服务是否运行');
      console.log('   - 尝试增加 serverSelectionTimeoutMS');
      
    } else {
      console.log('❓ 通用建议:');
      console.log('   - 检查 .env 文件中的 MONGODB_URI 配置');
      console.log('   - 确认MongoDB版本兼容性');
      console.log('   - 查看完整错误日志');
    }
    
    console.log('\n📚 更多帮助:');
    console.log('   - MongoDB Atlas: https://docs.atlas.mongodb.com/');
    console.log('   - Mongoose文档: https://mongoosejs.com/docs/');
  }

  /**
   * 辅助方法
   */
  maskConnectionString(str) {
    return str.replace(/\/\/.*:.*@/, '//***:***@');
  }

  getReadyStateText(state) {
    const states = {
      0: '断开连接',
      1: '已连接',
      2: '正在连接',
      3: '正在断开'
    };
    return states[state] || '未知状态';
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 运行测试
if (require.main === module) {
  const test = new DatabaseConnectionTest();
  test.runFullTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = DatabaseConnectionTest;
