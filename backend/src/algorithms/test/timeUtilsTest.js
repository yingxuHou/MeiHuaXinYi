/**
 * 时间工具函数测试
 * 测试北京时间获取和时辰计算功能
 */

const { 
  getBeijingTime,
  getBeijingHour,
  getHourNumber,
  getCurrentHourNumber,
  getHourName,
  getCurrentHourName,
  formatBeijingTime,
  getCurrentTimeInfo
} = require('../utils/timeUtils');

class TimeUtilsTest {
  constructor() {
    this.testResults = [];
  }

  /**
   * 运行所有测试
   */
  runAllTests() {
    console.log('🕐 时间工具函数测试\n');
    console.log('=' * 50);

    this.testBeijingTime();
    this.testHourCalculation();
    this.testHourNames();
    this.testCurrentTimeInfo();
    this.testSpecificHours();

    this.printTestResults();
  }

  /**
   * 测试北京时间获取
   */
  testBeijingTime() {
    console.log('\n📅 测试北京时间获取:');
    
    try {
      const beijingTime = getBeijingTime();
      const formattedTime = formatBeijingTime(beijingTime);
      const hour = getBeijingHour();
      
      console.log(`北京时间: ${formattedTime}`);
      console.log(`小时数: ${hour}`);
      
      const success = beijingTime instanceof Date && hour >= 0 && hour <= 23;
      this.addTestResult('时间工具', '获取北京时间', success, 
        `时间: ${formattedTime}, 小时: ${hour}`);
    } catch (error) {
      this.addTestResult('时间工具', '获取北京时间', false, error.message);
    }
  }

  /**
   * 测试时辰计算
   */
  testHourCalculation() {
    console.log('\n⏰ 测试时辰计算:');
    
    const testCases = [
      { hour: 0, expected: 1, name: '子时' },
      { hour: 1, expected: 1, name: '子时' },
      { hour: 2, expected: 2, name: '丑时' },
      { hour: 3, expected: 2, name: '丑时' },
      { hour: 6, expected: 4, name: '卯时' },
      { hour: 12, expected: 7, name: '午时' },
      { hour: 18, expected: 10, name: '酉时' },
      { hour: 23, expected: 1, name: '子时' }
    ];

    for (const testCase of testCases) {
      try {
        const result = getHourNumber(testCase.hour);
        const success = result === testCase.expected;
        this.addTestResult('时间工具', `${testCase.hour}时对应${testCase.name}`, success, 
          `期望: ${testCase.expected}, 实际: ${result}`);
      } catch (error) {
        this.addTestResult('时间工具', `${testCase.hour}时对应${testCase.name}`, false, error.message);
      }
    }
  }

  /**
   * 测试时辰名称
   */
  testHourNames() {
    console.log('\n📝 测试时辰名称:');
    
    const testCases = [
      { number: 1, expected: '子时' },
      { number: 2, expected: '丑时' },
      { number: 7, expected: '午时' },
      { number: 12, expected: '亥时' }
    ];

    for (const testCase of testCases) {
      try {
        const result = getHourName(testCase.number);
        const success = result === testCase.expected;
        this.addTestResult('时间工具', `时辰${testCase.number}名称`, success, 
          `期望: ${testCase.expected}, 实际: ${result}`);
      } catch (error) {
        this.addTestResult('时间工具', `时辰${testCase.number}名称`, false, error.message);
      }
    }
  }

  /**
   * 测试当前时间信息
   */
  testCurrentTimeInfo() {
    console.log('\n🕐 测试当前时间信息:');
    
    try {
      const timeInfo = getCurrentTimeInfo();
      const currentHourNumber = getCurrentHourNumber();
      const currentHourName = getCurrentHourName();
      
      console.log(`当前时间信息:`);
      console.log(`  北京时间: ${timeInfo.formattedTime}`);
      console.log(`  小时: ${timeInfo.hour}`);
      console.log(`  时辰编号: ${timeInfo.hourNumber}`);
      console.log(`  时辰名称: ${timeInfo.hourName}`);
      
      const success = timeInfo && 
                     timeInfo.beijingTime instanceof Date &&
                     timeInfo.hour >= 0 && timeInfo.hour <= 23 &&
                     timeInfo.hourNumber >= 1 && timeInfo.hourNumber <= 12 &&
                     timeInfo.hourName &&
                     currentHourNumber === timeInfo.hourNumber &&
                     currentHourName === timeInfo.hourName;
      
      this.addTestResult('时间工具', '获取当前时间信息', success, 
        `时间: ${timeInfo.formattedTime}, 时辰: ${timeInfo.hourName}`);
    } catch (error) {
      this.addTestResult('时间工具', '获取当前时间信息', false, error.message);
    }
  }

  /**
   * 测试特定小时
   */
  testSpecificHours() {
    console.log('\n🔍 测试特定小时:');
    
    // 测试边界值
    const boundaryTests = [
      { hour: 0, expected: 1, name: '子时开始' },
      { hour: 1, expected: 1, name: '子时结束' },
      { hour: 2, expected: 2, name: '丑时开始' },
      { hour: 23, expected: 1, name: '子时开始' }
    ];

    for (const test of boundaryTests) {
      try {
        const result = getHourNumber(test.hour);
        const success = result === test.expected;
        this.addTestResult('时间工具', test.name, success, 
          `小时${test.hour}期望: ${test.expected}, 实际: ${result}`);
      } catch (error) {
        this.addTestResult('时间工具', test.name, false, error.message);
      }
    }
  }

  /**
   * 添加测试结果
   */
  addTestResult(module, test, success, message) {
    this.testResults.push({
      module,
      test,
      success,
      message,
      timestamp: new Date()
    });
  }

  /**
   * 打印测试结果
   */
  printTestResults() {
    console.log('\n=== 测试结果汇总 ===');
    
    const moduleResults = {};
    this.testResults.forEach(result => {
      if (!moduleResults[result.module]) {
        moduleResults[result.module] = { total: 0, passed: 0, failed: 0 };
      }
      moduleResults[result.module].total++;
      if (result.success) {
        moduleResults[result.module].passed++;
      } else {
        moduleResults[result.module].failed++;
      }
    });

    // 按模块显示结果
    Object.keys(moduleResults).forEach(module => {
      const stats = moduleResults[module];
      const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`\n${module}: ${stats.passed}/${stats.total} 通过 (${passRate}%)`);
      
      // 显示失败的测试
      const failedTests = this.testResults.filter(r => r.module === module && !r.success);
      failedTests.forEach(test => {
        console.log(`  ❌ ${test.test}: ${test.message}`);
      });
    });

    // 总体统计
    const totalTests = this.testResults.length;
    const totalPassed = this.testResults.filter(r => r.success).length;
    const totalFailed = totalTests - totalPassed;
    const overallPassRate = ((totalPassed / totalTests) * 100).toFixed(1);

    console.log(`\n=== 总体结果 ===`);
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${totalPassed}`);
    console.log(`失败: ${totalFailed}`);
    console.log(`通过率: ${overallPassRate}%`);

    if (totalFailed === 0) {
      console.log('\n🎉 所有测试通过！时间工具函数工作正常。');
    } else {
      console.log(`\n⚠️  有 ${totalFailed} 个测试失败，需要修复。`);
    }
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  const test = new TimeUtilsTest();
  test.runAllTests();
}

module.exports = TimeUtilsTest;
