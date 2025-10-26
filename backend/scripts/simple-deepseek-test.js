/**
 * DeepSeek API简化测试脚本
 * 验证基本功能是否正常
 */

const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const DeepSeekAPI = require('../src/ai/deepseek/DeepSeekAPI');

async function simpleTest() {
  console.log('🚀 DeepSeek API简化测试...\n');

  try {
    // 设置环境变量
    process.env.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-4b874041faa641f9921ddd5990a41752';
    process.env.DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
    process.env.DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    console.log('📋 环境变量检查:');
    console.log(`  API Key: ${process.env.DEEPSEEK_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`  API URL: ${process.env.DEEPSEEK_API_URL}`);
    console.log(`  Model: ${process.env.DEEPSEEK_MODEL}\n`);

    // 创建API实例
    const deepseekAPI = new DeepSeekAPI();

    // 测试连接
    console.log('🔗 测试API连接:');
    const isConnected = await deepseekAPI.checkConnection();
    console.log(`  状态: ${isConnected ? '✅ 连接成功' : '❌ 连接失败'}\n`);

    if (isConnected) {
      // 测试简单对话
      console.log('💬 测试简单对话:');
      const response = await deepseekAPI.generateResponse('请用一句话介绍梅花易数');
      console.log(`  回答: ${response.content}`);
      console.log(`  模型: ${response.model}`);
      console.log(`  Token使用: ${response.usage?.total_tokens || '未知'}\n`);

      // 测试梅花易数相关问答
      console.log('🔮 测试梅花易数问答:');
      const divinationResponse = await deepseekAPI.generateResponse('什么是乾卦？请简单解释');
      console.log(`  回答: ${divinationResponse.content.substring(0, 200)}...\n`);

      console.log('✅ 所有测试通过！DeepSeek API配置成功！');
    } else {
      console.log('❌ API连接失败，请检查配置');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  simpleTest()
    .then(() => {
      console.log('\n🎉 测试完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { simpleTest };
