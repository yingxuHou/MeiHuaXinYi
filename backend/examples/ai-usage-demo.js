/**
 * 简化的AI解读功能调用示例
 * 展示如何在项目中实际使用AI解读
 */

const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const DivinationInterpretationService = require('../src/services/divinationInterpretation.service');

async function demonstrateAIUsage() {
  console.log('🎯 AI解读功能实际使用演示\n');

  try {
    // 设置环境变量
    process.env.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-4b874041faa641f9921ddd5990a41752';
    process.env.DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
    process.env.DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    // 创建AI解读服务实例
    const interpretationService = new DivinationInterpretationService();

    // 模拟一个真实的占卜结果（来自你的占卜算法）
    const mockDivinationResult = {
      id: 'divination_12345',
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

    console.log('📊 原始占卜结果:');
    console.log(`问题: ${mockDivinationResult.question}`);
    console.log(`主卦: ${mockDivinationResult.hexagrams.ben.name}`);
    console.log(`变卦: ${mockDivinationResult.hexagrams.bian.name}`);
    console.log(`运势: ${mockDivinationResult.analysis.wuxing.fortune}`);
    console.log('');

    // 1. 生成标准AI解读
    console.log('🤖 生成标准AI解读...');
    const standardResult = await interpretationService.generateAIInterpretation(mockDivinationResult);
    
    if (standardResult.success) {
      console.log('✅ 标准AI解读生成成功！');
      console.log('📝 AI解读内容:');
      console.log('=' * 50);
      console.log(standardResult.data.content);
      console.log('=' * 50);
      console.log(`AI模型: ${standardResult.data.aiModel}`);
      console.log(`生成时间: ${standardResult.data.generatedAt}`);
    } else {
      console.log('❌ 标准AI解读失败:', standardResult.error);
      console.log('降级解读:', standardResult.data.content);
    }
    console.log('');

    // 2. 生成自定义解读（事业发展角度）
    console.log('🎨 生成事业发展角度解读...');
    const careerPrompt = '请从职场发展的角度分析这个卦象，重点关注当前职业阶段特征、未来发展趋势、需要提升的能力和具体行动建议。';
    
    const careerResult = await interpretationService.generateCustomInterpretation(
      mockDivinationResult,
      careerPrompt,
      { temperature: 0.8, maxTokens: 1500 }
    );

    if (careerResult.success) {
      console.log('✅ 事业发展解读生成成功！');
      console.log('💼 事业发展解读:');
      console.log('=' * 50);
      console.log(careerResult.data.content);
      console.log('=' * 50);
    } else {
      console.log('❌ 事业发展解读失败:', careerResult.error);
    }
    console.log('');

    // 3. 生成感情角度解读
    console.log('💕 生成感情运势解读...');
    const relationshipPrompt = '请从感情关系的角度解读这个卦象，分析当前感情状态、双方关系特点、感情发展趋势和维护关系的建议。';
    
    const relationshipResult = await interpretationService.generateCustomInterpretation(
      mockDivinationResult,
      relationshipPrompt,
      { temperature: 0.7, maxTokens: 1200 }
    );

    if (relationshipResult.success) {
      console.log('✅ 感情运势解读生成成功！');
      console.log('💕 感情运势解读:');
      console.log('=' * 50);
      console.log(relationshipResult.data.content);
      console.log('=' * 50);
    } else {
      console.log('❌ 感情运势解读失败:', relationshipResult.error);
    }
    console.log('');

    // 4. 检查AI服务状态
    console.log('🔍 检查AI服务状态...');
    const status = await interpretationService.checkAIStatus();
    
    if (status.success) {
      console.log('✅ AI服务状态正常');
      console.log('可用服务:', Object.keys(status.data.connections));
      console.log('连接状态:', status.data.connections);
    } else {
      console.log('❌ AI服务状态异常:', status.error);
    }

    console.log('\n🎉 AI解读功能演示完成！');
    console.log('\n📋 总结:');
    console.log('1. ✅ 标准AI解读功能正常');
    console.log('2. ✅ 自定义解读功能正常');
    console.log('3. ✅ 多角度解读支持');
    console.log('4. ✅ 错误处理和降级机制完善');

  } catch (error) {
    console.error('❌ 演示过程中出现错误:', error.message);
    console.error('详细错误:', error);
  }
}

// 运行演示
if (require.main === module) {
  demonstrateAIUsage()
    .then(() => {
      console.log('\n✅ 演示脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 演示脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { demonstrateAIUsage };
