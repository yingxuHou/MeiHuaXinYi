
/**
 * 占卜AI解读服务测试脚本
 * 演示如何使用DeepSeek AI对占卜结果进行解读
 */

const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const DivinationInterpretationService = require('../src/services/divinationInterpretation.service');

async function testDivinationInterpretation() {
  console.log('🔮 测试占卜AI解读服务...\n');

  try {
    // 设置环境变量
    process.env.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-4b874041faa641f9921ddd5990a41752';
    process.env.DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
    process.env.DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    // 创建解读服务实例
    const interpretationService = new DivinationInterpretationService();

    // 检查AI服务状态
    console.log('🔍 检查AI服务状态:');
    const status = await interpretationService.checkAIStatus();
    console.log(`  状态: ${status.success ? '✅ 正常' : '❌ 异常'}`);
    if (status.success) {
      console.log(`  可用服务: ${Object.keys(status.data.connections).join(', ')}`);
      console.log(`  连接状态: ${JSON.stringify(status.data.connections)}`);
    }
    console.log('');

    // 模拟占卜结果数据
    const mockDivinationResult = {
      question: '我想知道我的事业发展如何？',
      method: '时间起卦',
      timestamp: new Date(),
      hexagrams: {
        ben: {
          id: 1,
          name: '乾为天',
          upperGua: { name: '乾', symbol: '☰', element: '金' },
          lowerGua: { name: '乾', symbol: '☰', element: '金' },
          lines: [1, 1, 1, 1, 1, 1]
        },
        hu: {
          id: 1,
          name: '乾为天',
          upperGua: { name: '乾', symbol: '☰', element: '金' },
          lowerGua: { name: '乾', symbol: '☰', element: '金' },
          lines: [1, 1, 1, 1, 1, 1]
        },
        bian: {
          id: 2,
          name: '坤为地',
          upperGua: { name: '坤', symbol: '☷', element: '土' },
          lowerGua: { name: '坤', symbol: '☷', element: '土' },
          lines: [0, 0, 0, 0, 0, 0]
        }
      },
      analysis: {
        wuxing: {
          ben: '金',
          hu: '金',
          bian: '土',
          relationships: {
            benToHu: { type: 'same', meaning: '同' },
            benToBian: { type: 'generation', meaning: '生' },
            huToBian: { type: 'generation', meaning: '生' }
          },
          fortune: '中吉',
          timing: '当前时机适中'
        },
        fortune: '中吉',
        timing: '当前时机适中'
      },
      movingLine: 6
    };

    // 测试标准AI解读
    console.log('🤖 测试标准AI解读:');
    const standardResult = await interpretationService.generateAIInterpretation(mockDivinationResult);
    
    if (standardResult.success) {
      console.log('✅ 标准解读生成成功');
      console.log(`  解读长度: ${standardResult.data.content.length} 字符`);
      console.log(`  AI模型: ${standardResult.data.aiModel}`);
      console.log(`  生成时间: ${standardResult.data.generatedAt}`);
      console.log(`  解读内容预览: ${standardResult.data.content.substring(0, 200)}...`);
    } else {
      console.log('❌ 标准解读生成失败:', standardResult.error);
    }
    console.log('');

    // 测试自定义解读
    console.log('🎨 测试自定义解读:');
    const customPrompt = '请从职场发展的角度，结合梅花易数的体用关系，为我分析这个卦象对事业发展的启示。';
    
    const customResult = await interpretationService.generateCustomInterpretation(
      mockDivinationResult, 
      customPrompt,
      { temperature: 0.8, maxTokens: 1500 }
    );

    if (customResult.success) {
      console.log('✅ 自定义解读生成成功');
      console.log(`  解读长度: ${customResult.data.content.length} 字符`);
      console.log(`  自定义提示词: ${customResult.data.customPrompt}`);
      console.log(`  解读内容预览: ${customResult.data.content.substring(0, 200)}...`);
    } else {
      console.log('❌ 自定义解读生成失败:', customResult.error);
    }
    console.log('');

    // 测试不同问题的解读
    console.log('📝 测试不同问题的解读:');
    const differentQuestion = {
      ...mockDivinationResult,
      question: '我的感情运势如何？'
    };

    const differentResult = await interpretationService.generateAIInterpretation(differentQuestion);
    
    if (differentResult.success) {
      console.log('✅ 不同问题解读生成成功');
      console.log(`  问题: ${differentResult.data.question}`);
      console.log(`  解读内容预览: ${differentResult.data.content.substring(0, 200)}...`);
    } else {
      console.log('❌ 不同问题解读生成失败:', differentResult.error);
    }

    console.log('\n🎉 占卜AI解读服务测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    console.error('详细错误信息:', error);
  }
}

// 运行测试
if (require.main === module) {
  testDivinationInterpretation()
    .then(() => {
      console.log('\n🎉 测试脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 测试脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { testDivinationInterpretation };
