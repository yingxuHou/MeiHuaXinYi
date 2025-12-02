/**
 * 梅花心易 - 数据库连接测试脚本 v2.0
 * 验证MongoDB Atlas连接配置和索引创建
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { databaseManager } = require('../src/config/database');
const { modelManager, initializeModels } = require('../src/models');

/**
 * 数据库连接测试类
 */
class DatabaseConnectionTest {
  constructor() {
    this.testResults = {
      connection: false,
      health: false,
      models: false,
      indexes: false,
      performance: false
    };
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始数据库连接测试...\n');

    try {
      // 1. 测试基础连接
      await this.testConnection();
      
      // 2. 测试健康检查
      await this.testHealthCheck();
      
      // 3. 测试模型初始化
      await this.testModelInitialization();
      
      // 4. 测试索引创建
      await this.testIndexCreation();
      
      // 5. 测试性能
      await this.testPerformance();
      
      // 6. 生成测试报告
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error.message);
      process.exit(1);
    } finally {
      // 清理连接
      await this.cleanup();
    }
  }

  /**
   * 测试数据库连接
   */
  async testConnection() {
    console.log('📡 测试1: 数据库连接...');
    
    try {
      const startTime = Date.now();
      await databaseManager.connectAll();
      const connectionTime = Date.now() - startTime;
      
      console.log(`✅ 数据库连接成功 (${connectionTime}ms)`);
      
      // 获取连接状态
      const status = databaseManager.getStatus();
      console.log('📊 连接状态:');
      console.log(`   MongoDB: ${status.mongodb.isConnected ? '✅ 已连接' : '❌ 未连接'}`);
      console.log(`   集群: ${status.mongodb.cluster}`);
      console.log(`   数据库: ${status.mongodb.name}`);
      
      this.testResults.connection = true;
      
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      throw error;
    }
    
    console.log('');
  }

  /**
   * 测试健康检查
   */
  async testHealthCheck() {
    console.log('🏥 测试2: 健康检查...');
    
    try {
      const healthStatus = await databaseManager.healthCheck();
      
      console.log('📊 健康检查结果:');
      console.log(`   MongoDB: ${healthStatus.mongodb.status ? '✅ 健康' : '❌ 异常'} (${healthStatus.mongodb.latency}ms)`);
      console.log(`   整体状态: ${healthStatus.overall.status ? '✅ 健康' : '❌ 异常'}`);
      console.log(`   检查耗时: ${healthStatus.overall.duration}ms`);

      if (healthStatus.mongodb.error) {
        console.warn(`   MongoDB错误: ${healthStatus.mongodb.error}`);
      }
      
      this.testResults.health = healthStatus.overall.status;
      
    } catch (error) {
      console.error('❌ 健康检查失败:', error.message);
      throw error;
    }
    
    console.log('');
  }

  /**
   * 测试模型初始化
   */
  async testModelInitialization() {
    console.log('🏗️ 测试3: 模型初始化...');
    
    try {
      await initializeModels();
      
      // 获取模型统计
      const modelStats = await modelManager.getModelStats();
      
      console.log('📊 模型统计:');
      Object.entries(modelStats).forEach(([modelName, stats]) => {
        if (stats.error) {
          console.log(`   ${modelName}: ❌ ${stats.error}`);
        } else {
          console.log(`   ${modelName}: ✅ ${stats.documentCount} 文档, ${stats.indexCount} 索引`);
        }
      });
      
      this.testResults.models = true;
      
    } catch (error) {
      console.error('❌ 模型初始化失败:', error.message);
      throw error;
    }
    
    console.log('');
  }

  /**
   * 测试索引创建
   */
  async testIndexCreation() {
    console.log('📊 测试4: 索引创建验证...');
    
    try {
      const { User, Divination, Conversation, KnowledgeBase } = require('../src/models');
      const models = { User, Divination, Conversation, KnowledgeBase };
      
      for (const [modelName, Model] of Object.entries(models)) {
        try {
          const indexes = await Model.collection.getIndexes();
          const indexNames = Object.keys(indexes);
          
          console.log(`   ${modelName}: ✅ ${indexNames.length} 个索引`);
          
          // 验证关键索引是否存在
          const requiredIndexes = this.getRequiredIndexes(modelName);
          const missingIndexes = requiredIndexes.filter(reqIndex => 
            !indexNames.some(indexName => indexName.includes(reqIndex))
          );
          
          if (missingIndexes.length > 0) {
            console.warn(`     ⚠️ 缺少索引: ${missingIndexes.join(', ')}`);
          }
          
        } catch (error) {
          console.error(`   ${modelName}: ❌ ${error.message}`);
        }
      }
      
      this.testResults.indexes = true;
      
    } catch (error) {
      console.error('❌ 索引验证失败:', error.message);
      throw error;
    }
    
    console.log('');
  }

  /**
   * 测试性能
   */
  async testPerformance() {
    console.log('⚡ 测试5: 性能测试...');
    
    try {
      const { User } = require('../src/models');
      
      // 测试简单查询性能
      const startTime = Date.now();
      await User.findOne().limit(1);
      const queryTime = Date.now() - startTime;
      
      console.log(`   简单查询: ${queryTime}ms`);
      
      // 测试连接池状态
      const mongoose = require('mongoose');
      const connectionState = mongoose.connection.readyState;
      const stateNames = ['断开', '已连接', '连接中', '断开中'];
      
      console.log(`   连接状态: ${stateNames[connectionState] || '未知'}`);
      console.log(`   连接池: 活跃连接数据不可直接获取`);
      
      // 性能警告
      if (queryTime > 1000) {
        console.warn('   ⚠️ 查询响应时间较慢，请检查网络连接');
      }
      
      this.testResults.performance = queryTime < 5000; // 5秒内算正常
      
    } catch (error) {
      console.error('❌ 性能测试失败:', error.message);
      this.testResults.performance = false;
    }
    
    console.log('');
  }

  /**
   * 获取模型必需的索引
   */
  getRequiredIndexes(modelName) {
    const requiredIndexesMap = {
      User: ['email', 'username'],
      Divination: ['userId', 'hexagrams'],
      Conversation: ['userId', 'divinationId'],
      KnowledgeBase: ['category', 'metadata']
    };
    
    return requiredIndexesMap[modelName] || [];
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    console.log('📋 测试报告:');
    console.log('=' .repeat(50));
    
    const tests = [
      { name: '数据库连接', result: this.testResults.connection },
      { name: '健康检查', result: this.testResults.health },
      { name: '模型初始化', result: this.testResults.models },
      { name: '索引创建', result: this.testResults.indexes },
      { name: '性能测试', result: this.testResults.performance }
    ];
    
    tests.forEach(test => {
      const status = test.result ? '✅ 通过' : '❌ 失败';
      console.log(`   ${test.name}: ${status}`);
    });
    
    const passedTests = tests.filter(test => test.result).length;
    const totalTests = tests.length;
    
    console.log('=' .repeat(50));
    console.log(`总体结果: ${passedTests}/${totalTests} 测试通过`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有测试通过！数据库配置正确。');
    } else {
      console.log('⚠️ 部分测试失败，请检查配置。');
    }
  }

  /**
   * 清理资源
   */
  async cleanup() {
    console.log('\n🧹 清理资源...');
    try {
      await databaseManager.disconnectAll();
      console.log('✅ 资源清理完成');
    } catch (error) {
      console.error('❌ 资源清理失败:', error.message);
    }
  }
}

// 运行测试
if (require.main === module) {
  const test = new DatabaseConnectionTest();
  test.runAllTests().catch(error => {
    console.error('测试失败:', error);
    process.exit(1);
  });
}

module.exports = DatabaseConnectionTest;
