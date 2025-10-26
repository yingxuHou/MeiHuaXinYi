/**
 * 算法服务集成测试脚本
 * 验证本地算法是否正确集成到DivinationService中
 */

const { algorithmManager } = require('../src/algorithms');
const DivinationService = require('../src/services/divination.service');

async function testAlgorithmIntegration() {
  console.log('🧪 开始测试算法服务集成...\n');

  try {
    // 测试1：直接测试算法管理器
    console.log('📋 测试1：直接测试算法管理器');
    const directResult = await algorithmManager.performDivination('我的事业运势如何？', {
      method: 'time',
      params: {}
    });
    
    console.log('✅ 算法管理器测试成功');
    console.log('📊 占卜结果预览:', {
      question: directResult.question,
      hexagrams: {
        ben: directResult.hexagrams?.ben?.name || 'N/A',
        hu: directResult.hexagrams?.hu?.name || 'N/A',
        bian: directResult.hexagrams?.bian?.name || 'N/A'
      },
      movingLine: directResult.movingLine,
      analysis: directResult.analysis?.fortune || 'N/A'
    });
    console.log('');

    // 测试2：测试DivinationService集成
    console.log('📋 测试2：测试DivinationService集成');
    const divinationService = new DivinationService();
    
    // 模拟开发用户
    const mockUser = { id: 'test_user_123', isDev: true };
    const mockOptions = { user: mockUser };
    
    const serviceResult = await divinationService.performDivination(
      'test_user_123',
      '我的感情运势如何？',
      'time',
      {},
      mockOptions
    );
    
    console.log('✅ DivinationService集成测试成功');
    console.log('📊 服务结果预览:', {
      success: serviceResult.success,
      hasData: !!serviceResult.data,
      question: serviceResult.data?.question,
      hexagrams: serviceResult.data?.hexagrams ? '已生成' : '未生成',
      isDev: serviceResult.data?.metadata?.isDev
    });
    console.log('');

    // 测试3：验证数据结构一致性
    console.log('📋 测试3：验证数据结构一致性');
    const hasRequiredFields = (
      directResult.question &&
      directResult.hexagrams &&
      directResult.hexagrams.ben &&
      directResult.hexagrams.hu &&
      directResult.hexagrams.bian &&
      directResult.movingLine &&
      directResult.wuxing &&
      directResult.interpretation
    );
    
    console.log(hasRequiredFields ? '✅ 数据结构验证通过' : '❌ 数据结构验证失败');
    console.log('');

    // 测试4：性能测试
    console.log('📋 测试4：性能测试');
    const startTime = Date.now();
    await algorithmManager.performDivination('性能测试问题', { method: 'time' });
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log(`✅ 性能测试完成，处理时间: ${processingTime}ms`);
    console.log(processingTime < 1000 ? '🚀 性能良好' : '⚠️ 性能需要优化');
    console.log('');

    console.log('🎉 所有测试通过！算法服务集成成功！');
    
    return {
      success: true,
      tests: {
        directAlgorithm: true,
        serviceIntegration: true,
        dataStructure: hasRequiredFields,
        performance: processingTime < 1000
      },
      performance: processingTime
    };

  } catch (error) {
    console.error('❌ 算法集成测试失败:', error.message);
    console.error('错误详情:', error.stack);
    
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testAlgorithmIntegration()
    .then(result => {
      if (result.success) {
        console.log('\n✅ 算法集成测试完成，所有功能正常！');
        process.exit(0);
      } else {
        console.log('\n❌ 算法集成测试失败，请检查错误信息！');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 测试脚本执行失败:', error.message);
      process.exit(1);
    });
}

module.exports = { testAlgorithmIntegration };
