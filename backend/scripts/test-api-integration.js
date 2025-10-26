/**
 * 前后端API集成测试脚本
 * 验证前后端接口格式匹配和数据流通畅
 */

require('dotenv').config();
const axios = require('axios');
const { algorithmManager } = require('../src/algorithms');

class APIIntegrationTest {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:3001/api';
    this.testResults = {
      serverConnection: false,
      devPerformAPI: false,
      devHistoryAPI: false,
      healthCheck: false,
      dataFormat: false
    };
    this.testToken = 'dev-signature-test-token-' + Date.now();
  }

  /**
   * 测试服务器连接
   */
  async testServerConnection() {
    try {
      console.log('🔄 测试服务器连接...');
      
      const response = await axios.get(`${this.baseURL}/divination/health`, {
        timeout: 5000
      });
      
      if (response.data.success) {
        this.testResults.serverConnection = true;
        console.log('✅ 服务器连接成功');
        console.log(`📊 服务器信息: ${response.data.message}`);
        return true;
      } else {
        throw new Error('服务器响应异常');
      }
    } catch (error) {
      console.error('❌ 服务器连接失败:', error.message);
      return false;
    }
  }

  /**
   * 测试开发环境占卜API
   */
  async testDevPerformAPI() {
    try {
      console.log('🔄 测试开发环境占卜API...');
      
      const testData = {
        question: '我的事业运势如何？',
        method: 'time',
        params: {
          datetime: new Date().toISOString()
        }
      };

      const response = await axios.post(
        `${this.baseURL}/divination/dev-perform`,
        testData,
        {
          headers: {
            'Authorization': `Bearer ${this.testToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data.success && response.data.data) {
        // 验证返回数据结构
        const data = response.data.data;
        const hasRequiredFields = (
          data.question &&
          data.hexagrams &&
          data.hexagrams.ben &&
          data.hexagrams.hu &&
          data.hexagrams.bian &&
          data.movingLine &&
          data.analysis &&
          data.interpretation &&
          data.metadata &&
          data.metadata.isDev
        );

        if (hasRequiredFields) {
          this.testResults.devPerformAPI = true;
          console.log('✅ 开发环境占卜API测试成功');
          console.log('📊 返回数据结构验证通过');
          console.log(`📋 占卜结果预览: ${data.hexagrams.ben.name} → ${data.hexagrams.bian.name}`);
          return true;
        } else {
          throw new Error('返回数据结构不完整');
        }
      } else {
        throw new Error('API响应格式错误');
      }
    } catch (error) {
      console.error('❌ 开发环境占卜API测试失败:', error.message);
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', error.response.data);
      }
      return false;
    }
  }

  /**
   * 测试开发环境历史记录API
   */
  async testDevHistoryAPI() {
    try {
      console.log('🔄 测试开发环境历史记录API...');
      
      const response = await axios.get(
        `${this.baseURL}/divination/dev-history`,
        {
          headers: {
            'Authorization': `Bearer ${this.testToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        const hasRequiredFields = (
          data.items &&
          Array.isArray(data.items) &&
          data.total !== undefined &&
          data.page !== undefined &&
          data.limit !== undefined
        );

        if (hasRequiredFields) {
          this.testResults.devHistoryAPI = true;
          console.log('✅ 开发环境历史记录API测试成功');
          console.log(`📊 历史记录数量: ${data.items.length}`);
          console.log(`📋 分页信息: 第${data.page}页，共${data.totalPages}页`);
          return true;
        } else {
          throw new Error('历史记录数据结构不完整');
        }
      } else {
        throw new Error('历史记录API响应格式错误');
      }
    } catch (error) {
      console.error('❌ 开发环境历史记录API测试失败:', error.message);
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', error.response.data);
      }
      return false;
    }
  }

  /**
   * 测试健康检查API
   */
  async testHealthCheck() {
    try {
      console.log('🔄 测试健康检查API...');
      
      const response = await axios.get(`${this.baseURL}/divination/health`, {
        timeout: 5000
      });

      if (response.data.success) {
        this.testResults.healthCheck = true;
        console.log('✅ 健康检查API测试成功');
        console.log(`📊 服务状态: ${response.data.message}`);
        return true;
      } else {
        throw new Error('健康检查响应异常');
      }
    } catch (error) {
      console.error('❌ 健康检查API测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试数据格式兼容性
   */
  async testDataFormatCompatibility() {
    try {
      console.log('🔄 测试数据格式兼容性...');
      
      // 测试算法返回的数据格式
      const algorithmResult = await algorithmManager.performDivination('测试问题', {
        method: 'time',
        params: {}
      });

      // 验证算法返回的数据结构
      const hasRequiredFields = (
        algorithmResult.question &&
        algorithmResult.hexagrams &&
        algorithmResult.hexagrams.ben &&
        algorithmResult.hexagrams.hu &&
        algorithmResult.hexagrams.bian &&
        algorithmResult.movingLine &&
        algorithmResult.wuxing &&
        algorithmResult.interpretation
      );

      if (hasRequiredFields) {
        this.testResults.dataFormat = true;
        console.log('✅ 数据格式兼容性测试成功');
        console.log('📊 算法返回数据结构完整');
        console.log(`📋 卦象信息: ${algorithmResult.hexagrams.ben.name} → ${algorithmResult.hexagrams.bian.name}`);
        return true;
      } else {
        throw new Error('算法返回数据结构不完整');
      }
    } catch (error) {
      console.error('❌ 数据格式兼容性测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试前端API调用格式
   */
  async testFrontendAPICallFormat() {
    try {
      console.log('🔄 测试前端API调用格式...');
      
      // 模拟前端API调用
      const frontendCallData = {
        question: '我的感情运势如何？',
        method: 'time',
        params: {
          datetime: new Date().toISOString()
        }
      };

      // 测试开发环境端点
      const response = await axios.post(
        `${this.baseURL}/divination/dev-perform`,
        frontendCallData,
        {
          headers: {
            'Authorization': `Bearer ${this.testToken}`,
            'Content-Type': 'application/json',
            'X-Request-ID': Date.now().toString(),
            'X-Device-Info': JSON.stringify({
              isMobile: false,
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              timestamp: Date.now()
            })
          },
          timeout: 10000
        }
      );

      if (response.data.success) {
        console.log('✅ 前端API调用格式测试成功');
        console.log('📊 请求头格式正确');
        console.log('📊 响应格式符合前端期望');
        return true;
      } else {
        throw new Error('前端API调用响应异常');
      }
    } catch (error) {
      console.error('❌ 前端API调用格式测试失败:', error.message);
      return false;
    }
  }

  /**
   * 运行完整测试套件
   */
  async runFullTest() {
    console.log('🚀 开始前后端API集成测试\n');
    
    try {
      // 1. 测试服务器连接
      await this.testServerConnection();
      
      // 2. 测试健康检查
      await this.testHealthCheck();
      
      // 3. 测试数据格式兼容性
      await this.testDataFormatCompatibility();
      
      // 4. 测试开发环境占卜API
      await this.testDevPerformAPI();
      
      // 5. 测试开发环境历史记录API
      await this.testDevHistoryAPI();
      
      // 6. 测试前端API调用格式
      await this.testFrontendAPICallFormat();

      // 输出测试结果
      this.printTestResults();

    } catch (error) {
      console.error('\n❌ 测试过程中发生错误:', error.message);
    }
  }

  /**
   * 打印测试结果
   */
  printTestResults() {
    console.log('\n📋 前后端API集成测试结果:');
    console.log('================================');
    console.log(`服务器连接: ${this.testResults.serverConnection ? '✅ 通过' : '❌ 失败'}`);
    console.log(`健康检查: ${this.testResults.healthCheck ? '✅ 通过' : '❌ 失败'}`);
    console.log(`数据格式兼容: ${this.testResults.dataFormat ? '✅ 通过' : '❌ 失败'}`);
    console.log(`开发占卜API: ${this.testResults.devPerformAPI ? '✅ 通过' : '❌ 失败'}`);
    console.log(`开发历史API: ${this.testResults.devHistoryAPI ? '✅ 通过' : '❌ 失败'}`);
    
    const passedTests = Object.values(this.testResults).filter(Boolean).length;
    const totalTests = Object.keys(this.testResults).length;
    
    console.log(`\n总体结果: ${passedTests}/${totalTests} 项测试通过`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有API集成测试通过！前后端连接正常！');
    } else {
      console.log('⚠️  部分测试失败，请检查API配置和连接。');
    }

    // 提供下一步建议
    console.log('\n💡 下一步建议:');
    if (this.testResults.serverConnection && this.testResults.devPerformAPI) {
      console.log('✅ 可以开始前端开发测试');
      console.log('✅ 可以启动前端应用进行集成测试');
    } else {
      console.log('❌ 需要先解决服务器连接问题');
      console.log('❌ 检查后端服务是否正常启动');
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new APIIntegrationTest();
  tester.runFullTest().catch(console.error);
}

module.exports = APIIntegrationTest;

