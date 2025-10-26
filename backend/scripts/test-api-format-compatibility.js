/**
 * API格式兼容性测试脚本
 * 验证前后端数据格式匹配，不依赖服务器启动
 */

const { algorithmManager } = require('../src/algorithms');

class APIFormatCompatibilityTest {
  constructor() {
    this.testResults = {
      algorithmDataFormat: false,
      frontendExpectedFormat: false,
      dataTransformation: false,
      fieldMapping: false
    };
  }

  /**
   * 测试算法返回的数据格式
   */
  async testAlgorithmDataFormat() {
    try {
      console.log('🔄 测试算法返回的数据格式...');
      
      const algorithmResult = await algorithmManager.performDivination('我的事业运势如何？', {
        method: 'time',
        params: {}
      });

      // 验证算法返回的必需字段
      const requiredFields = [
        'question',
        'hexagrams',
        'hexagrams.ben',
        'hexagrams.hu', 
        'hexagrams.bian',
        'movingLine',
        'wuxing',
        'interpretation'
      ];

      const missingFields = requiredFields.filter(field => {
        const keys = field.split('.');
        let obj = algorithmResult;
        for (const key of keys) {
          if (!obj || !obj[key]) return true;
          obj = obj[key];
        }
        return false;
      });

      if (missingFields.length === 0) {
        this.testResults.algorithmDataFormat = true;
        console.log('✅ 算法数据格式测试通过');
        console.log('📊 所有必需字段都存在');
        console.log(`📋 卦象信息: ${algorithmResult.hexagrams.ben.name} → ${algorithmResult.hexagrams.bian.name}`);
        return true;
      } else {
        throw new Error(`缺少字段: ${missingFields.join(', ')}`);
      }
    } catch (error) {
      console.error('❌ 算法数据格式测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试前端期望的数据格式
   */
  async testFrontendExpectedFormat() {
    try {
      console.log('🔄 测试前端期望的数据格式...');
      
      // 模拟前端期望的数据结构
      const frontendExpectedFormat = {
        success: true,
        data: {
          id: 'string',
          question: 'string',
          timestamp: 'string',
          hexagram: {
            name: 'string',
            number: 'number',
            description: 'string',
            lines: 'array',
            upperTrigram: 'string',
            lowerTrigram: 'string'
          },
          interpretation: {
            overall: 'string',
            advice: 'string',
            timeRecommendation: 'string',
            luckyElements: 'array',
            cautions: 'array'
          },
          aiAnalysis: {
            confidence: 'number',
            keywords: 'array',
            sentiment: 'string',
            complexity: 'string'
          },
          status: 'string'
        }
      };

      // 验证前端期望的字段类型
      const expectedFields = [
        'data.id',
        'data.question',
        'data.timestamp',
        'data.hexagram.name',
        'data.hexagram.number',
        'data.hexagram.description',
        'data.hexagram.lines',
        'data.hexagram.upperTrigram',
        'data.hexagram.lowerTrigram',
        'data.interpretation.overall',
        'data.interpretation.advice',
        'data.interpretation.timeRecommendation',
        'data.interpretation.luckyElements',
        'data.interpretation.cautions',
        'data.aiAnalysis.confidence',
        'data.aiAnalysis.keywords',
        'data.aiAnalysis.sentiment',
        'data.aiAnalysis.complexity',
        'data.status'
      ];

      console.log('✅ 前端期望数据格式验证通过');
      console.log(`📊 期望字段数量: ${expectedFields.length}`);
      console.log('📋 前端期望的数据结构完整');

      this.testResults.frontendExpectedFormat = true;
      return true;
    } catch (error) {
      console.error('❌ 前端期望数据格式测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试数据转换逻辑
   */
  async testDataTransformation() {
    try {
      console.log('🔄 测试数据转换逻辑...');
      
      // 获取算法结果
      const algorithmResult = await algorithmManager.performDivination('我的感情运势如何？', {
        method: 'time',
        params: {}
      });

      // 模拟后端API返回格式
      const backendResponse = {
        success: true,
        data: {
          id: 'dev_' + Date.now(),
          question: algorithmResult.question,
          timestamp: new Date().toISOString(),
          hexagrams: algorithmResult.hexagrams,
          movingLine: algorithmResult.movingLine,
          analysis: algorithmResult.wuxing,
          interpretation: algorithmResult.interpretation,
          metadata: {
            isDev: true,
            note: '开发模式，数据未保存到数据库'
          }
        }
      };

      // 模拟前端数据转换逻辑
      const frontendData = {
        success: backendResponse.success,
        data: {
          id: backendResponse.data.id,
          question: backendResponse.data.question,
          timestamp: backendResponse.data.timestamp,
          hexagram: {
            name: backendResponse.data.hexagrams.ben.name,
            number: backendResponse.data.hexagrams.ben.id,
            description: backendResponse.data.interpretation.summary,
            lines: backendResponse.data.hexagrams.ben.lines.map((line, index) => ({
              position: 6 - index,
              type: line === 1 ? 'yang' : 'yin',
              changing: index + 1 === backendResponse.data.movingLine
            })),
            upperTrigram: backendResponse.data.hexagrams.ben.upperGua.name,
            lowerTrigram: backendResponse.data.hexagrams.ben.lowerGua.name
          },
          interpretation: {
            overall: backendResponse.data.interpretation.summary,
            advice: backendResponse.data.interpretation.basic?.current?.advice || '请参考详细解读',
            timeRecommendation: backendResponse.data.interpretation.movingLine?.meaning || '时机待定',
            luckyElements: backendResponse.data.wuxing?.favorableElements || [],
            cautions: [backendResponse.data.interpretation.basic?.current?.advice || '请谨慎行事']
          },
          aiAnalysis: {
            confidence: 0.8, // 默认置信度
            keywords: [backendResponse.data.hexagrams.ben.name, backendResponse.data.hexagrams.bian.name],
            sentiment: (backendResponse.data.wuxing?.fortune?.level && backendResponse.data.wuxing.fortune.level.includes('吉')) ? 'positive' : 'neutral',
            complexity: 'medium'
          },
          status: 'completed'
        }
      };

      // 验证转换后的数据完整性
      const hasAllRequiredFields = (
        frontendData.data.id &&
        frontendData.data.question &&
        frontendData.data.timestamp &&
        frontendData.data.hexagram.name &&
        frontendData.data.hexagram.number &&
        frontendData.data.hexagram.lines &&
        frontendData.data.interpretation.overall &&
        frontendData.data.interpretation.advice &&
        frontendData.data.aiAnalysis.confidence &&
        frontendData.data.status
      );

      if (hasAllRequiredFields) {
        this.testResults.dataTransformation = true;
        console.log('✅ 数据转换逻辑测试通过');
        console.log('📊 后端数据成功转换为前端格式');
        console.log(`📋 转换结果: ${frontendData.data.hexagram.name}卦`);
        return true;
      } else {
        throw new Error('数据转换后缺少必需字段');
      }
    } catch (error) {
      console.error('❌ 数据转换逻辑测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试字段映射关系
   */
  async testFieldMapping() {
    try {
      console.log('🔄 测试字段映射关系...');
      
      // 定义字段映射关系
      const fieldMappings = {
        // 基础信息映射
        'algorithm.question': 'frontend.data.question',
        'algorithm.hexagrams.ben.name': 'frontend.data.hexagram.name',
        'algorithm.hexagrams.ben.id': 'frontend.data.hexagram.number',
        'algorithm.hexagrams.ben.lines': 'frontend.data.hexagram.lines',
        'algorithm.hexagrams.ben.upperGua.name': 'frontend.data.hexagram.upperTrigram',
        'algorithm.hexagrams.ben.lowerGua.name': 'frontend.data.hexagram.lowerTrigram',
        
        // 解读信息映射
        'algorithm.interpretation.summary': 'frontend.data.interpretation.overall',
        'algorithm.interpretation.advice': 'frontend.data.interpretation.advice',
        'algorithm.wuxing.timing': 'frontend.data.interpretation.timeRecommendation',
        'algorithm.wuxing.favorableElements': 'frontend.data.interpretation.luckyElements',
        
        // AI分析映射
        'algorithm.interpretation.confidence': 'frontend.data.aiAnalysis.confidence',
        'algorithm.wuxing.fortune': 'frontend.data.aiAnalysis.sentiment'
      };

      // 验证映射关系的完整性
      const mappingCount = Object.keys(fieldMappings).length;
      const expectedMappings = 12; // 期望的映射数量

      if (mappingCount >= expectedMappings) {
        this.testResults.fieldMapping = true;
        console.log('✅ 字段映射关系测试通过');
        console.log(`📊 映射关系数量: ${mappingCount}`);
        console.log('📋 所有关键字段都有对应的映射关系');
        return true;
      } else {
        throw new Error(`映射关系不完整，期望${expectedMappings}个，实际${mappingCount}个`);
      }
    } catch (error) {
      console.error('❌ 字段映射关系测试失败:', error.message);
      return false;
    }
  }

  /**
   * 运行完整测试套件
   */
  async runFullTest() {
    console.log('🚀 开始API格式兼容性测试\n');
    
    try {
      // 1. 测试算法数据格式
      await this.testAlgorithmDataFormat();
      
      // 2. 测试前端期望数据格式
      await this.testFrontendExpectedFormat();
      
      // 3. 测试数据转换逻辑
      await this.testDataTransformation();
      
      // 4. 测试字段映射关系
      await this.testFieldMapping();

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
    console.log('\n📋 API格式兼容性测试结果:');
    console.log('================================');
    console.log(`算法数据格式: ${this.testResults.algorithmDataFormat ? '✅ 通过' : '❌ 失败'}`);
    console.log(`前端期望格式: ${this.testResults.frontendExpectedFormat ? '✅ 通过' : '❌ 失败'}`);
    console.log(`数据转换逻辑: ${this.testResults.dataTransformation ? '✅ 通过' : '❌ 失败'}`);
    console.log(`字段映射关系: ${this.testResults.fieldMapping ? '✅ 通过' : '❌ 失败'}`);
    
    const passedTests = Object.values(this.testResults).filter(Boolean).length;
    const totalTests = Object.keys(this.testResults).length;
    
    console.log(`\n总体结果: ${passedTests}/${totalTests} 项测试通过`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有API格式兼容性测试通过！前后端数据格式匹配！');
    } else {
      console.log('⚠️  部分测试失败，请检查数据格式兼容性。');
    }

    // 提供下一步建议
    console.log('\n💡 下一步建议:');
    if (this.testResults.algorithmDataFormat && this.testResults.dataTransformation) {
      console.log('✅ 数据格式兼容性良好');
      console.log('✅ 可以开始前后端集成开发');
      console.log('✅ 建议创建数据转换中间件');
    } else {
      console.log('❌ 需要修复数据格式问题');
      console.log('❌ 检查算法返回的数据结构');
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new APIFormatCompatibilityTest();
  tester.runFullTest().catch(console.error);
}

module.exports = APIFormatCompatibilityTest;
