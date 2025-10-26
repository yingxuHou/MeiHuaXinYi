/**
 * 用户管理系统完整测试脚本
 * 测试用户注册、登录、信息管理等功能与MongoDB Atlas的集成
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

class UserManagementTest {
  constructor() {
    this.baseURL = `http://localhost:${process.env.PORT || 3001}/api`;
    const timestamp = Date.now().toString().slice(-6); // 只取最后6位确保用户名不超过20字符
    this.testUser = {
      username: 'test_' + timestamp,
      email: `test_${timestamp}@example.com`,
      password: 'Test123456A', // 符合验证要求：包含大小写字母和数字
      phone: '13800138000'
    };
    this.authToken = null;
    this.userId = null;
    this.testResults = {
      serverConnection: false,
      userRegistration: false,
      userLogin: false,
      profileUpdate: false,
      birthInfoUpdate: false,
      userRetrieval: false,
      passwordChange: false,
      userDeletion: false
    };
  }

  /**
   * 测试服务器连接
   */
  async testServerConnection() {
    try {
      console.log('🔄 测试服务器连接...');
      const response = await axios.get(`${this.baseURL}/health`);
      
      if (response.status === 200) {
        console.log('✅ 服务器连接成功');
        console.log(`📊 服务器状态: ${response.data.data.status}`);
        this.testResults.serverConnection = true;
        return true;
      }
      
      throw new Error('服务器响应异常');
    } catch (error) {
      console.error('❌ 服务器连接失败:', error.message);
      return false;
    }
  }

  /**
   * 测试用户注册
   */
  async testUserRegistration() {
    try {
      console.log('\n🔄 测试用户注册...');
      console.log(`📧 注册邮箱: ${this.testUser.email}`);
      
      const response = await axios.post(`${this.baseURL}/auth/register`, {
        username: this.testUser.username,
        email: this.testUser.email,
        password: this.testUser.password,
        phone: this.testUser.phone
      });

      if (response.status === 201 && response.data.success) {
        console.log('✅ 用户注册成功');
        console.log(`👤 用户ID: ${response.data.data.user.id}`);
        console.log(`🎫 Token: ${response.data.data.tokens.accessToken.substring(0, 20)}...`);

        this.userId = response.data.data.user.id;
        this.authToken = response.data.data.tokens.accessToken;
        this.testResults.userRegistration = true;
        return true;
      }
      
      throw new Error('注册响应格式异常');
    } catch (error) {
      console.error('❌ 用户注册失败:', error.response?.data?.message || error.message);
      return false;
    }
  }

  /**
   * 测试用户登录
   */
  async testUserLogin() {
    try {
      console.log('\n🔄 测试用户登录...');
      
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.testUser.email,
        password: this.testUser.password
      });

      if (response.status === 200 && response.data.success) {
        console.log('✅ 用户登录成功');
        console.log(`👤 用户名: ${response.data.data.user.username}`);
        console.log(`📧 邮箱: ${response.data.data.user.email}`);
        
        // 更新token（可能会刷新）
        this.authToken = response.data.data.tokens.accessToken;
        this.testResults.userLogin = true;
        return true;
      }
      
      throw new Error('登录响应格式异常');
    } catch (error) {
      console.error('❌ 用户登录失败:', error.response?.data?.message || error.message);
      return false;
    }
  }

  /**
   * 测试个人资料更新
   */
  async testProfileUpdate() {
    try {
      console.log('\n🔄 测试个人资料更新...');
      
      const profileData = {
        profile: {
          nickname: '易学爱好者',
          gender: 'male',
          bio: '热爱传统文化，专注梅花易数研究',
          location: {
            province: '北京市',
            city: '北京市',
            district: '朝阳区'
          }
        }
      };

      const response = await axios.put(`${this.baseURL}/user/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 && response.data.success) {
        console.log('✅ 个人资料更新成功');
        const profile = response.data.data.profile || response.data.data;
        console.log(`🏷️ 昵称: ${profile.nickname || '未设置'}`);
        if (profile.location) {
          console.log(`📍 位置: ${profile.location.province} ${profile.location.city}`);
        }

        this.testResults.profileUpdate = true;
        return true;
      }
      
      throw new Error('资料更新响应格式异常');
    } catch (error) {
      console.error('❌ 个人资料更新失败:', error.response?.data?.message || error.message);
      return false;
    }
  }

  /**
   * 测试生辰八字信息更新
   */
  async testBirthInfoUpdate() {
    try {
      console.log('\n🔄 测试生辰八字信息更新...');
      
      const birthData = {
        birthInfo: {
          year: 1990,
          month: 6,
          day: 15,
          hour: 14,
          minute: 30,
          timezone: 'Asia/Shanghai',
          lunar: {
            year: 1990,
            month: 5,
            day: 24,
            isLeapMonth: false
          }
        }
      };

      const response = await axios.put(`${this.baseURL}/user/birth-info`, birthData, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 && response.data.success) {
        console.log('✅ 生辰八字信息更新成功');
        console.log(`📅 出生日期: ${response.data.data.birthInfo.year}-${response.data.data.birthInfo.month}-${response.data.data.birthInfo.day}`);
        console.log(`🕐 出生时间: ${response.data.data.birthInfo.hour}:${response.data.data.birthInfo.minute}`);
        
        this.testResults.birthInfoUpdate = true;
        return true;
      }
      
      throw new Error('生辰信息更新响应格式异常');
    } catch (error) {
      console.error('❌ 生辰八字信息更新失败:', error.response?.data?.message || error.message);
      return false;
    }
  }

  /**
   * 测试用户信息获取
   */
  async testUserRetrieval() {
    try {
      console.log('\n🔄 测试用户信息获取...');
      
      const response = await axios.get(`${this.baseURL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (response.status === 200 && response.data.success) {
        console.log('✅ 用户信息获取成功');
        const user = response.data.data;
        console.log(`👤 用户名: ${user.username}`);
        console.log(`📧 邮箱: ${user.email}`);
        console.log(`🏷️ 昵称: ${user.profile?.nickname || '未设置'}`);
        console.log(`📅 注册时间: ${new Date(user.createdAt).toLocaleString()}`);
        console.log(`🎯 免费次数: ${user.freeCount}`);
        
        this.testResults.userRetrieval = true;
        return true;
      }
      
      throw new Error('用户信息获取响应格式异常');
    } catch (error) {
      console.error('❌ 用户信息获取失败:', error.response?.data?.message || error.message);
      return false;
    }
  }

  /**
   * 测试密码修改
   */
  async testPasswordChange() {
    try {
      console.log('\n🔄 测试密码修改...');
      
      const newPassword = 'NewPassword123';
      const response = await axios.post(`${this.baseURL}/user/change-password`, {
        currentPassword: this.testUser.password,
        newPassword: newPassword,
        confirmPassword: newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 && response.data.success) {
        console.log('✅ 密码修改成功');
        
        // 更新测试用户密码
        this.testUser.password = newPassword;
        this.testResults.passwordChange = true;
        return true;
      }
      
      throw new Error('密码修改响应格式异常');
    } catch (error) {
      console.error('❌ 密码修改失败:', error.response?.data?.message || error.message);
      return false;
    }
  }

  /**
   * 测试用户删除（清理测试数据）
   */
  async testUserDeletion() {
    try {
      console.log('\n🔄 测试用户删除（清理测试数据）...');
      
      const response = await axios.delete(`${this.baseURL}/user/account`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        },
        data: {
          password: this.testUser.password,
          confirmation: 'DELETE_MY_ACCOUNT'
        }
      });

      if (response.status === 200 && response.data.success) {
        console.log('✅ 用户删除成功（测试数据已清理）');
        this.testResults.userDeletion = true;
        return true;
      }
      
      throw new Error('用户删除响应格式异常');
    } catch (error) {
      console.error('❌ 用户删除失败:', error.response?.data?.message || error.message);
      return false;
    }
  }

  /**
   * 验证数据库中的数据
   */
  async verifyDatabaseData() {
    try {
      console.log('\n🔄 验证MongoDB Atlas数据库数据...');
      
      // 连接数据库
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ 数据库连接成功');
      
      // 检查用户集合
      const User = require('../src/models/User');
      const userCount = await User.countDocuments();
      console.log(`👥 用户总数: ${userCount}`);
      
      // 检查最近创建的用户
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('username email createdAt profile.nickname');
      
      console.log('📋 最近用户:');
      recentUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.username} (${user.email}) - ${user.profile?.nickname || '无昵称'}`);
      });
      
      await mongoose.connection.close();
      console.log('🔌 数据库连接已关闭');
      
      return true;
    } catch (error) {
      console.error('❌ 数据库验证失败:', error.message);
      return false;
    }
  }

  /**
   * 运行完整测试套件
   */
  async runFullTest() {
    console.log('🚀 开始用户管理系统完整测试\n');
    console.log('📋 测试用户信息:');
    console.log(`  用户名: ${this.testUser.username}`);
    console.log(`  邮箱: ${this.testUser.email}`);
    console.log(`  手机: ${this.testUser.phone}\n`);

    try {
      // 1. 测试服务器连接
      const serverOk = await this.testServerConnection();
      if (!serverOk) {
        throw new Error('服务器连接失败，无法继续测试');
      }

      // 2. 测试用户注册
      await this.testUserRegistration();

      // 3. 测试用户登录
      await this.testUserLogin();

      // 4. 测试个人资料更新
      await this.testProfileUpdate();

      // 5. 测试生辰八字信息更新
      await this.testBirthInfoUpdate();

      // 6. 测试用户信息获取
      await this.testUserRetrieval();

      // 7. 测试密码修改
      await this.testPasswordChange();

      // 8. 验证数据库数据
      await this.verifyDatabaseData();

      // 9. 清理测试数据
      await this.testUserDeletion();

      // 输出测试结果
      this.printTestResults();

    } catch (error) {
      console.error('\n❌ 测试过程中发生错误:', error.message);
    }
  }

  /**
   * 打印测试结果
   */
  printTestResults() {
    console.log('\n📋 测试结果汇总:');
    console.log('================================');
    console.log(`服务器连接: ${this.testResults.serverConnection ? '✅ 通过' : '❌ 失败'}`);
    console.log(`用户注册: ${this.testResults.userRegistration ? '✅ 通过' : '❌ 失败'}`);
    console.log(`用户登录: ${this.testResults.userLogin ? '✅ 通过' : '❌ 失败'}`);
    console.log(`资料更新: ${this.testResults.profileUpdate ? '✅ 通过' : '❌ 失败'}`);
    console.log(`生辰信息: ${this.testResults.birthInfoUpdate ? '✅ 通过' : '❌ 失败'}`);
    console.log(`信息获取: ${this.testResults.userRetrieval ? '✅ 通过' : '❌ 失败'}`);
    console.log(`密码修改: ${this.testResults.passwordChange ? '✅ 通过' : '❌ 失败'}`);
    console.log(`数据清理: ${this.testResults.userDeletion ? '✅ 通过' : '❌ 失败'}`);

    const passedTests = Object.values(this.testResults).filter(Boolean).length;
    const totalTests = Object.keys(this.testResults).length;

    console.log(`\n总体结果: ${passedTests}/${totalTests} 项测试通过`);

    if (passedTests === totalTests) {
      console.log('🎉 所有测试通过！用户管理系统与MongoDB Atlas集成成功。');
    } else {
      console.log('⚠️  部分测试失败，请检查相关功能实现。');
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new UserManagementTest();
  tester.runFullTest().catch(console.error);
}

module.exports = UserManagementTest;
