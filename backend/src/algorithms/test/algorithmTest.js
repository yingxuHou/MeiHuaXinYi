/**
 * 梅花心易算法测试文件
 * 测试核心算法的正确性
 */

const { 
  MeihuaAlgorithmManager,
  MeihuaDivinationCore,
  BaguaSystem,
  FiveElementsSystem,
  DivinationValidator
} = require('../index');

class AlgorithmTest {
  constructor() {
    this.algorithmManager = new MeihuaAlgorithmManager();
    this.testResults = [];
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('开始运行梅花心易算法测试...\n');

    try {
      await this.testBaguaSystem();
      await this.testFiveElementsSystem();
      await this.testDivinationValidator();
      await this.testDivinationCore();
      await this.testAlgorithmManager();

      this.printTestResults();
    } catch (error) {
      console.error('测试过程中发生错误:', error.message);
    }
  }

  /**
   * 测试八卦系统
   */
  async testBaguaSystem() {
    console.log('测试八卦系统...');
    const baguaSystem = new BaguaSystem();

    // 测试八卦编号获取
    const testCases = [
      { lines: [1, 1, 1], expected: 1, name: '乾卦' },
      { lines: [0, 1, 1], expected: 2, name: '兑卦' },
      { lines: [1, 0, 1], expected: 3, name: '离卦' },
      { lines: [0, 0, 1], expected: 4, name: '震卦' },
      { lines: [1, 1, 0], expected: 5, name: '巽卦' },
      { lines: [0, 1, 0], expected: 6, name: '坎卦' },
      { lines: [1, 0, 0], expected: 7, name: '艮卦' },
      { lines: [0, 0, 0], expected: 8, name: '坤卦' }
    ];

    for (const testCase of testCases) {
      try {
        const result = baguaSystem.getBaguaNumber(testCase.lines);
        const success = result === testCase.expected;
        this.addTestResult('八卦系统', `获取${testCase.name}编号`, success, 
          `期望: ${testCase.expected}, 实际: ${result}`);
      } catch (error) {
        this.addTestResult('八卦系统', `获取${testCase.name}编号`, false, error.message);
      }
    }

    // 测试八卦属性获取
    try {
      const properties = baguaSystem.getBaguaProperties(1);
      const success = properties.name === '乾' && properties.element === '金';
      this.addTestResult('八卦系统', '获取八卦属性', success, 
        `期望: 乾卦金, 实际: ${properties.name}卦${properties.element}`);
    } catch (error) {
      this.addTestResult('八卦系统', '获取八卦属性', false, error.message);
    }

    // 测试六十四卦创建
    try {
      const hexagram = baguaSystem.createHexagram(1, 1); // 乾为天
      const success = hexagram.id === 1 && hexagram.lines.length === 6;
      this.addTestResult('八卦系统', '创建六十四卦', success, 
        `期望: ID=1, 6爻, 实际: ID=${hexagram.id}, ${hexagram.lines.length}爻`);
    } catch (error) {
      this.addTestResult('八卦系统', '创建六十四卦', false, error.message);
    }
  }

  /**
   * 测试五行系统
   */
  async testFiveElementsSystem() {
    console.log('测试五行系统...');
    const fiveElementsSystem = new FiveElementsSystem();

    // 测试五行关系分析
    const testCases = [
      { element1: '金', element2: '水', expected: 'generation', name: '金生水' },
      { element1: '水', element2: '木', expected: 'generation', name: '水生木' },
      { element1: '木', element2: '火', expected: 'generation', name: '木生火' },
      { element1: '火', element2: '土', expected: 'generation', name: '火生土' },
      { element1: '土', element2: '金', expected: 'generation', name: '土生金' },
      { element1: '金', element2: '木', expected: 'destruction', name: '金克木' },
      { element1: '木', element2: '土', expected: 'destruction', name: '木克土' },
      { element1: '土', element2: '水', expected: 'destruction', name: '土克水' },
      { element1: '水', element2: '火', expected: 'destruction', name: '水克火' },
      { element1: '火', element2: '金', expected: 'destruction', name: '火克金' },
      { element1: '金', element2: '金', expected: 'same', name: '金金比和' }
    ];

    for (const testCase of testCases) {
      try {
        const result = fiveElementsSystem.getElementRelationship(testCase.element1, testCase.element2);
        const success = result.type === testCase.expected;
        this.addTestResult('五行系统', testCase.name, success, 
          `期望: ${testCase.expected}, 实际: ${result.type}`);
      } catch (error) {
        this.addTestResult('五行系统', testCase.name, false, error.message);
      }
    }
  }

