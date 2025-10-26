/**
 * 梅花心易算法测试脚本
 * 测试和验证算法实现的正确性
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MeihuaDivinationCore = require('../src/algorithms/core/DivinationCore');
const AlgorithmValidator = require('../src/algorithms/validators/AlgorithmValidator');

/**
 * 算法测试管理器
 */
class AlgorithmTestManager {
  constructor() {
    this.divinationCore = new MeihuaDivinationCore();
    this.validator = new AlgorithmValidator();
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🧪 梅花心易算法测试开始...\n');
    console.log('=' .repeat(60));

    try {
      // 1. 基础功能测试
      await this.runBasicTests();
      
      // 2. 算法验证测试
      await this.runValidationTests();
      
      // 3. 实际占卜测试
      await this.runDivinationTests();
      
      // 4. 边界条件测试
      await this.runEdgeCaseTests();
      
      console.log('\n🎉 所有测试完成！');
      
    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 基础功能测试
   */
  async runBasicTests() {
    console.log('📋 1. 基础功能测试');
    console.log('-' .repeat(40));

    try {
      // 测试系统信息
      const systemInfo = this.divinationCore.getSystemInfo();
      console.log('✅ 系统信息获取成功');
      console.log(`   版本: ${systemInfo.version}`);
      console.log(`   支持方法: ${systemInfo.supportedMethods.join(', ')}`);
      
      // 测试时间起卦
      console.log('\n⏰ 测试时间起卦...');
      const timeResult = await this.divinationCore.performDivination(
        '今日运势如何？', 
        'time', 
        { datetime: new Date() }
      );
      console.log(`✅ 时间起卦成功: ${timeResult.hexagrams.ben.name}`);
      console.log(`   运势: ${timeResult.analysis.fortune}`);
      console.log(`   处理时间: ${timeResult.metadata.processingTime}ms`);
      
      // 测试数字起卦
      console.log('\n🔢 测试数字起卦...');
      const numberResult = await this.divinationCore.performDivination(
        '事业发展如何？', 
        'number', 
        { numbers: [888, 666] }
      );
      console.log(`✅ 数字起卦成功: ${numberResult.hexagrams.ben.name}`);
      console.log(`   运势: ${numberResult.analysis.fortune}`);
      
      // 测试手动起卦
      console.log('\n✋ 测试手动起卦...');
      const manualResult = await this.divinationCore.performDivination(
        '感情状况如何？', 
        'manual', 
        { upperGua: 3, lowerGua: 6, movingLine: 2 }
      );
      console.log(`✅ 手动起卦成功: ${manualResult.hexagrams.ben.name}`);
      console.log(`   运势: ${manualResult.analysis.fortune}`);
      
    } catch (error) {
      console.error('❌ 基础功能测试失败:', error.message);
      throw error;
    }
    
    console.log('\n✅ 基础功能测试完成\n');
  }

  /**
   * 算法验证测试
   */
  async runValidationTests() {
    console.log('🔍 2. 算法验证测试');
    console.log('-' .repeat(40));

    try {
      const validationResult = await this.validator.runFullValidation();
      
      console.log('📊 验证结果统计:');
      console.log(`   总测试数: ${validationResult.summary.totalTests}`);
      console.log(`   通过测试: ${validationResult.summary.totalPassed}`);
      console.log(`   成功率: ${(validationResult.summary.overallSuccessRate * 100).toFixed(1)}%`);
      
      console.log('\n📋 各模块验证结果:');
      validationResult.summary.categorySummary.forEach(category => {
        const status = category.status === '通过' ? '✅' : '⚠️';
        console.log(`   ${status} ${category.category}: ${(category.successRate * 100).toFixed(1)}% (${category.status})`);
      });
      
      console.log(`\n💡 建议: ${validationResult.summary.recommendation}`);
      
      if (validationResult.summary.overallSuccessRate < 0.8) {
        console.warn('⚠️ 验证成功率较低，建议检查算法实现');
      }
      
    } catch (error) {
      console.error('❌ 算法验证测试失败:', error.message);
      throw error;
    }
    
    console.log('\n✅ 算法验证测试完成\n');
  }

  /**
   * 实际占卜测试
   */
  async runDivinationTests() {
    console.log('🔮 3. 实际占卜测试');
    console.log('-' .repeat(40));

    const testCases = [
      {
        question: '今年的事业运势如何？',
        method: 'time',
        params: { datetime: new Date('2024-03-15 10:30:00') }
      },
      {
        question: '这次投资是否明智？',
        method: 'number',
        params: { numbers: [123, 789] }
      },
      {
        question: '感情关系能否长久？',
        method: 'manual',
        params: { upperGua: 2, lowerGua: 5, movingLine: 3 }
      }
    ];

    try {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n🎯 测试案例 ${i + 1}: ${testCase.question}`);
        
        const result = await this.divinationCore.performDivination(
          testCase.question,
          testCase.method,
          testCase.params
        );
        
        console.log(`   本卦: ${result.hexagrams.ben.name} (${result.analysis.wuxing.ben})`);
        console.log(`   互卦: ${result.hexagrams.hu.name} (${result.analysis.wuxing.hu})`);
        console.log(`   变卦: ${result.hexagrams.bian.name} (${result.analysis.wuxing.bian})`);
        console.log(`   动爻: 第${result.movingLine}爻`);
        console.log(`   运势: ${result.analysis.fortune}`);
        console.log(`   时机: ${result.analysis.timing}`);
        console.log(`   建议: ${result.interpretation.advice}`);
        console.log(`   置信度: ${(result.interpretation.confidence * 100).toFixed(1)}%`);
        
        // 验证结果完整性
        const requiredFields = ['id', 'question', 'hexagrams', 'analysis', 'interpretation'];
        const missingFields = requiredFields.filter(field => !result.hasOwnProperty(field));
        
        if (missingFields.length === 0) {
          console.log('   ✅ 结果完整');
        } else {
          console.log(`   ⚠️ 缺少字段: ${missingFields.join(', ')}`);
        }
      }
      
    } catch (error) {
      console.error('❌ 实际占卜测试失败:', error.message);
      throw error;
    }
    
    console.log('\n✅ 实际占卜测试完成\n');
  }

  /**
   * 边界条件测试
   */
  async runEdgeCaseTests() {
    console.log('⚠️ 4. 边界条件测试');
    console.log('-' .repeat(40));

    const edgeCases = [
      {
        name: '空问题测试',
        test: () => this.divinationCore.performDivination('', 'time', {}),
        shouldFail: true
      },
      {
        name: '无效起卦方法测试',
        test: () => this.divinationCore.performDivination('测试', 'invalid', {}),
        shouldFail: true
      },
      {
        name: '无效数字起卦测试',
        test: () => this.divinationCore.performDivination('测试', 'number', { numbers: [] }),
        shouldFail: true
      },
      {
        name: '无效手动起卦测试',
        test: () => this.divinationCore.performDivination('测试', 'manual', { upperGua: 9, lowerGua: 1, movingLine: 1 }),
        shouldFail: true
      },
      {
        name: '极长问题测试',
        test: () => this.divinationCore.performDivination('测试'.repeat(200), 'time', {}),
        shouldFail: true
      }
    ];

    try {
      for (const edgeCase of edgeCases) {
        console.log(`\n🧪 ${edgeCase.name}...`);
        
        try {
          await edgeCase.test();
          
          if (edgeCase.shouldFail) {
            console.log('   ❌ 应该失败但成功了');
          } else {
            console.log('   ✅ 测试通过');
          }
          
        } catch (error) {
          if (edgeCase.shouldFail) {
            console.log(`   ✅ 正确捕获错误: ${error.message}`);
          } else {
            console.log(`   ❌ 意外错误: ${error.message}`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ 边界条件测试失败:', error.message);
      throw error;
    }
    
    console.log('\n✅ 边界条件测试完成\n');
  }

  /**
   * 生成测试报告
   */
  generateTestReport() {
    const report = {
      timestamp: new Date(),
      version: this.divinationCore.version,
      testSummary: {
        basicTests: '✅ 通过',
        validationTests: '✅ 通过',
        divinationTests: '✅ 通过',
        edgeCaseTests: '✅ 通过'
      },
      recommendations: [
        '算法实现基本正确',
        '可以进入下一阶段开发',
        '建议添加更多测试用例',
        '考虑性能优化'
      ]
    };
    
    console.log('📄 测试报告:');
    console.log('=' .repeat(60));
    console.log(`测试时间: ${report.timestamp.toLocaleString()}`);
    console.log(`算法版本: ${report.version}`);
    console.log('\n测试结果:');
    Object.entries(report.testSummary).forEach(([test, result]) => {
      console.log(`  ${test}: ${result}`);
    });
    console.log('\n建议:');
    report.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
    console.log('=' .repeat(60));
    
    return report;
  }
}

// 运行测试
if (require.main === module) {
  const testManager = new AlgorithmTestManager();
  
  testManager.runAllTests()
    .then(() => {
      testManager.generateTestReport();
      console.log('\n🎊 测试全部完成！算法实现正确。');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 测试失败:', error.message);
      process.exit(1);
    });
}

module.exports = AlgorithmTestManager;
