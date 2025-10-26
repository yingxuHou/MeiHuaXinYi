/**
 * MongoDB Atlas 连接测试脚本
 * 用于验证云端数据库连接是否正常
 */

require('dotenv').config();
const mongoose = require('mongoose');

/**
 * MongoDB Atlas 连接测试类
 */
class MongoAtlasTest {
  constructor() {
    this.connectionString = this.buildConnectionString();
    this.testResults = {
      connection: false,
      authentication: false,
      readWrite: false,
      indexes: false
    };
  }

  /**
   * 构建连接字符串
   * 处理特殊字符和URL编码
   */
  buildConnectionString() {
    // 从环境变量获取连接信息
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('❌ MONGODB_URI 环境变量未设置');
    }

    // 检查是否为Atlas连接
    if (!uri.includes('mongodb+srv://')) {
      console.warn('⚠️  警告: 连接字符串不是MongoDB Atlas格式');
    }

    // 验证连接字符串格式
    try {
      new URL(uri.replace('mongodb+srv://', 'https://'));
      console.log('✅ 连接字符串格式验证通过');
    } catch (error) {
      throw new Error(`❌ 连接字符串格式错误: ${error.message}`);
    }

    return uri;
  }

  /**
   * 获取连接选项
   */
  getConnectionOptions() {
    return {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // 10秒超时
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // 使用IPv4
      retryWrites: true,
      w: 'majority',
      readPreference: 'primary',
      ssl: true,
      authSource: 'admin'
    };
  }

  /**
   * 测试基本连接
   */
  async testConnection() {
    try {
      console.log('🔄 测试MongoDB Atlas连接...');
      console.log(`📡 连接地址: ${this.maskConnectionString(this.connectionString)}`);

      await mongoose.connect(this.connectionString, this.getConnectionOptions());
      
      this.testResults.connection = true;
      console.log('✅ MongoDB Atlas连接成功');
      
      return true;
    } catch (error) {
      console.error('❌ 连接失败:', error.message);
      
      // 提供详细的错误诊断
      this.diagnoseConnectionError(error);
      
      return false;
    }
  }

  /**
   * 测试身份验证
   */
  async testAuthentication() {
    try {
      console.log('🔄 测试身份验证...');
      
      // 尝试执行一个需要认证的操作
      const admin = mongoose.connection.db.admin();
      const result = await admin.ping();
      
      if (result.ok === 1) {
        this.testResults.authentication = true;
        console.log('✅ 身份验证成功');
        return true;
      }
      
      throw new Error('Ping命令失败');
    } catch (error) {
      console.error('❌ 身份验证失败:', error.message);
      return false;
    }
  }

  /**
   * 测试读写操作
   */
  async testReadWrite() {
    try {
      console.log('🔄 测试读写操作...');
      
      // 创建测试集合
      const testCollection = mongoose.connection.db.collection('connection_test');
      
      // 写入测试
      const testDoc = {
        _id: 'test_' + Date.now(),
        message: 'MongoDB Atlas连接测试',
        timestamp: new Date(),
        app: 'meihuaxinyi'
      };
      
      await testCollection.insertOne(testDoc);
      console.log('✅ 写入测试成功');
      
      // 读取测试
      const foundDoc = await testCollection.findOne({ _id: testDoc._id });
      if (foundDoc && foundDoc.message === testDoc.message) {
        console.log('✅ 读取测试成功');
      } else {
        throw new Error('读取的数据不匹配');
      }
      
      // 清理测试数据
      await testCollection.deleteOne({ _id: testDoc._id });
      console.log('✅ 清理测试数据成功');
      
      this.testResults.readWrite = true;
      return true;
    } catch (error) {
      console.error('❌ 读写测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试索引创建
   */
  async testIndexes() {
    try {
      console.log('🔄 测试索引操作...');
      
      const testCollection = mongoose.connection.db.collection('index_test');
      
      // 创建测试索引
      await testCollection.createIndex({ testField: 1 });
      console.log('✅ 索引创建成功');
      
      // 验证索引
      const indexes = await testCollection.indexes();
      const hasTestIndex = indexes.some(index => 
        index.key && index.key.testField === 1
      );
      
      if (hasTestIndex) {
        console.log('✅ 索引验证成功');
      } else {
        throw new Error('索引验证失败');
      }
      
      // 清理测试索引
      await testCollection.dropIndex({ testField: 1 });
      console.log('✅ 索引清理成功');
      
      this.testResults.indexes = true;
      return true;
    } catch (error) {
      console.error('❌ 索引测试失败:', error.message);
      return false;
    }
  }

  /**
   * 获取数据库信息
   */
  async getDatabaseInfo() {
    try {
      console.log('📊 获取数据库信息...');
      
      const admin = mongoose.connection.db.admin();
      const dbStats = await mongoose.connection.db.stats();
      const serverStatus = await admin.serverStatus();
      
      console.log('📈 数据库统计信息:');
      console.log(`  数据库名称: ${mongoose.connection.db.databaseName}`);
      console.log(`  集合数量: ${dbStats.collections}`);
      console.log(`  数据大小: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  索引大小: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  MongoDB版本: ${serverStatus.version}`);
      console.log(`  主机信息: ${serverStatus.host}`);
      
    } catch (error) {
      console.error('❌ 获取数据库信息失败:', error.message);
    }
  }

  /**
   * 诊断连接错误
   */
  diagnoseConnectionError(error) {
    console.log('\n🔍 错误诊断:');
    
    if (error.message.includes('authentication failed')) {
      console.log('  - 用户名或密码错误');
      console.log('  - 请检查MongoDB Atlas用户凭据');
    }
    
    if (error.message.includes('network')) {
      console.log('  - 网络连接问题');
      console.log('  - 请检查网络连接和防火墙设置');
    }
    
    if (error.message.includes('timeout')) {
      console.log('  - 连接超时');
      console.log('  - 请检查MongoDB Atlas IP白名单设置');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('  - DNS解析失败');
      console.log('  - 请检查集群地址是否正确');
    }
    
    console.log('\n💡 解决建议:');
    console.log('  1. 确认MongoDB Atlas集群状态正常');
    console.log('  2. 检查IP白名单是否包含当前IP (0.0.0.0/0 允许所有IP)');
    console.log('  3. 验证用户名和密码是否正确');
    console.log('  4. 确认数据库用户有足够的权限');
    console.log('  5. 检查网络连接是否稳定');
  }

  /**
   * 掩码连接字符串中的敏感信息
   */
  maskConnectionString(connectionString) {
    return connectionString.replace(
      /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
      'mongodb+srv://$1:***@'
    );
  }

  /**
   * 运行完整测试套件
   */
  async runFullTest() {
    console.log('🚀 开始MongoDB Atlas连接测试\n');
    
    try {
      // 1. 测试连接
      const connectionSuccess = await this.testConnection();
      if (!connectionSuccess) {
        throw new Error('连接测试失败');
      }
      
      // 2. 测试身份验证
      await this.testAuthentication();
      
      // 3. 测试读写操作
      await this.testReadWrite();
      
      // 4. 测试索引操作
      await this.testIndexes();
      
      // 5. 获取数据库信息
      await this.getDatabaseInfo();
      
      // 输出测试结果
      this.printTestResults();
      
    } catch (error) {
      console.error('\n❌ 测试过程中发生错误:', error.message);
    } finally {
      // 关闭连接
      await mongoose.connection.close();
      console.log('\n🔌 数据库连接已关闭');
    }
  }

  /**
   * 打印测试结果
   */
  printTestResults() {
    console.log('\n📋 测试结果汇总:');
    console.log('================================');
    console.log(`连接测试: ${this.testResults.connection ? '✅ 通过' : '❌ 失败'}`);
    console.log(`身份验证: ${this.testResults.authentication ? '✅ 通过' : '❌ 失败'}`);
    console.log(`读写操作: ${this.testResults.readWrite ? '✅ 通过' : '❌ 失败'}`);
    console.log(`索引操作: ${this.testResults.indexes ? '✅ 通过' : '❌ 失败'}`);
    
    const passedTests = Object.values(this.testResults).filter(Boolean).length;
    const totalTests = Object.keys(this.testResults).length;
    
    console.log(`\n总体结果: ${passedTests}/${totalTests} 项测试通过`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有测试通过！MongoDB Atlas连接配置正确。');
    } else {
      console.log('⚠️  部分测试失败，请检查配置和权限设置。');
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new MongoAtlasTest();
  tester.runFullTest().catch(console.error);
}

module.exports = MongoAtlasTest;
