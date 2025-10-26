/**
 * 实际项目中使用AI解读功能的示例
 * 展示如何在现有代码中集成AI解读
 */

const DivinationService = require('./src/services/divination.service');
const DivinationInterpretationService = require('./src/services/divinationInterpretation.service');

class ProjectAIExample {
  constructor() {
    this.divinationService = new DivinationService();
    this.interpretationService = new DivinationInterpretationService();
  }

  /**
   * 示例1：在现有占卜流程中添加AI解读
   */
  async performDivinationWithAI(userId, question, method, params) {
    console.log('🚀 开始占卜并生成AI解读...');

    try {
      // 1. 执行占卜（使用你现有的占卜服务）
      console.log('📊 执行占卜...');
      const divinationResult = await this.divinationService.performDivination(
        userId,
        question,
        method,
        params,
        { user: { id: userId } }
      );

      if (!divinationResult.success) {
        throw new Error('占卜执行失败');
      }

      console.log('✅ 占卜完成');
      console.log('占卜结果:', {
        id: divinationResult.data.id,
        question: divinationResult.data.question,
        hexagrams: divinationResult.data.hexagrams,
        analysis: divinationResult.data.analysis
      });

      // 2. 生成AI解读
      console.log('🤖 生成AI解读...');
      const aiResult = await this.interpretationService.generateAIInterpretation(
        divinationResult.data
      );

      if (aiResult.success) {
        console.log('✅ AI解读生成成功');
        console.log('AI解读内容:', aiResult.data.content);
        
        // 3. 返回完整结果
        return {
          success: true,
          data: {
            // 原始占卜结果
            divination: divinationResult.data,
            // AI解读结果
            aiInterpretation: aiResult.data
          }
        };
      } else {
        console.log('⚠️ AI解读失败，使用降级解读');
        console.log('降级解读:', aiResult.data.content);
        
        return {
          success: true,
          data: {
            divination: divinationResult.data,
            aiInterpretation: aiResult.data // 降级解读
          }
        };
      }

    } catch (error) {
      console.error('❌ 占卜或AI解读失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 示例2：为现有占卜记录生成AI解读
   */
  async addAIInterpretationToExistingDivination(divinationId, userId) {
    console.log(`🔍 为占卜记录 ${divinationId} 生成AI解读...`);

    try {
      // 1. 获取现有占卜记录
      const divinationResult = await this.divinationService.getDivinationById(divinationId, userId);
      
      if (!divinationResult.success) {
        throw new Error('占卜记录不存在');
      }

      console.log('📋 找到占卜记录:', divinationResult.data.question);

      // 2. 生成AI解读
      const aiResult = await this.interpretationService.generateAIInterpretation(
        divinationResult.data
      );

      if (aiResult.success) {
        console.log('✅ AI解读生成成功');
        return {
          success: true,
          data: {
            divination: divinationResult.data,
            aiInterpretation: aiResult.data
          }
        };
      } else {
        console.log('⚠️ AI解读失败');
        return {
          success: false,
          error: aiResult.error,
          fallbackData: aiResult.data
        };
      }

    } catch (error) {
      console.error('❌ 处理失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 示例3：生成自定义解读
   */
  async generateCustomInterpretation(divinationId, userId, customPrompt) {
    console.log(`🎨 生成自定义解读: ${customPrompt}`);

    try {
      // 获取占卜记录
      const divinationResult = await this.divinationService.getDivinationById(divinationId, userId);
      
      if (!divinationResult.success) {
        throw new Error('占卜记录不存在');
      }

      // 生成自定义解读
      const customResult = await this.interpretationService.generateCustomInterpretation(
        divinationResult.data,
        customPrompt,
        {
          temperature: 0.8,
          maxTokens: 1500
        }
      );

      if (customResult.success) {
        console.log('✅ 自定义解读生成成功');
        return {
          success: true,
          data: customResult.data
        };
      } else {
        console.log('❌ 自定义解读生成失败');
        return {
          success: false,
          error: customResult.error
        };
      }

    } catch (error) {
      console.error('❌ 处理失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 示例4：检查AI服务状态
   */
  async checkAIStatus() {
    console.log('🔍 检查AI服务状态...');

    try {
      const status = await this.interpretationService.checkAIStatus();
      
      if (status.success) {
        console.log('✅ AI服务状态正常');
        console.log('可用服务:', Object.keys(status.data.connections));
        console.log('连接状态:', status.data.connections);
        return status.data;
      } else {
        console.log('❌ AI服务状态异常');
        return null;
      }
    } catch (error) {
      console.error('❌ 检查状态失败:', error.message);
      return null;
    }
  }
}

// 使用示例
async function demonstrateUsage() {
  console.log('🎯 AI解读功能使用演示\n');

  // 设置环境变量
  process.env.DEEPSEEK_API_KEY = 'sk-4b874041faa641f9921ddd5990a41752';
  process.env.DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';
  process.env.DEEPSEEK_MODEL = 'deepseek-chat';

  const example = new ProjectAIExample();

  // 1. 检查AI服务状态
  console.log('1. 检查AI服务状态:');
  const status = await example.checkAIStatus();
  console.log('');

  // 2. 执行占卜并生成AI解读
  console.log('2. 执行占卜并生成AI解读:');
  const result1 = await example.performDivinationWithAI(
    'user123', // 用户ID
    '我想知道我的事业发展如何？', // 问题
    '时间起卦', // 方法
    {} // 参数
  );

  if (result1.success) {
    console.log('\n📊 完整结果:');
    console.log('占卜ID:', result1.data.divination.id);
    console.log('问题:', result1.data.divination.question);
    console.log('主卦:', result1.data.divination.hexagrams.ben.name);
    console.log('变卦:', result1.data.divination.hexagrams.bian.name);
    console.log('AI解读:', result1.data.aiInterpretation.content);
  }
  console.log('');

  // 3. 生成自定义解读
  if (result1.success) {
    console.log('3. 生成自定义解读:');
    const customResult = await example.generateCustomInterpretation(
      result1.data.divination.id,
      'user123',
      '请从职场发展的角度分析这个卦象，重点关注当前职业阶段特征和未来发展趋势。'
    );

    if (customResult.success) {
      console.log('自定义解读:', customResult.data.content);
    }
  }

  console.log('\n🎉 演示完成！');
}

// 如果在命令行直接运行
if (require.main === module) {
  demonstrateUsage()
    .then(() => {
      console.log('\n✅ 演示脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 演示脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = ProjectAIExample;
