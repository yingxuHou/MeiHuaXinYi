/**
 * 数据库模型和索引测试脚本
 * 验证所有数据模型是否正确创建和索引是否正常工作
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User, Divination, Conversation, KnowledgeBase } = require('../src/models');

class DatabaseModelsTest {
  constructor() {
    this.connectionString = process.env.MONGODB_URI;
    this.testResults = {
      connection: false,
      userModel: false,
      divinationModel: false,
      conversationModel: false,
      knowledgeBaseModel: false,
      indexes: false
    };
  }

  /**
   * 连接数据库
   */
  async connect() {
    try {
      console.log('🔄 连接MongoDB Atlas...');
      await mongoose.connect(this.connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      });
      
      this.testResults.connection = true;
      console.log('✅ 数据库连接成功');
      return true;
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
  }

  /**
   * 测试用户模型
   */
  async testUserModel() {
    try {
      console.log('🔄 测试用户模型...');
      
      // 创建测试用户
      const testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'test123456',
        profile: {
          nickname: '测试用户',
          gender: 'female',
          birthday: new Date('1990-01-01')
        }
      });

      // 保存用户
      const savedUser = await testUser.save();
      console.log('✅ 用户创建成功');

      // 验证用户数据
      const foundUser = await User.findById(savedUser._id);
      if (foundUser && foundUser.email === 'test@example.com') {
        console.log('✅ 用户查询成功');
      } else {
        throw new Error('用户查询失败');
      }

      // 清理测试数据
      await User.findByIdAndDelete(savedUser._id);
      console.log('✅ 用户清理成功');

      this.testResults.userModel = true;
      return true;
    } catch (error) {
      console.error('❌ 用户模型测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试占卜模型
   */
  async testDivinationModel() {
    try {
      console.log('🔄 测试占卜模型...');
      
      // 创建测试用户
      const testUser = new User({
        username: 'divtest' + Date.now().toString().slice(-6),
        email: 'divination-test-' + Date.now() + '@example.com',
        password: 'test123456'
      });
      const savedUser = await testUser.save();

      // 创建测试占卜记录
      const testDivination = new Divination({
        userId: savedUser._id,
        question: '我的事业运势如何？',
        method: 'time',
        params: {
          datetime: new Date()
        },
        hexagrams: {
          ben: {
            id: 1,
            name: '乾为天',
            upperGua: {
              number: 1,
              name: '乾',
              symbol: '☰',
              element: '金',
              nature: '天'
            },
            lowerGua: {
              number: 1,
              name: '乾',
              symbol: '☰',
              element: '金',
              nature: '天'
            },
            lines: [1, 1, 1, 1, 1, 1]
          },
          hu: {
            id: 2,
            name: '坤为地',
            upperGua: {
              number: 8,
              name: '坤',
              symbol: '☷',
              element: '土',
              nature: '地'
            },
            lowerGua: {
              number: 8,
              name: '坤',
              symbol: '☷',
              element: '土',
              nature: '地'
            },
            lines: [0, 0, 0, 0, 0, 0]
          },
          bian: {
            id: 3,
            name: '水雷屯',
            upperGua: {
              number: 6,
              name: '坎',
              symbol: '☵',
              element: '水',
              nature: '水'
            },
            lowerGua: {
              number: 4,
              name: '震',
              symbol: '☳',
              element: '木',
              nature: '雷'
            },
            lines: [1, 0, 0, 0, 1, 0]
          }
        },
        movingLine: 1,
        analysis: {
          wuxing: {
            ben: '金',
            hu: '土',
            bian: '水',
            relationships: {
              benToHu: {
                type: 'generation',
                strength: 'strong',
                meaning: '生'
              },
              benToBian: {
                type: 'generation',
                strength: 'strong',
                meaning: '生'
              },
              huToBian: {
                type: 'destruction',
                strength: 'strong',
                meaning: '克'
              }
            },
            fortune: '中吉',
            timing: '春季有利'
          }
        },
        interpretation: {
          summary: '事业运势整体向好',
          detailed: '根据卦象分析，您的事业运势整体向好，但需要耐心等待时机',
          advice: '建议在春季采取行动',
          timing: '最佳行动时间为农历二、三月份'
        }
      });

      // 保存占卜记录
      const savedDivination = await testDivination.save();
      console.log('✅ 占卜记录创建成功');

      // 验证占卜记录
      const foundDivination = await Divination.findById(savedDivination._id);
      if (foundDivination && foundDivination.question === '我的事业运势如何？') {
        console.log('✅ 占卜记录查询成功');
      } else {
        throw new Error('占卜记录查询失败');
      }

      // 清理测试数据
      await Divination.findByIdAndDelete(savedDivination._id);
      await User.findByIdAndDelete(savedUser._id);
      console.log('✅ 占卜记录清理成功');

      this.testResults.divinationModel = true;
      return true;
    } catch (error) {
      console.error('❌ 占卜模型测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试对话模型
   */
  async testConversationModel() {
    try {
      console.log('🔄 测试对话模型...');
      
      // 创建测试用户
      const testUser = new User({
        username: 'convtest' + Date.now().toString().slice(-6),
        email: 'conversation-test-' + Date.now() + '@example.com',
        password: 'test123456'
      });
      const savedUser = await testUser.save();

      // 创建测试占卜记录
      const testDivination = new Divination({
        userId: savedUser._id,
        question: '这是一个测试问题',
        method: 'time',
        params: {
          datetime: new Date()
        },
        hexagrams: {
          ben: {
            id: 1,
            name: '乾为天',
            upperGua: {
              number: 1,
              name: '乾',
              symbol: '☰',
              element: '金',
              nature: '天'
            },
            lowerGua: {
              number: 1,
              name: '乾',
              symbol: '☰',
              element: '金',
              nature: '天'
            },
            lines: [1, 1, 1, 1, 1, 1]
          },
          hu: {
            id: 2,
            name: '坤为地',
            upperGua: {
              number: 8,
              name: '坤',
              symbol: '☷',
              element: '土',
              nature: '地'
            },
            lowerGua: {
              number: 8,
              name: '坤',
              symbol: '☷',
              element: '土',
              nature: '地'
            },
            lines: [0, 0, 0, 0, 0, 0]
          },
          bian: {
            id: 3,
            name: '水雷屯',
            upperGua: {
              number: 6,
              name: '坎',
              symbol: '☵',
              element: '水',
              nature: '水'
            },
            lowerGua: {
              number: 4,
              name: '震',
              symbol: '☳',
              element: '木',
              nature: '雷'
            },
            lines: [1, 0, 0, 0, 1, 0]
          }
        },
        movingLine: 1,
        analysis: {
          wuxing: {
            ben: '金',
            hu: '土',
            bian: '水',
            relationships: {
              benToHu: {
                type: 'generation',
                strength: 'strong',
                meaning: '生'
              },
              benToBian: {
                type: 'generation',
                strength: 'strong',
                meaning: '生'
              },
              huToBian: {
                type: 'destruction',
                strength: 'strong',
                meaning: '克'
              }
            },
            fortune: '中吉',
            timing: '春季有利'
          }
        },
        interpretation: {
          summary: '测试占卜结果',
          detailed: '这是一个测试占卜的详细解读',
          advice: '测试建议',
          timing: '测试时机'
        }
      });
      const savedDivination = await testDivination.save();

      // 创建测试对话记录
      const testConversation = new Conversation({
        userId: savedUser._id,
        divinationId: savedDivination._id,
        title: '测试对话',
        messages: [
          {
            role: 'user',
            content: '这是一个测试问题',
            timestamp: new Date()
          },
          {
            role: 'assistant',
            content: '这是一个测试回答',
            timestamp: new Date()
          }
        ]
      });

      // 保存对话记录
      const savedConversation = await testConversation.save();
      console.log('✅ 对话记录创建成功');

      // 验证对话记录
      const foundConversation = await Conversation.findById(savedConversation._id);
      if (foundConversation && foundConversation.title === '测试对话') {
        console.log('✅ 对话记录查询成功');
      } else {
        throw new Error('对话记录查询失败');
      }

      // 清理测试数据
      await Conversation.findByIdAndDelete(savedConversation._id);
      await Divination.findByIdAndDelete(savedDivination._id);
      await User.findByIdAndDelete(savedUser._id);
      console.log('✅ 对话记录清理成功');

      this.testResults.conversationModel = true;
      return true;
    } catch (error) {
      console.error('❌ 对话模型测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试知识库模型
   */
  async testKnowledgeBaseModel() {
    try {
      console.log('🔄 测试知识库模型...');
      
      // 创建测试知识库记录
      const testKnowledge = new KnowledgeBase({
        title: '测试知识条目',
        content: '这是一个测试知识内容',
        category: 'theory',
        subcategory: 'basic_theory',
        source: {
          type: 'book',
          title: '测试书籍',
          author: '测试作者'
        },
        metadata: {
          keywords: ['测试', '知识'],
          difficulty: 'beginner',
          reliability: 'high'
        },
        embedding: {
          vector: new Array(1536).fill(0.1), // 创建1536维的测试向量
          model: 'text-embedding-ada-002',
          version: 'v2'
        }
      });

      // 保存知识库记录
      const savedKnowledge = await testKnowledge.save();
      console.log('✅ 知识库记录创建成功');

      // 验证知识库记录
      const foundKnowledge = await KnowledgeBase.findById(savedKnowledge._id);
      if (foundKnowledge && foundKnowledge.title === '测试知识条目') {
        console.log('✅ 知识库记录查询成功');
      } else {
        throw new Error('知识库记录查询失败');
      }

      // 清理测试数据
      await KnowledgeBase.findByIdAndDelete(savedKnowledge._id);
      console.log('✅ 知识库记录清理成功');

      this.testResults.knowledgeBaseModel = true;
      return true;
    } catch (error) {
      console.error('❌ 知识库模型测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试索引
   */
  async testIndexes() {
    try {
      console.log('🔄 测试数据库索引...');
      
      // 检查用户集合索引
      const userIndexes = await User.collection.indexes();
      console.log(`✅ 用户集合索引数量: ${userIndexes.length}`);
      
      // 检查占卜集合索引
      const divinationIndexes = await Divination.collection.indexes();
      console.log(`✅ 占卜集合索引数量: ${divinationIndexes.length}`);
      
      // 检查对话集合索引
      const conversationIndexes = await Conversation.collection.indexes();
      console.log(`✅ 对话集合索引数量: ${conversationIndexes.length}`);
      
      // 检查知识库集合索引
      const knowledgeIndexes = await KnowledgeBase.collection.indexes();
      console.log(`✅ 知识库集合索引数量: ${knowledgeIndexes.length}`);

      this.testResults.indexes = true;
      return true;
    } catch (error) {
      console.error('❌ 索引测试失败:', error.message);
      return false;
    }
  }

  /**
   * 运行完整测试
   */
  async runFullTest() {
    console.log('🚀 开始数据库模型测试\n');
    
    try {
      // 连接数据库
      const connected = await this.connect();
      if (!connected) {
        throw new Error('数据库连接失败');
      }

      // 测试各个模型
      await this.testUserModel();
      await this.testDivinationModel();
      await this.testConversationModel();
      await this.testKnowledgeBaseModel();
      await this.testIndexes();

      // 输出测试结果
      this.printTestResults();

    } catch (error) {
      console.error('\n❌ 测试过程中发生错误:', error.message);
    } finally {
      // 关闭连接
      await mongoose.connection.close();
      console.log('\n🔌 数据库连接已关闭');
    }
  }

  /**
   * 打印测试结果
   */
  printTestResults() {
    console.log('\n📋 数据库模型测试结果:');
    console.log('================================');
    console.log(`数据库连接: ${this.testResults.connection ? '✅ 通过' : '❌ 失败'}`);
    console.log(`用户模型: ${this.testResults.userModel ? '✅ 通过' : '❌ 失败'}`);
    console.log(`占卜模型: ${this.testResults.divinationModel ? '✅ 通过' : '❌ 失败'}`);
    console.log(`对话模型: ${this.testResults.conversationModel ? '✅ 通过' : '❌ 失败'}`);
    console.log(`知识库模型: ${this.testResults.knowledgeBaseModel ? '✅ 通过' : '❌ 失败'}`);
    console.log(`索引测试: ${this.testResults.indexes ? '✅ 通过' : '❌ 失败'}`);
    
    const passedTests = Object.values(this.testResults).filter(Boolean).length;
    const totalTests = Object.keys(this.testResults).length;
    
    console.log(`\n总体结果: ${passedTests}/${totalTests} 项测试通过`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有数据库模型测试通过！');
    } else {
      console.log('⚠️  部分测试失败，请检查模型定义。');
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new DatabaseModelsTest();
  tester.runFullTest().catch(console.error);
}

module.exports = DatabaseModelsTest;
