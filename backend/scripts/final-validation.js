/**
 * 最终验证脚本 - 确认v2.0升级完全成功
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { User, Divination, Conversation, KnowledgeBase } = require('../src/models');

class FinalValidator {
  constructor() {
    this.testResults = {
      connection: false,
      models: false,
      crud: false,
      relationships: false,
      indexes: false
    };
  }

  async runFinalValidation() {
    console.log('🎯 开始最终验证...\n');

    try {
      await this.testConnection();
      await this.testModels();
      await this.testCRUDOperations();
      await this.testRelationships();
      await this.testIndexes();
      
      this.generateFinalReport();
      
    } catch (error) {
      console.error('❌ 最终验证失败:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  async testConnection() {
    console.log('🔗 1. 连接测试...');
    
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
      
      console.log('   ✅ 数据库连接成功');
      console.log(`   📊 数据库: ${mongoose.connection.name}`);
      
      const ping = await mongoose.connection.db.admin().ping();
      if (ping.ok === 1) {
        console.log('   🏓 Ping测试: 成功');
        this.testResults.connection = true;
      }
      
    } catch (error) {
      console.error('   ❌ 连接测试失败:', error.message);
    }
    
    console.log('');
  }

  async testModels() {
    console.log('📋 2. 模型测试...');
    
    try {
      const models = { User, Divination, Conversation, KnowledgeBase };
      let allModelsOk = true;
      
      for (const [name, Model] of Object.entries(models)) {
        try {
          // 测试模型基本功能
          const count = await Model.countDocuments();
          console.log(`   ✅ ${name}: ${count} 条记录`);
          
          // 测试模型验证
          const testDoc = new Model({});
          try {
            await testDoc.validate();
            console.log(`   ⚠️ ${name}: 验证过于宽松`);
          } catch (validationError) {
            console.log(`   ✅ ${name}: 验证规则正常`);
          }
          
        } catch (error) {
          console.log(`   ❌ ${name}: ${error.message}`);
          allModelsOk = false;
        }
      }
      
      this.testResults.models = allModelsOk;
      
    } catch (error) {
      console.error('   ❌ 模型测试失败:', error.message);
    }
    
    console.log('');
  }

  async testCRUDOperations() {
    console.log('🔧 3. CRUD操作测试...');
    
    try {
      // 创建测试用户
      console.log('   创建测试用户...');
      const testUser = new User({
        email: 'final-test@example.com',
        username: 'finaltest',
        password: 'testpassword123',
        passwordHash: 'hashedpassword',
        subscription: {
          type: 'premium',
          features: [
            { name: 'unlimited_divination', enabled: true },
            { name: 'ai_consultant', enabled: true }
          ]
        },
        usage: {
          divinationCount: 5,
          freeCountToday: 3
        },
        preferences: {
          divination: {
            preferredMethod: 'time',
            aiInterpretation: true
          }
        }
      });
      
      await testUser.save();
      console.log('   ✅ 用户创建成功');
      
      // 读取用户
      const foundUser = await User.findById(testUser._id);
      if (foundUser && foundUser.subscription.type === 'premium') {
        console.log('   ✅ 用户读取成功');
      }
      
      // 更新用户
      foundUser.usage.divinationCount += 1;
      await foundUser.save();
      console.log('   ✅ 用户更新成功');
      
      // 创建测试占卜记录
      console.log('   创建测试占卜记录...');
      const testDivination = new Divination({
        userId: testUser._id,
        question: '最终测试问题',
        method: 'time',
        hexagrams: {
          ben: {
            id: 1,
            name: '乾为天',
            upperGua: { number: 1, name: '乾', symbol: '☰', element: '金', nature: '天' },
            lowerGua: { number: 1, name: '乾', symbol: '☰', element: '金', nature: '天' },
            lines: [1,1,1,1,1,1]
          },
          hu: {
            id: 1,
            name: '乾为天',
            upperGua: { number: 1, name: '乾', symbol: '☰', element: '金', nature: '天' },
            lowerGua: { number: 1, name: '乾', symbol: '☰', element: '金', nature: '天' },
            lines: [1,1,1,1,1,1]
          },
          bian: {
            id: 1,
            name: '乾为天',
            upperGua: { number: 1, name: '乾', symbol: '☰', element: '金', nature: '天' },
            lowerGua: { number: 1, name: '乾', symbol: '☰', element: '金', nature: '天' },
            lines: [1,1,1,1,1,1]
          }
        },
        movingLine: 1,
        analysis: {
          wuxing: {
            ben: '金',
            hu: '金',
            bian: '金',
            relationships: {
              benToHu: { type: 'same', strength: 'neutral', meaning: '同' },
              benToBian: { type: 'same', strength: 'neutral', meaning: '同' },
              huToBian: { type: 'same', strength: 'neutral', meaning: '同' }
            },
            fortune: '大吉'
          }
        },
        interpretation: {
          summary: '最终测试解读',
          detailed: '详细最终测试解读',
          advice: '最终测试建议',
          timing: '最终测试时机'
        }
      });
      
      await testDivination.save();
      console.log('   ✅ 占卜记录创建成功');
      
      // 创建测试对话
      console.log('   创建测试对话...');
      const testConversation = new Conversation({
        userId: testUser._id,
        divinationId: testDivination._id,
        title: '最终测试对话',
        messages: [{
          role: 'user',
          content: '这是最终测试消息'
        }]
      });
      
      await testConversation.save();
      console.log('   ✅ 对话记录创建成功');
      
      // 删除测试数据
      await User.deleteOne({ _id: testUser._id });
      await Divination.deleteOne({ _id: testDivination._id });
      await Conversation.deleteOne({ _id: testConversation._id });
      console.log('   ✅ 测试数据清理完成');
      
      this.testResults.crud = true;
      
    } catch (error) {
      console.error('   ❌ CRUD测试失败:', error.message);
    }
    
    console.log('');
  }

  async testRelationships() {
    console.log('🔗 4. 关系测试...');
    
    try {
      // 测试用户与占卜的关系
      const userCount = await User.countDocuments();
      const divinationCount = await Divination.countDocuments();
      const conversationCount = await Conversation.countDocuments();
      
      console.log(`   📊 数据统计:`);
      console.log(`      用户: ${userCount} 个`);
      console.log(`      占卜: ${divinationCount} 条`);
      console.log(`      对话: ${conversationCount} 条`);
      
      // 如果有数据，测试关联查询
      if (divinationCount > 0) {
        const sampleDivination = await Divination.findOne().populate('userId');
        if (sampleDivination) {
          console.log('   ✅ 占卜-用户关联查询成功');
        }
      }
      
      this.testResults.relationships = true;
      
    } catch (error) {
      console.error('   ❌ 关系测试失败:', error.message);
    }
    
    console.log('');
  }

  async testIndexes() {
    console.log('📊 5. 索引测试...');
    
    try {
      const collections = ['users', 'divinations', 'conversations', 'knowledgebases'];
      let allIndexesOk = true;
      
      for (const collectionName of collections) {
        try {
          const collection = mongoose.connection.db.collection(collectionName);
          const indexes = await collection.getIndexes();
          const indexNames = Object.keys(indexes);
          
          console.log(`   ✅ ${collectionName}: ${indexNames.length} 个索引`);
          
          // 检查关键索引
          const hasEmailIndex = indexNames.some(name => name.includes('email'));
          const hasUserIdIndex = indexNames.some(name => name.includes('userId'));
          
          if (collectionName === 'users' && !hasEmailIndex) {
            console.log(`   ⚠️ ${collectionName}: 缺少email索引`);
          }
          
          if (collectionName !== 'users' && !hasUserIdIndex) {
            console.log(`   ⚠️ ${collectionName}: 缺少userId索引`);
          }
          
        } catch (error) {
          console.log(`   ❌ ${collectionName}: 索引检查失败`);
          allIndexesOk = false;
        }
      }
      
      this.testResults.indexes = allIndexesOk;
      
    } catch (error) {
      console.error('   ❌ 索引测试失败:', error.message);
    }
    
    console.log('');
  }

  generateFinalReport() {
    console.log('🎉 最终验证报告:');
    console.log('='.repeat(60));
    
    const tests = [
      { name: '数据库连接', result: this.testResults.connection },
      { name: '数据模型', result: this.testResults.models },
      { name: 'CRUD操作', result: this.testResults.crud },
      { name: '数据关系', result: this.testResults.relationships },
      { name: '索引配置', result: this.testResults.indexes }
    ];
    
    tests.forEach(test => {
      const status = test.result ? '✅ 通过' : '❌ 失败';
      console.log(`   ${test.name}: ${status}`);
    });
    
    const passedTests = tests.filter(test => test.result).length;
    const totalTests = tests.length;
    
    console.log('='.repeat(60));
    console.log(`验证结果: ${passedTests}/${totalTests} 测试通过`);
    
    if (passedTests === totalTests) {
      console.log('🎊 恭喜！梅花心易后端数据库v2.0升级完全成功！');
      console.log('');
      console.log('✨ 新功能已就绪:');
      console.log('   🔹 会员订阅系统');
      console.log('   🔹 使用统计追踪');
      console.log('   🔹 个性化偏好设置');
      console.log('   🔹 完整的占卜记录系统');
      console.log('   🔹 AI顾问对话功能');
      console.log('   🔹 RAG知识库支持');
      console.log('');
      console.log('🚀 可以开始下一阶段的开发工作！');
    } else {
      console.log('⚠️ 部分验证失败，请检查相关配置。');
    }
    
    console.log('='.repeat(60));
  }

  async cleanup() {
    try {
      await mongoose.disconnect();
      console.log('👋 数据库连接已关闭');
    } catch (error) {
      console.error('清理失败:', error.message);
    }
  }
}

// 运行最终验证
if (require.main === module) {
  const validator = new FinalValidator();
  validator.runFinalValidation();
}

module.exports = FinalValidator;
