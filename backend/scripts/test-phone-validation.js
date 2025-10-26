/**
 * 手机号验证专项测试脚本
 * 测试各种手机号格式的验证功能
 */

require('dotenv').config();
const axios = require('axios');

class PhoneValidationTest {
  constructor() {
    this.baseURL = `http://localhost:${process.env.PORT || 3001}/api`;
    this.testResults = [];
  }

  /**
   * 测试用例数据
   */
  getTestCases() {
    return [
      // 有效的手机号
      { phone: '13800138000', description: '标准移动号码', shouldPass: true },
      { phone: '15912345678', description: '标准联通号码', shouldPass: true },
      { phone: '18888888888', description: '标准电信号码', shouldPass: true },
      { phone: '17012345678', description: '虚拟运营商号码', shouldPass: true },
      { phone: '19912345678', description: '新号段', shouldPass: true },
      
      // 修复后应该支持的号码
      { phone: '12012345678', description: '12开头号码', shouldPass: true },
      { phone: '11012345678', description: '11开头号码', shouldPass: true },
      { phone: '10012345678', description: '10开头号码', shouldPass: true },
      
      // 格式化输入（应该被自动处理）
      { phone: '138 0013 8000', description: '带空格格式', shouldPass: true },
      { phone: '138-0013-8000', description: '带横线格式', shouldPass: true },
      { phone: '(138)0013-8000', description: '带括号格式', shouldPass: true },
      { phone: '+86 138 0013 8000', description: '带国际区号', shouldPass: true },
      
      // 无效的手机号
      { phone: '12345678901', description: '不以1开头', shouldPass: false },
      { phone: '1380013800', description: '只有10位', shouldPass: false },
      { phone: '138001380000', description: '12位数字', shouldPass: false },
      { phone: '138abc38000', description: '包含字母', shouldPass: false },
      { phone: '', description: '空字符串', shouldPass: false },
      { phone: '138-0013-800', description: '格式化但位数不够', shouldPass: false },
      { phone: '021-12345678', description: '座机号码', shouldPass: false }
    ];
  }

  /**
   * 测试单个手机号注册
   */
  async testPhoneRegistration(phone, description) {
    try {
      console.log(`\n🔄 测试: ${description}`);
      console.log(`📱 手机号: "${phone}"`);
      
      const timestamp = Date.now().toString().slice(-6);
      const testUser = {
        username: `test_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'Test123456A',
        phone: phone
      };

      const response = await axios.post(`${this.baseURL}/auth/register`, testUser);

      if (response.status === 201 && response.data.success) {
        console.log('✅ 注册成功');
        return { success: true, userId: response.data.data.user.id };
      } else {
        console.log('❌ 注册失败: 响应格式异常');
        return { success: false, error: '响应格式异常' };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.log(`❌ 注册失败: ${errorMsg}`);
      
      // 检查是否是手机号验证错误
      const isPhoneError = errorMsg.includes('手机号') || 
                          errorMsg.includes('phone') ||
                          (error.response?.data?.error?.details && 
                           error.response.data.error.details.some(d => d.path === 'phone'));
      
      return { 
        success: false, 
        error: errorMsg,
        isPhoneError: isPhoneError,
        details: error.response?.data?.error?.details
      };
    }
  }

  /**
   * 清理测试用户
   */
  async cleanupTestUser(userId) {
    try {
      // 这里可以添加清理逻辑，但为了简化测试，暂时跳过
      console.log(`🗑️ 跳过清理用户: ${userId}`);
    } catch (error) {
      console.log(`⚠️ 清理用户失败: ${error.message}`);
    }
  }

  /**
   * 运行完整测试
   */
  async runFullTest() {
    console.log('🚀 开始手机号验证专项测试\n');
    
    const testCases = this.getTestCases();
    let passedTests = 0;
    let totalTests = testCases.length;
    
    for (const testCase of testCases) {
      const result = await this.testPhoneRegistration(testCase.phone, testCase.description);
      
      // 分析结果
      const testPassed = (result.success === testCase.shouldPass) || 
                        (testCase.shouldPass && result.success) ||
                        (!testCase.shouldPass && !result.success && result.isPhoneError);
      
      if (testPassed) {
        passedTests++;
        console.log('🎯 测试结果: ✅ 符合预期');
      } else {
        console.log('🎯 测试结果: ❌ 不符合预期');
        if (testCase.shouldPass && !result.success) {
          console.log(`   期望: 应该通过验证`);
          console.log(`   实际: 验证失败 - ${result.error}`);
        } else if (!testCase.shouldPass && result.success) {
          console.log(`   期望: 应该验证失败`);
          console.log(`   实际: 验证通过`);
        }
      }
      
      this.testResults.push({
        phone: testCase.phone,
        description: testCase.description,
        shouldPass: testCase.shouldPass,
        actualResult: result,
        testPassed: testPassed
      });
      
      // 如果注册成功，记录用户ID用于后续清理
      if (result.success && result.userId) {
        await this.cleanupTestUser(result.userId);
      }
      
      // 添加延迟避免频率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 输出测试总结
    this.printTestSummary(passedTests, totalTests);
  }

  /**
   * 打印测试总结
   */
  printTestSummary(passedTests, totalTests) {
    console.log('\n📋 手机号验证测试总结');
    console.log('================================');
    
    // 按类别统计
    const categories = {
      '标准号码': this.testResults.filter(r => r.description.includes('标准')),
      '新支持号段': this.testResults.filter(r => r.description.includes('开头号码')),
      '格式化输入': this.testResults.filter(r => r.description.includes('格式')),
      '无效号码': this.testResults.filter(r => !r.shouldPass)
    };
    
    Object.entries(categories).forEach(([category, results]) => {
      if (results.length > 0) {
        const passed = results.filter(r => r.testPassed).length;
        console.log(`${category}: ${passed}/${results.length} 通过`);
        
        results.forEach(result => {
          const icon = result.testPassed ? '✅' : '❌';
          console.log(`  ${icon} ${result.description}: "${result.phone}"`);
        });
      }
    });
    
    console.log(`\n总体结果: ${passedTests}/${totalTests} 项测试通过`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有测试通过！手机号验证功能正常。');
    } else {
      console.log('⚠️  部分测试失败，请检查验证逻辑。');
    }
    
    // 修复效果评估
    const newSupportTests = this.testResults.filter(r => 
      r.description.includes('开头号码') || r.description.includes('格式')
    );
    const newSupportPassed = newSupportTests.filter(r => r.testPassed).length;
    
    console.log('\n🔧 修复效果评估:');
    console.log(`新支持的号段和格式: ${newSupportPassed}/${newSupportTests.length} 通过`);
    
    if (newSupportPassed === newSupportTests.length) {
      console.log('✅ 手机号验证修复成功！');
    } else {
      console.log('❌ 手机号验证修复需要进一步调整。');
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new PhoneValidationTest();
  tester.runFullTest().catch(console.error);
}

module.exports = PhoneValidationTest;
