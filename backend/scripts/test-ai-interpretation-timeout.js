/**
 * 测试AI解读超时和重试机制
 * 用于验证504错误修复效果
 */

const DivinationInterpretationService = require('../src/services/divinationInterpretation.service');
const logger = require('../src/utils/logger');

async function testAIInterpretationTimeout() {
  console.log('🧪 开始测试AI解读超时和重试机制...\n');

  // 创建测试占卜数据
  const testDivinationResult = {
    id: 'test_' + Date.now(),
    question: '我的事业发展前景如何？请详细分析未来三年的职业发展路径和机遇。',
    method: 'time',
    timestamp: new Date().toISOString(),
    hexagrams: {
      ben: {
        id: 1,
        name: '乾为天',
        upperGua: { name: '乾', element: '金' },
        lowerGua: { name: '乾', element: '金' },
        keywords: ['天', '健', '刚', '强', '创造']
      },
      bian: {
        id: 44,
        name: '天风姤',
        upperGua: { name: '乾', element: '金' },
        lowerGua: { name: '巽', element: '木' },
        keywords: ['相遇', '邂逅', '相遇', '不期而遇']
      },
      hu: {
        id: 43,
        name: '泽天夬',
        upperGua: { name: '兑', element: '金' },
        lowerGua: { name: '乾', element: '金' },
        keywords: ['决断', '决定', '果断', '突破']
      }
    },
    analysis: {
      fortune: '大吉',
      timing: '春季最佳，秋季次之',
      wuxing: {
        ben: '金',
        hu: '金',
        bian: '木',
        fortune: '大吉',
        favorableElements: ['土', '金']
      }
    },
    movingLine: 4,
    interpretation: {
      summary: '运势极佳，宜主动出击',
      advice: '把握机遇，勇往直前',
      precautions: '注意人际关系'
    }
  };

  const interpretationService = new DivinationInterpretationService();

  // 测试1: 正常解读
  console.log('📝 测试1: 正常AI解读');
  try {
    const startTime = Date.now();
    const result = await interpretationService.generateAIInterpretation(testDivinationResult, {
      temperature: 0.8,
      maxTokens: 2000,
      timeout: 180000,
      maxRetries: 2
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ 测试1完成 - 耗时: ${duration}ms`);
    console.log(`   成功: ${result.success}`);
    console.log(`   解读长度: ${result.data?.content?.length || 0} 字符`);
    console.log(`   性能指标:`, result.data?.metadata?.performanceMetrics || {});
    console.log('');
  } catch (error) {
    console.log(`❌ 测试1失败: ${error.message}`);
    console.log('');
  }

  // 测试2: 模拟超时情况（使用很短的超时时间）
  console.log('⏱️  测试2: 模拟超时情况（短超时）');
  try {
    const startTime = Date.now();
    const result = await interpretationService.generateAIInterpretation(testDivinationResult, {
      temperature: 0.8,
      maxTokens: 2000,
      timeout: 1000, // 1秒超时，强制触发重试
      maxRetries: 2
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ 测试2完成 - 耗时: ${duration}ms`);
    console.log(`   成功: ${result.success}`);
    console.log(`   是否使用降级解读: ${!result.success && result.data?.metadata?.fallbackReason}`);
    console.log('');
  } catch (error) {
    console.log(`❌ 测试2失败: ${error.message}`);
    console.log('');
  }

  // 测试3: 复杂问题测试（可能触发超时）
  console.log('🔍 测试3: 复杂问题测试');
  const complexQuestion = '请详细分析我未来五年的事业发展、感情生活、财务状况、健康状况、家庭关系、社交圈子、学习成长、 spiritual发展、旅行机遇、投资建议、风险管理、人生规划、目标设定、时间管理、压力应对、情绪调节、人际关系处理、技能提升、知识拓展、创新思维培养等各个方面，请给出非常详细和具体的建议，每个方面都要深入分析，并提供可操作的步骤和实施方案。';
  
  try {
    const startTime = Date.now();
    const result = await interpretationService.generateAIInterpretation({
      ...testDivinationResult,
      question: complexQuestion
    }, {
      temperature: 0.9,
      maxTokens: 3000,
      timeout: 180000,
      maxRetries: 2
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ 测试3完成 - 耗时: ${duration}ms`);
    console.log(`   成功: ${result.success}`);
    console.log(`   解读长度: ${result.data?.content?.length || 0} 字符`);
    console.log(`   性能指标:`, result.data?.metadata?.performanceMetrics || {});
    console.log('');
  } catch (error) {
    console.log(`❌ 测试3失败: ${error.message}`);
    console.log('');
  }

  console.log('🎉 所有测试完成！');
  console.log('\n📊 测试总结:');
  console.log('- 如果测试1成功，说明基本功能正常');
  console.log('- 如果测试2能处理超时，说明重试机制有效');
  console.log('- 如果测试3能在合理时间内完成，说明复杂问题处理正常');
  console.log('\n💡 建议观察日志输出，查看详细的性能指标和错误处理情况');
}

// 运行测试
if (require.main === module) {
  testAIInterpretationTimeout().catch(console.error);
}

module.exports = { testAIInterpretationTimeout };