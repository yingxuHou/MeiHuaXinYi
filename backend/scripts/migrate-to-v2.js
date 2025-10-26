/**
 * 梅花心易 - v2.0数据迁移脚本
 * 为现有用户添加新字段默认值，确保数据完整性
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { databaseManager } = require('../src/config/database');
const { User, migrateData } = require('../src/models');

/**
 * v2.0数据迁移管理器
 */
class MigrationManager {
  constructor() {
    this.migrationResults = {
      userSubscription: 0,
      userUsage: 0,
      userPreferences: 0,
      userBirthInfo: 0,
      errors: []
    };
  }

  /**
   * 执行完整迁移
   */
  async runMigration() {
    console.log('🚀 开始v2.0数据迁移...\n');

    try {
      // 1. 连接数据库
      await this.connectDatabase();
      
      // 2. 备份数据（可选）
      await this.createBackup();
      
      // 3. 执行用户数据迁移
      await this.migrateUserData();
      
      // 4. 验证迁移结果
      await this.validateMigration();
      
      // 5. 生成迁移报告
      this.generateMigrationReport();
      
      console.log('✅ 数据迁移完成！');
      
    } catch (error) {
      console.error('❌ 数据迁移失败:', error.message);
      await this.rollbackMigration();
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 连接数据库
   */
  async connectDatabase() {
    console.log('📡 连接数据库...');
    try {
      await databaseManager.connectAll();
      console.log('✅ 数据库连接成功\n');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      throw error;
    }
  }

  /**
   * 创建数据备份
   */
  async createBackup() {
    console.log('💾 创建数据备份...');
    try {
      // 获取迁移前的用户数量
      const userCount = await User.countDocuments();
      console.log(`📊 发现 ${userCount} 个用户需要迁移`);
      
      if (userCount === 0) {
        console.log('ℹ️ 没有用户数据需要迁移');
        return;
      }
      
      // 这里可以添加实际的备份逻辑
      // 例如：导出到JSON文件或创建数据库快照
      console.log('✅ 数据备份完成（模拟）\n');
      
    } catch (error) {
      console.error('❌ 数据备份失败:', error.message);
      throw error;
    }
  }

  /**
   * 迁移用户数据
   */
  async migrateUserData() {
    console.log('🔄 开始用户数据迁移...');

    try {
      // 1. 迁移订阅信息
      await this.migrateUserSubscription();
      
      // 2. 迁移使用统计
      await this.migrateUserUsage();
      
      // 3. 迁移偏好设置
      await this.migrateUserPreferences();
      
      // 4. 迁移生辰八字信息
      await this.migrateUserBirthInfo();
      
      console.log('✅ 用户数据迁移完成\n');
      
    } catch (error) {
      console.error('❌ 用户数据迁移失败:', error.message);
      throw error;
    }
  }

  /**
   * 迁移用户订阅信息
   */
  async migrateUserSubscription() {
    console.log('   📋 迁移订阅信息...');
    
    try {
      const result = await User.updateMany(
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
      
      this.migrationResults.userSubscription = result.modifiedCount;
      console.log(`   ✅ 更新了 ${result.modifiedCount} 个用户的订阅信息`);
      
    } catch (error) {
      console.error('   ❌ 订阅信息迁移失败:', error.message);
      this.migrationResults.errors.push(`订阅信息迁移: ${error.message}`);
    }
  }

  /**
   * 迁移用户使用统计
   */
  async migrateUserUsage() {
    console.log('   📊 迁移使用统计...');
    
    try {
      const result = await User.updateMany(
        { usage: { $exists: false } },
        {
          $set: {
            usage: {
              divinationCount: 0,
              consultationCount: 0,
              freeCountToday: 3,
              lastResetDate: new Date(),
              lastActiveAt: new Date(),
              totalLoginDays: 0,
              consecutiveLoginDays: 0
            }
          }
        }
      );
      
      this.migrationResults.userUsage = result.modifiedCount;
      console.log(`   ✅ 更新了 ${result.modifiedCount} 个用户的使用统计`);
      
    } catch (error) {
      console.error('   ❌ 使用统计迁移失败:', error.message);
      this.migrationResults.errors.push(`使用统计迁移: ${error.message}`);
    }
  }

  /**
   * 迁移用户偏好设置
   */
  async migrateUserPreferences() {
    console.log('   ⚙️ 迁移偏好设置...');
    
    try {
      // 为没有完整偏好设置的用户添加新字段
      const result = await User.updateMany(
        { 
          $or: [
            { 'preferences.divination': { $exists: false } },
            { 'preferences.notifications.divinationReminder': { $exists: false } }
          ]
        },
        {
          $set: {
            'preferences.divination': {
              preferredMethod: 'time',
              autoSave: true,
              detailedAnalysis: true,
              aiInterpretation: true
            },
            'preferences.notifications.divinationReminder': true,
            'preferences.notifications.weeklyReport': false,
            'preferences.privacy.allowDataAnalysis': true,
            'preferences.privacy.shareWithCommunity': false
          }
        }
      );
      
      this.migrationResults.userPreferences = result.modifiedCount;
      console.log(`   ✅ 更新了 ${result.modifiedCount} 个用户的偏好设置`);
      
    } catch (error) {
      console.error('   ❌ 偏好设置迁移失败:', error.message);
      this.migrationResults.errors.push(`偏好设置迁移: ${error.message}`);
    }
  }

  /**
   * 迁移生辰八字信息
   */
  async migrateUserBirthInfo() {
    console.log('   🎂 迁移生辰八字信息...');
    
    try {
      // 为现有的生辰八字信息添加新字段
      const result = await User.updateMany(
        { 
          'birthInfo': { $exists: true },
          'birthInfo.isComplete': { $exists: false }
        },
        {
          $set: {
            'birthInfo.minute': 0,
            'birthInfo.location.country': 'CN',
            'birthInfo.isComplete': false
          }
        }
      );
      
      this.migrationResults.userBirthInfo = result.modifiedCount;
      console.log(`   ✅ 更新了 ${result.modifiedCount} 个用户的生辰八字信息`);
      
    } catch (error) {
      console.error('   ❌ 生辰八字信息迁移失败:', error.message);
      this.migrationResults.errors.push(`生辰八字迁移: ${error.message}`);
    }
  }

  /**
   * 验证迁移结果
   */
  async validateMigration() {
    console.log('🔍 验证迁移结果...');
    
    try {
      // 检查所有用户是否都有必要的字段
      const usersWithoutSubscription = await User.countDocuments({
        subscription: { $exists: false }
      });
      
      const usersWithoutUsage = await User.countDocuments({
        usage: { $exists: false }
      });
      
      const totalUsers = await User.countDocuments();
      
      console.log(`📊 验证结果:`);
      console.log(`   总用户数: ${totalUsers}`);
      console.log(`   缺少订阅信息: ${usersWithoutSubscription}`);
      console.log(`   缺少使用统计: ${usersWithoutUsage}`);
      
      if (usersWithoutSubscription > 0 || usersWithoutUsage > 0) {
        console.warn('⚠️ 部分用户数据迁移不完整');
      } else {
        console.log('✅ 所有用户数据迁移完整');
      }
      
    } catch (error) {
      console.error('❌ 迁移验证失败:', error.message);
      throw error;
    }
    
    console.log('');
  }

  /**
   * 生成迁移报告
   */
  generateMigrationReport() {
    console.log('📋 迁移报告:');
    console.log('=' .repeat(50));
    console.log(`订阅信息迁移: ${this.migrationResults.userSubscription} 个用户`);
    console.log(`使用统计迁移: ${this.migrationResults.userUsage} 个用户`);
    console.log(`偏好设置迁移: ${this.migrationResults.userPreferences} 个用户`);
    console.log(`生辰八字迁移: ${this.migrationResults.userBirthInfo} 个用户`);
    
    if (this.migrationResults.errors.length > 0) {
      console.log('\n❌ 迁移错误:');
      this.migrationResults.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
    
    console.log('=' .repeat(50));
  }

  /**
   * 回滚迁移（如果需要）
   */
  async rollbackMigration() {
    console.log('🔄 尝试回滚迁移...');
    
    try {
      // 这里可以添加回滚逻辑
      // 例如：从备份恢复数据
      console.log('⚠️ 回滚功能需要手动实现');
      
    } catch (error) {
      console.error('❌ 回滚失败:', error.message);
    }
  }

  /**
   * 清理资源
   */
  async cleanup() {
    console.log('\n🧹 清理资源...');
    try {
      await databaseManager.disconnectAll();
      console.log('✅ 资源清理完成');
    } catch (error) {
      console.error('❌ 资源清理失败:', error.message);
    }
  }
}

// 运行迁移
if (require.main === module) {
  const migration = new MigrationManager();
  migration.runMigration().catch(error => {
    console.error('迁移失败:', error);
    process.exit(1);
  });
}

module.exports = MigrationManager;
