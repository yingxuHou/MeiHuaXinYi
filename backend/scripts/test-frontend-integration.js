/**
 * 前后端集成测试脚本
 * 模拟前端调用后端API的完整流程
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const axios = require('axios');
const { User } = require('../src/models');
const mongoose = require('mongoose');

/**
 * 前后端集成测试管理器
 */
class FrontendIntegrationTester {
  constructor() {
    this.baseURL = `http://localhost:${process.env.PORT || 3001}/api`;
    this.authToken = null;
    this.testUserId = null;
    this.testResults = [];
  }

  /**
   * 运行完整的前后端集成测试
   */
  async runFullIntegrationTest() {
    console.log('🔗 梅花心易前后端集成测试开始...\n');
    console.log('=' .repeat(60));

    try {
      // 1. 初始化数据库连接
      await this.initializeDatabase();
      
      // 2. 测试用户认证流程
      await this.testUserAuthentication();
      
      // 3. 测试占卜API完整流程
      await this.testDivinationFlow();
      
      // 4. 测试权限控制
      await this.testPermissionControl();
      
      // 5. 测试错误处理
      await this.testErrorHandling();
      
      // 6. 清理测试数据
      await this.cleanup();
      
      // 7. 生成测试报告
      this.generateIntegrationReport();
      
      console.log('\n🎉 前后端集成测试完成！');
      
    } catch (error) {
      console.error('❌ 集成测试失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 初始化数据库连接
   */
  async initializeDatabase() {
    console.log('📡 初始化数据库连接...');

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meihuaxinyi';
      await mongoose.connect(mongoUri);
      console.log('✅ 数据库连接成功');
    } catch (error) {
      throw new Error(`数据库连接失败: ${error.message}`);
    }
  }

  /**
   * 测试用户认证流程
   */
  async testUserAuthentication() {
    console.log('\n👤 测试用户认证流程...');
    
    try {
      // 创建测试用户
      const testUser = new User({
        email: 'integration-test@example.com',
        username: 'integrationtest',
        password: 'testpassword123',
        subscription: {
          type: 'premium',
          features: [
            { name: 'unlimited_divination', enabled: true },
            { name: 'ai_consultant', enabled: true }
          ]
        },
        usage: {
          freeCountToday: 3
        }
      });

      await testUser.save();
      this.testUserId = testUser._id;

      // 测试登录
      const loginResponse = await axios.post(`${this.baseURL}/auth/login`, {
        email: 'integration-test@example.com',
        password: 'testpassword123'
      });

      if (loginResponse.data.success) {
        this.authToken = loginResponse.data.data.accessToken;
        console.log('✅ 用户认证成功');
        this.addTestResult('用户认证', true, '登录成功，获取token');
      } else {
        throw new Error('登录失败');
      }
      
    } catch (error) {
      this.addTestResult('用户认证', false, error.message);
      throw error;
    }
  }

  /**
   * 测试占卜API完整流程
   */
  async testDivinationFlow() {
    console.log('\n🔮 测试占卜API完整流程...');
    
    const headers = {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    };

    try {
      // 1. 测试时间起卦
      console.log('   测试时间起卦...');
      const timeResponse = await axios.post(`${this.baseURL}/divination/perform`, {
        question: '前后端集成测试：今日运势如何？',
        method: 'time',
        params: {
          datetime: new Date().toISOString()
        }
      }, { headers });

      if (timeResponse.data.success) {
        console.log(`   ✅ 时间起卦成功: ${timeResponse.data.data.hexagrams.ben.name}`);
        this.addTestResult('时间起卦', true, {
          hexagram: timeResponse.data.data.hexagrams.ben.name,
          fortune: timeResponse.data.data.analysis.fortune
        });

        const divinationId = timeResponse.data.data.id;

        // 2. 测试获取占卜详情
        console.log('   测试获取占卜详情...');
        const detailResponse = await axios.get(`${this.baseURL}/divination/${divinationId}`, { headers });
        
        if (detailResponse.data.success) {
          console.log('   ✅ 获取占卜详情成功');
          this.addTestResult('获取占卜详情', true, '详情获取成功');
        }

        // 3. 测试评价功能
        console.log('   测试评价功能...');
        const ratingResponse = await axios.put(`${this.baseURL}/divination/${divinationId}/rating`, {
          overall: 5,
          accuracy: 4,
          helpfulness: 5,
          feedback: '集成测试评价'
        }, { headers });

        if (ratingResponse.data.success) {
          console.log('   ✅ 评价功能成功');
          this.addTestResult('评价功能', true, '评价提交成功');
        }

      } else {
        throw new Error('时间起卦失败');
      }

      // 4. 测试数字起卦
      console.log('   测试数字起卦...');
      const numberResponse = await axios.post(`${this.baseURL}/divination/perform`, {
        question: '前后端集成测试：投资运势如何？',
        method: 'number',
        params: {
          numbers: [888, 666]
        }
      }, { headers });

      if (numberResponse.data.success) {
        console.log(`   ✅ 数字起卦成功: ${numberResponse.data.data.hexagrams.ben.name}`);
        this.addTestResult('数字起卦', true, {
          hexagram: numberResponse.data.data.hexagrams.ben.name
        });
      }

      // 5. 测试手动起卦
      console.log('   测试手动起卦...');
      const manualResponse = await axios.post(`${this.baseURL}/divination/perform`, {
        question: '前后端集成测试：感情运势如何？',
        method: 'manual',
        params: {
          upperGua: 1,
          lowerGua: 8,
          movingLine: 3
        }
      }, { headers });

      if (manualResponse.data.success) {
        console.log(`   ✅ 手动起卦成功: ${manualResponse.data.data.hexagrams.ben.name}`);
        this.addTestResult('手动起卦', true, {
          hexagram: manualResponse.data.data.hexagrams.ben.name
        });
      }

      // 6. 测试获取历史记录
      console.log('   测试获取历史记录...');
      const historyResponse = await axios.get(`${this.baseURL}/divination/history?page=1&limit=10`, { headers });

      if (historyResponse.data.success && historyResponse.data.data.divinations.length > 0) {
        console.log(`   ✅ 获取历史记录成功: ${historyResponse.data.data.divinations.length}条记录`);
        this.addTestResult('获取历史记录', true, {
          count: historyResponse.data.data.divinations.length
        });
      }

      // 7. 测试获取统计数据
      console.log('   测试获取统计数据...');
      const statsResponse = await axios.get(`${this.baseURL}/divination/stats`, { headers });

      if (statsResponse.data.success) {
        console.log(`   ✅ 获取统计数据成功: 总计${statsResponse.data.data.total}次`);
        this.addTestResult('获取统计数据', true, {
          total: statsResponse.data.data.total
        });
      }

    } catch (error) {
      this.addTestResult('占卜流程', false, error.message);
      throw error;
    }
  }

  /**
   * 测试权限控制
   */
  async testPermissionControl() {
    console.log('\n🔒 测试权限控制...');
    
    try {
      // 测试无token访问
      const response = await axios.post(`${this.baseURL}/divination/perform`, {
        question: '无权限测试',
        method: 'time',
        params: {}
      });
      
      this.addTestResult('权限控制', false, '应该拒绝无token访问');
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ 权限控制正常：正确拒绝无token访问');
        this.addTestResult('权限控制', true, '正确拒绝无token访问');
      } else {
        this.addTestResult('权限控制', false, error.message);
      }
    }
  }

  /**
   * 测试错误处理
   */
  async testErrorHandling() {
    console.log('\n⚠️ 测试错误处理...');
    
    const headers = {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    };

    try {
      // 测试无效参数
      const response = await axios.post(`${this.baseURL}/divination/perform`, {
        question: '', // 空问题
        method: 'invalid', // 无效方法
        params: {}
      }, { headers });
      
      this.addTestResult('错误处理', false, '应该拒绝无效参数');
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ 错误处理正常：正确拒绝无效参数');
        this.addTestResult('错误处理', true, '正确拒绝无效参数');
      } else {
        this.addTestResult('错误处理', false, error.message);
      }
    }
  }

