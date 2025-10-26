/**
 * 简化的占卜AI解读测试
 */

const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const DivinationInterpretationService = require('../src/services/divinationInterpretation.service');

async function simpleInterpretationTest() {
  console.log('🔮 简化占卜AI解读测试...\n');

  try {
    // 设置环境变量
    process.env.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-4b874041faa641f9921ddd5990a41752';
    process.env.DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
    process.env.DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    // 创建解读服务实例
    const interpretationService = new DivinationInterpretationService();

    // 简化的占卜结果
    const simpleDivinationResult = {
      question: '我的事业发展如何？',
      method: '时间起卦',
      timestamp: new Date(),
      hexagrams: {
        ben: { name: '乾为天' },
        bian: { name: '坤为地' },
        hu: { name: '乾为天' }
      },
      analysis: {
        wuxing: {
          ben: '金',
          hu: '金',
          bian: '土',
          fortune: '中吉'
        }
      }
    };

    console.log('🤖 测试AI解读:');
    const result = await interpretationService.generateAIInterpretation(simpleDivinationResult);
    
    if (result.success) {
      console.log('✅ AI解读生成成功！');
      console.log(`问题: ${result.data.question}`);
      console.log(`AI模型: ${result.data.aiModel}`);
      console.log(`解读内容:\n${result.data.content}`);
    } else {
      console.log('❌ AI解读生成失败:', result.error);
      console.log('降级解读内容:\n', result.data.content);
    }

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  simpleInterpretationTest()
    .then(() => {
      console.log('\n🎉 测试脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 测试脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { simpleInterpretationTest };
