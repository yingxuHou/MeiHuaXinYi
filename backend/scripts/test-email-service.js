/**
 * 邮箱验证码服务测试脚本
 * 验证邮箱服务的完整功能
 */

require('dotenv').config();
const emailService = require('../src/services/emailService');
const { User } = require('../src/models');
const mongoose = require('mongoose');

class EmailServiceTest {
  constructor() {
    this.connectionString = process.env.MONGODB_URI;
    this.testResults = {
      connection: false,
      emailServiceInit: false,
      codeGeneration: false,
      emailSending: false,
      userVerification: false
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
   * 测试邮箱服务初始化
   */
  async testEmailServiceInit() {
    try {
      console.log('🔄 测试邮箱服务初始化...');
      
      const isInitialized = emailService.transporter !== null;
      if (isInitialized) {
        this.testResults.emailServiceInit = true;
        console.log('✅ 邮箱服务初始化成功');
        return true;
      } else {
        throw new Error('邮箱服务未初始化');
      }
    } catch (error) {
      console.error('❌ 邮箱服务初始化测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试验证码生成
   */
  async testCodeGeneration() {
    try {
      console.log('🔄 测试验证码生成...');
      
      // 测试6位数字验证码
      const code6 = emailService.generateVerificationCode(6);
      if (code6.length === 6 && /^\d{6}$/.test(code6)) {
        console.log('✅ 6位验证码生成成功:', code6);
      } else {
        throw new Error('6位验证码格式错误');
      }

      // 测试4位数字验证码
      const code4 = emailService.generateVerificationCode(4);
      if (code4.length === 4 && /^\d{4}$/.test(code4)) {
        console.log('✅ 4位验证码生成成功:', code4);
      } else {
        throw new Error('4位验证码格式错误');
      }

      // 测试验证令牌生成
      const token = emailService.generateVerificationToken();
      if (token.length === 64 && /^[a-f0-9]{64}$/.test(token)) {
        console.log('✅ 验证令牌生成成功');
      } else {
        throw new Error('验证令牌格式错误');
      }

      this.testResults.codeGeneration = true;
      console.log('✅ 验证码生成测试通过');
      return true;
    } catch (error) {
      console.error('❌ 验证码生成测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试邮件发送
   */
  async testEmailSending() {
    try {
      console.log('🔄 测试邮件发送...');
      
      const testEmail = 'test@example.com';
      const testCode = emailService.generateVerificationCode();
      
      // 测试注册验证码邮件
      const registerResult = await emailService.sendVerificationCode(testEmail, testCode, 'register');
      if (registerResult) {
        console.log('✅ 注册验证码邮件发送成功');
      } else {
        throw new Error('注册验证码邮件发送失败');
      }

      // 测试登录验证码邮件
      const loginResult = await emailService.sendVerificationCode(testEmail, testCode, 'login');
      if (loginResult) {
        console.log('✅ 登录验证码邮件发送成功');
      } else {
        throw new Error('登录验证码邮件发送失败');
      }

      // 测试密码重置验证码邮件
      const resetResult = await emailService.sendVerificationCode(testEmail, testCode, 'reset');
      if (resetResult) {
        console.log('✅ 密码重置验证码邮件发送成功');
      } else {
        throw new Error('密码重置验证码邮件发送失败');
      }

      this.testResults.emailSending = true;
      console.log('✅ 邮件发送测试通过');
      return true;
    } catch (error) {
      console.error('❌ 邮件发送测试失败:', error.message);
      return false;
    }
  }

  /**
   * 测试用户验证码功能
   */
  async testUserVerification() {
    try {
      console.log('🔄 测试用户验证码功能...');
      
      // 创建测试用户
      const testUser = new User({
        username: 'emailtest' + Date.now().toString().slice(-6),
        email: 'email-test-' + Date.now() + '@example.com',
        password: 'test123456'
      });

      const savedUser = await testUser.save();
      console.log('✅ 测试用户创建成功');

      // 生成验证码
      const verificationCode = emailService.generateVerificationCode();
      
      // 保存验证码到用户记录
      savedUser.verification.email.code = verificationCode;
      savedUser.verification.email.codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await savedUser.save();
      console.log('✅ 验证码保存成功:', verificationCode);

      // 验证验证码
      const isValid = (
        savedUser.verification.email.code === verificationCode &&
        savedUser.verification.email.codeExpiresAt > new Date()
      );

      if (isValid) {
        console.log('✅ 验证码验证成功');
      } else {
        throw new Error('验证码验证失败');
      }

      // 清理测试数据
      await User.findByIdAndDelete(savedUser._id);
      console.log('✅ 测试数据清理成功');

      this.testResults.userVerification = true;
      console.log('✅ 用户验证码功能测试通过');
      return true;
    } catch (error) {
      console.error('❌ 用户验证码功能测试失败:', error.message);
      return false;
    }
  }

  /**
   * 运行完整测试套件
   */
  async runFullTest() {
    console.log('🚀 开始邮箱验证码服务测试\n');
    
    try {
      // 连接数据库
      const connected = await this.connect();
      if (!connected) {
        throw new Error('数据库连接失败');
      }

      // 测试邮箱服务初始化
      await this.testEmailServiceInit();
      
      // 测试验证码生成
      await this.testCodeGeneration();
      
      // 测试邮件发送
      await this.testEmailSending();
      
      // 测试用户验证码功能
      await this.testUserVerification();

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
    console.log('\n📋 邮箱验证码服务测试结果:');
    console.log('================================');
    console.log(`数据库连接: ${this.testResults.connection ? '✅ 通过' : '❌ 失败'}`);
    console.log(`邮箱服务初始化: ${this.testResults.emailServiceInit ? '✅ 通过' : '❌ 失败'}`);
    console.log(`验证码生成: ${this.testResults.codeGeneration ? '✅ 通过' : '❌ 失败'}`);
    console.log(`邮件发送: ${this.testResults.emailSending ? '✅ 通过' : '❌ 失败'}`);
    console.log(`用户验证码功能: ${this.testResults.userVerification ? '✅ 通过' : '❌ 失败'}`);
    
    const passedTests = Object.values(this.testResults).filter(Boolean).length;
    const totalTests = Object.keys(this.testResults).length;
    
    console.log(`\n总体结果: ${passedTests}/${totalTests} 项测试通过`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有邮箱验证码服务测试通过！');
    } else {
      console.log('⚠️  部分测试失败，请检查邮箱服务配置。');
    }

    // 提供下一步建议
    console.log('\n💡 下一步建议:');
    if (this.testResults.emailSending && this.testResults.userVerification) {
      console.log('✅ 邮箱验证码服务功能完整');
      console.log('✅ 可以开始前端集成测试');
      console.log('✅ 建议配置生产环境邮箱服务');
    } else {
      console.log('❌ 需要修复邮箱服务问题');
      console.log('❌ 检查邮箱服务配置和依赖');
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new EmailServiceTest();
  tester.runFullTest().catch(console.error);
}

module.exports = EmailServiceTest;

