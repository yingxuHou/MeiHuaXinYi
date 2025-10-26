/**
 * 梅花心易占卜算法演示
 * 展示完整的占卜流程和结果
 */

const { algorithmManager } = require('../index');
const { getCurrentTimeInfo } = require('../utils/timeUtils');

class DivinationDemo {
  constructor() {
    this.algorithmManager = algorithmManager;
  }

  /**
   * 运行演示
   */
  async runDemo() {
    console.log('🔮 梅花心易占卜算法演示\n');
    console.log('=' * 50);

    // 演示问题列表
    const demoQuestions = [
      '我的事业运势如何？',
      '感情方面有什么建议？',
      '最近的投资决策是否合适？',
      '学习考试能否顺利通过？',
      '身体健康状况如何？'
    ];

    for (let i = 0; i < 3; i++) {
      const question = demoQuestions[i];
      console.log(`\n📋 占卜问题 ${i + 1}: ${question}`);
      console.log('-'.repeat(50));

      try {
        const result = await this.algorithmManager.performDivination(question);
        // 不传递hour参数，让算法使用当前北京时间

        this.displayDivinationResult(result);
      } catch (error) {
        console.error(`❌ 占卜失败: ${error.message}`);
      }

      console.log('\n' + '='.repeat(50));
    }

    // 显示系统信息
    this.displaySystemInfo();
  }

  /**
   * 显示占卜结果
   */
  displayDivinationResult(result) {
    console.log(`🆔 占卜ID: ${result.id}`);
    console.log(`⏰ 占卜时间: ${result.timestamp.toLocaleString()}`);
    
    // 显示时间信息
    if (result.metadata && result.metadata.timeInfo) {
      const timeInfo = result.metadata.timeInfo;
      console.log(`🕐 北京时间: ${timeInfo.formattedTime}`);
      console.log(`⏳ 起卦时辰: ${timeInfo.hourName} (${timeInfo.hour}时)`);
    }

    // 显示三卦信息
    console.log('\n📊 三卦分析:');
    console.log(`本卦: ${result.hexagrams.ben.name} (${this.formatLines(result.hexagrams.ben.lines)})`);
    console.log(`互卦: ${result.hexagrams.hu.name} (${this.formatLines(result.hexagrams.hu.lines)})`);
    console.log(`变卦: ${result.hexagrams.bian.name} (${this.formatLines(result.hexagrams.bian.lines)})`);

    // 显示动爻信息
    console.log(`\n⚡ 动爻: 第${result.movingLine}爻`);
    console.log(`动爻含义: ${result.interpretation.movingLine.meaning}`);

    // 显示体用关系
    console.log('\n⚖️ 体用关系:');
    const tiYong = result.tiYong.analysis;
    console.log(`体卦: ${tiYong.ti.properties.name}(${tiYong.ti.element})`);
    console.log(`用卦: ${tiYong.yong.properties.name}(${tiYong.yong.element})`);
    console.log(`关系: ${tiYong.relationship.relationship}`);
    console.log(`吉凶: ${tiYong.fortune.level} - ${tiYong.fortune.meaning}`);

    // 显示五行分析
    console.log('\n🌿 五行分析:');
    console.log(`体卦五行: ${tiYong.ti.element}`);
    console.log(`用卦五行: ${tiYong.yong.element}`);
    console.log(`生克关系: ${tiYong.relationship.meaning}`);

    // 显示互卦分析
    console.log('\n🔄 互卦分析:');
    const huAnalysis = result.huGuaAnalysis;
    console.log(`互卦体: ${huAnalysis.tiNature}`);
    console.log(`互卦用: ${huAnalysis.yongNature}`);

    // 显示综合解读
    console.log('\n📖 综合解读:');
    console.log(`当前状态: ${result.interpretation.basic.current.meaning}`);
    console.log(`结果走向: ${result.interpretation.basic.result.meaning}`);
    console.log(`过程分析: ${result.interpretation.basic.process.meaning}`);
    console.log(`\n💡 建议: ${result.interpretation.basic.current.advice}`);

    // 显示总结
    console.log(`\n📝 总结: ${result.interpretation.summary}`);
  }

  /**
   * 格式化爻线显示
   */
  formatLines(lines) {
    return lines.map(line => line === 1 ? '━━━' : '━ ━').join(' ');
  }

  /**
   * 显示系统信息
   */
  displaySystemInfo() {
    console.log('\n🔧 系统信息:');
    const systemInfo = this.algorithmManager.getSystemInfo();
    console.log(`系统名称: ${systemInfo.name}`);
    console.log(`版本: ${systemInfo.version}`);
    console.log(`描述: ${systemInfo.description}`);
    console.log('\n核心功能:');
    systemInfo.features.forEach(feature => {
      console.log(`  ✓ ${feature}`);
    });
  }

  /**
   * 演示特定算法功能
   */
  async demonstrateSpecificFeatures() {
    console.log('\n🔍 特定功能演示:\n');

    // 演示八卦系统
    console.log('1. 八卦系统演示:');
    const baguaInfo = this.algorithmManager.getBaguaInfo(1);
    console.log(`乾卦信息: ${baguaInfo.name} - ${baguaInfo.element} - ${baguaInfo.nature}`);

    // 演示五行关系
    console.log('\n2. 五行关系演示:');
    const relationship = this.algorithmManager.analyzeElementRelationship('金', '水');
    console.log(`金与水的关系: ${relationship.relationship} - ${relationship.meaning}`);

    // 演示输入验证
    console.log('\n3. 输入验证演示:');
    const validation = this.algorithmManager.validateDivinationRequest({
      question: '测试问题',
      options: { hour: 12 }
    });
    console.log(`验证结果: ${validation.isValid ? '通过' : '失败'}`);
    if (!validation.isValid) {
      console.log(`错误信息: ${validation.errors.join(', ')}`);
    }
  }
}

// 如果直接运行此文件，则执行演示
if (require.main === module) {
  const demo = new DivinationDemo();
  demo.runDemo()
    .then(() => demo.demonstrateSpecificFeatures())
    .catch(console.error);
}

module.exports = DivinationDemo;