  /**
   * 清理测试数据
   */
  async cleanup() {
    console.log('\n🧹 清理测试数据...');
    
    try {
      if (this.testUserId) {
        await User.findByIdAndDelete(this.testUserId);
        console.log('✅ 测试用户已删除');
      }
    } catch (error) {
      console.warn('⚠️ 清理测试数据失败:', error.message);
    }
  }

  /**
   * 添加测试结果
   */
  addTestResult(testName, passed, details) {
    this.testResults.push({
      testName,
      passed,
      details,
      timestamp: new Date()
    });
  }

  /**
   * 生成集成测试报告
   */
  generateIntegrationReport() {
    console.log('\n📊 前后端集成测试报告');
    console.log('=' .repeat(60));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${failedTests}`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n详细结果:');
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`  ${status} ${result.testName}`);
      if (result.details && typeof result.details === 'object') {
        console.log(`     ${JSON.stringify(result.details)}`);
      } else if (result.details) {
        console.log(`     ${result.details}`);
      }
    });
    
    console.log('=' .repeat(60));
    
    if (passedTests === totalTests) {
      console.log('🎊 前后端集成测试全部通过！系统已准备就绪。');
      console.log('💡 可以启动前端应用进行实际测试。');
    } else {
      console.log('⚠️ 部分集成测试失败，请检查相关功能。');
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new FrontendIntegrationTester();
  tester.runFullIntegrationTest();
}

module.exports = FrontendIntegrationTester;
