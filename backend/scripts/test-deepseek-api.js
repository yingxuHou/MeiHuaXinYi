/**
 * DeepSeek API连接测试脚本
 * 用于验证DeepSeek API配置是否正确
 */

const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const DeepSeekAPI = require('../src/ai/deepseek/DeepSeekAPI');
const AIServiceManager = require('../src/ai/AIServiceManager');

async function testDeepSeekConnection() {
  console.log('🚀 开始测试DeepSeek API连接...\n');

  try {
    // 检查环境变量
    console.log('📋 检查环境变量配置:');
    console.log(`  DEEPSEEK_API_KEY: ${process.env.DEEPSEEK_API_KEY ? '已配置' : '❌ 未配置'}`);
    console.log(`  DEEPSEEK_API_URL: ${process.env.DEEPSEEK_API_URL || '使用默认值'}`);
    console.log(`  DEEPSEEK_MODEL: ${process.env.DEEPSEEK_MODEL || '使用默认值'}`);
    console.log('');

    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('❌ DeepSeek API密钥未配置，请检查.env文件');
      return;
    }

    // 测试DeepSeek API直接连接
    console.log('🔗 测试DeepSeek API直接连接:');
    const deepseekAPI = new DeepSeekAPI();
    
    const connectionTest = await deepseekAPI.checkConnection();
    console.log(`  连接状态: ${connectionTest ? '✅ 成功' : '❌ 失败'}`);

    if (connectionTest) {
      // 测试基本对话
      console.log('\n💬 测试基本对话功能:');
      const response = await deepseekAPI.generateResponse('你好，请简单介绍一下你自己');
      console.log(`  回答: ${response.content.substring(0, 100)}...`);
      console.log(`  模型: ${response.model}`);
      console.log(`  使用Token: ${response.usage?.total_tokens || '未知'}`);

      // 测试梅花易数解读
      console.log('\n🔮 测试梅花易数解读功能:');
      const divinationData = {
        mainHexagram: '乾卦',
        changingHexagram: '坤卦',
        bodyHexagram: '乾卦',
        useHexagram: '坤卦',
        fiveElements: '金',
        hexagramImage: '天行健，君子以自强不息'
      };
      
      const interpretation = await deepseekAPI.generateDivinationInterpretation(
        divinationData, 
        '我想知道我的事业发展如何？'
      );
      console.log(`  解读: ${interpretation.interpretation.substring(0, 150)}...`);
    }

    // 测试AI服务管理器
    console.log('\n🎛️ 测试AI服务管理器:');
    const aiManager = new AIServiceManager();
    const availableServices = aiManager.getAvailableServices();
    console.log(`  可用服务: ${availableServices.join(', ')}`);

    const serviceStats = aiManager.getServiceStats();
    console.log(`  服务统计:`, serviceStats);

    const allConnections = await aiManager.checkAllConnections();
    console.log(`  连接状态:`, allConnections);

    console.log('\n✅ DeepSeek API测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    console.error('详细错误信息:', error);
  }
}

// 运行测试
if (require.main === module) {
  testDeepSeekConnection()
    .then(() => {
      console.log('\n🎉 测试脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 测试脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { testDeepSeekConnection };