  /**
   * 测试验证器
   */
  async testDivinationValidator() {
    console.log('测试验证器...');
    const validator = new DivinationValidator();

    // 测试问题验证
    const questionTests = [
      { question: '我的事业如何？', expected: true, name: '正常问题' },
      { question: 'ab', expected: false, name: '问题过短' },
      { question: '', expected: false, name: '空问题' },
      { question: null, expected: false, name: 'null问题' }
    ];

    for (const test of questionTests) {
      try {
        const result = validator.validateQuestion(test.question);
        const success = result.isValid === test.expected;
        this.addTestResult('验证器', test.name, success, 
          `期望: ${test.expected}, 实际: ${result.isValid}`);
      } catch (error) {
        this.addTestResult('验证器', test.name, false, error.message);
      }
    }

    // 测试时辰验证
    const hourTests = [
      { hour: 12, expected: true, name: '正常时辰' },
      { hour: 25, expected: false, name: '无效时辰' },
      { hour: -1, expected: false, name: '负数时辰' },
      { hour: null, expected: true, name: 'null时辰' }
    ];

    for (const test of hourTests) {
      try {
        const result = validator.validateHour(test.hour);
        const success = result.isValid === test.expected;
        this.addTestResult('验证器', test.name, success, 
          `期望: ${test.expected}, 实际: ${result.isValid}`);
      } catch (error) {
        this.addTestResult('验证器', test.name, false, error.message);
      }
    }
  }

  /**
   * 测试占卜核心算法
   */
  async testDivinationCore() {
    console.log('测试占卜核心算法...');
    const divinationCore = new MeihuaDivinationCore();

    // 测试主卦生成
    try {
      const primaryGua = divinationCore.generatePrimaryHexagram();
      const success = Array.isArray(primaryGua) && primaryGua.length === 6 && 
                     primaryGua.every(line => line === 0 || line === 1);
      this.addTestResult('占卜核心', '生成主卦', success, 
        `期望: 6个0或1的数组, 实际: ${JSON.stringify(primaryGua)}`);
    } catch (error) {
      this.addTestResult('占卜核心', '生成主卦', false, error.message);
    }

    // 测试变卦生成
    try {
      const primaryGua = [1, 0, 1, 0, 1, 0]; // [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
      const movingLine = 3;
      const bianGua = divinationCore.generateBianGua(primaryGua, movingLine);
      const expected = [1, 0, 0, 0, 1, 0]; // 第3爻从1变0
      const success = JSON.stringify(bianGua) === JSON.stringify(expected);
      this.addTestResult('占卜核心', '生成变卦', success, 
        `期望: ${JSON.stringify(expected)}, 实际: ${JSON.stringify(bianGua)}`);
    } catch (error) {
      this.addTestResult('占卜核心', '生成变卦', false, error.message);
    }

    // 测试互卦生成
    try {
      const primaryGua = [1, 0, 1, 0, 1, 0]; // [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
      const huGua = divinationCore.generateHuGua(primaryGua);
      const expected = [0, 1, 0, 1, 0, 1]; // 234345顺序（第2、3、4、3、4、5爻）
      const success = JSON.stringify(huGua) === JSON.stringify(expected);
      this.addTestResult('占卜核心', '生成互卦', success, 
        `期望: ${JSON.stringify(expected)}, 实际: ${JSON.stringify(huGua)}`);
    } catch (error) {
      this.addTestResult('占卜核心', '生成互卦', false, error.message);
    }

    // 测试体用关系确定
    try {
      const primaryGua = [1, 0, 1, 0, 1, 0]; // [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
      const movingLine = 2; // 第2爻动（内卦动）
      const tiYong = divinationCore.determineTiYong(movingLine, primaryGua);
      const success = tiYong.tiIsOuter === true; // 内卦动，外卦为体
      this.addTestResult('占卜核心', '确定体用关系', success, 
        `期望: tiIsOuter=true, 实际: ${tiYong.tiIsOuter}`);
    } catch (error) {
      this.addTestResult('占卜核心', '确定体用关系', false, error.message);
    }
  }

  /**
   * 测试算法管理器
   */
  async testAlgorithmManager() {
    console.log('测试算法管理器...');

    // 测试完整占卜流程
    try {
      const result = await this.algorithmManager.performDivination('我的事业如何？', { hour: 12 });
      const success = result && result.id && result.hexagrams && result.tiYong;
      this.addTestResult('算法管理器', '完整占卜流程', success, 
        success ? '占卜成功' : '占卜失败');
    } catch (error) {
      this.addTestResult('算法管理器', '完整占卜流程', false, error.message);
    }

    // 测试系统信息获取
    try {
      const systemInfo = this.algorithmManager.getSystemInfo();
      const success = systemInfo && systemInfo.name && systemInfo.version;
      this.addTestResult('算法管理器', '获取系统信息', success, 
        success ? `系统: ${systemInfo.name} v${systemInfo.version}` : '获取失败');
    } catch (error) {
      this.addTestResult('算法管理器', '获取系统信息', false, error.message);
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
      console.log('\n🎉 所有测试通过！算法实现正确。');
    } else {
      console.log(`\n⚠️  有 ${totalFailed} 个测试失败，需要修复。`);
    }
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  const test = new AlgorithmTest();
  test.runAllTests().catch(console.error);
}

module.exports = AlgorithmTest;
