/**
 * 梅花心易 - 数据模型统一导出 v2.0
 * 所有数据模型的统一入口
 */

const User = require('./User');
const Divination = require('./Divination');
const Conversation = require('./Conversation');
const KnowledgeBase = require('./KnowledgeBase');

/**
 * 模型初始化和索引创建
 */
class ModelManager {
  constructor() {
    this.models = {
      User,
      Divination,
      Conversation,
      KnowledgeBase
    };
    this.initialized = false;
  }

  /**
   * 初始化所有模型
   */
  async initialize() {
    try {
      console.log('🔧 正在初始化数据模型...');

      // 确保所有索引都已创建
      await this.ensureIndexes();

      // 验证模型结构
      await this.validateModels();

      this.initialized = true;
      console.log('✅ 数据模型初始化完成');

      return true;
    } catch (error) {
      console.error('❌ 数据模型初始化失败:', error.message);
      throw error;
    }
  }

  /**
   * 确保所有索引都已创建
   */
  async ensureIndexes() {
    const indexPromises = Object.entries(this.models).map(async ([modelName, Model]) => {
      try {
        console.log(`📊 创建 ${modelName} 模型索引...`);
        await Model.ensureIndexes();
        console.log(`✅ ${modelName} 索引创建完成`);
      } catch (error) {
        console.warn(`⚠️ ${modelName} 索引创建失败:`, error.message);
        // 不抛出错误，允许应用继续运行
      }
    });

    await Promise.all(indexPromises);
  }

  /**
   * 验证模型结构
   */
  async validateModels() {
    for (const [modelName, Model] of Object.entries(this.models)) {
      try {
        // 检查模型是否正确定义
        if (!Model.schema) {
          throw new Error(`${modelName} 模型缺少 schema 定义`);
        }

        // 检查必要的字段是否存在
        const requiredFields = this.getRequiredFields(modelName);
        for (const field of requiredFields) {
          if (!Model.schema.paths[field]) {
            console.warn(`⚠️ ${modelName} 模型缺少必要字段: ${field}`);
          }
        }

        console.log(`✅ ${modelName} 模型验证通过`);
      } catch (error) {
        console.error(`❌ ${modelName} 模型验证失败:`, error.message);
        throw error;
      }
    }
  }

  /**
   * 获取模型必要字段
   */
  getRequiredFields(modelName) {
    const requiredFieldsMap = {
      User: ['email', 'username', 'passwordHash'],
      Divination: ['userId', 'question', 'hexagrams', 'analysis'],
      Conversation: ['userId', 'divinationId', 'messages'],
      KnowledgeBase: ['title', 'content', 'category', 'embedding']
    };

    return requiredFieldsMap[modelName] || [];
  }

  /**
   * 获取模型统计信息
   */
  async getModelStats() {
    const stats = {};

    for (const [modelName, Model] of Object.entries(this.models)) {
      try {
        const count = await Model.countDocuments();
        const indexes = await Model.collection.getIndexes();
        
        stats[modelName] = {
          documentCount: count,
          indexCount: Object.keys(indexes).length,
          collectionName: Model.collection.name,
          indexes: Object.keys(indexes)
        };
      } catch (error) {
        stats[modelName] = {
          error: error.message
        };
      }
    }

    return stats;
  }

  /**
   * 清理过期数据
   */
  async cleanupExpiredData() {
    try {
      console.log('🧹 开始清理过期数据...');

      // 清理过期的验证码
      const expiredVerifications = await User.updateMany(
        {
          'verification.email.code': { $exists: true },
          'verification.email.expiresAt': { $lt: new Date() }
        },
        {
          $unset: {
            'verification.email.code': '',
            'verification.email.expiresAt': ''
          }
        }
      );

      // 清理已删除的对话（软删除超过30天）
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const deletedConversations = await Conversation.deleteMany({
        status: 'deleted',
        updatedAt: { $lt: thirtyDaysAgo }
      });

      // 清理过期的知识库条目
      const deprecatedKnowledge = await KnowledgeBase.deleteMany({
        status: 'deprecated',
        updatedAt: { $lt: thirtyDaysAgo }
      });

      console.log(`✅ 数据清理完成:`);
      console.log(`   - 清理过期验证码: ${expiredVerifications.modifiedCount} 条`);
      console.log(`   - 删除过期对话: ${deletedConversations.deletedCount} 条`);
      console.log(`   - 删除废弃知识: ${deprecatedKnowledge.deletedCount} 条`);

      return {
        expiredVerifications: expiredVerifications.modifiedCount,
        deletedConversations: deletedConversations.deletedCount,
        deprecatedKnowledge: deprecatedKnowledge.deletedCount
      };
    } catch (error) {
      console.error('❌ 数据清理失败:', error.message);
      throw error;
    }
  }

  /**
   * 数据迁移
   */
  async migrate() {
    try {
      console.log('🔄 开始数据迁移...');

      // v2.0 数据迁移：为现有用户添加新字段默认值
      await this.migrateUserData();
      
      // 其他迁移任务...

      console.log('✅ 数据迁移完成');
    } catch (error) {
      console.error('❌ 数据迁移失败:', error.message);
      throw error;
    }
  }

  /**
   * 用户数据迁移
   */
  async migrateUserData() {
    try {
      // 为没有subscription字段的用户添加默认值
      const usersWithoutSubscription = await User.updateMany(
        { subscription: { $exists: false } },
        {
          $set: {
            subscription: {
              type: 'free',
              expiresAt: null,
              features: [],
              autoRenew: false,
              paymentMethod: null
            }
          }
        }
      );

      // 为没有usage字段的用户添加默认值
      const usersWithoutUsage = await User.updateMany(
        { usage: { $exists: false } },
        {
          $set: {
            usage: {
              divinationCount: 0,
              consultationCount: 0,
              freeCountToday: 10,
              lastResetDate: new Date(),
              lastActiveAt: new Date(),
              totalLoginDays: 0,
              consecutiveLoginDays: 0
            }
          }
        }
      );

      console.log(`   - 迁移用户订阅数据: ${usersWithoutSubscription.modifiedCount} 条`);
      console.log(`   - 迁移用户使用数据: ${usersWithoutUsage.modifiedCount} 条`);

    } catch (error) {
      console.error('用户数据迁移失败:', error.message);
      throw error;
    }
  }

  /**
   * 检查模型健康状态
   */
  async healthCheck() {
    const health = {
      initialized: this.initialized,
      models: {},
      overall: true
    };

    for (const [modelName, Model] of Object.entries(this.models)) {
      try {
        // 尝试执行简单查询
        await Model.findOne().limit(1);
        health.models[modelName] = { status: 'healthy' };
      } catch (error) {
        health.models[modelName] = { 
          status: 'error', 
          error: error.message 
        };
        health.overall = false;
      }
    }

    return health;
  }
}

// 创建模型管理器实例
const modelManager = new ModelManager();

module.exports = {
  // 模型导出
  User,
  Divination,
  Conversation,
  KnowledgeBase,
  
  // 管理器导出
  modelManager,
  
  // 便捷方法
  initializeModels: () => modelManager.initialize(),
  getModelStats: () => modelManager.getModelStats(),
  cleanupExpiredData: () => modelManager.cleanupExpiredData(),
  migrateData: () => modelManager.migrate(),
  healthCheck: () => modelManager.healthCheck()
};
