/**
 * 特定主卦的变卦和互卦计算
 * 主卦: [0,1,1,1,0,1] = [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
 */

const { MeihuaDivinationCore, BaguaSystem } = require('../index');
const { getCurrentTimeInfo } = require('../utils/timeUtils');

class SpecificCalculation {
  constructor() {
    this.divinationCore = new MeihuaDivinationCore();
    this.baguaSystem = new BaguaSystem();
  }

  /**
   * 计算指定主卦的变卦和互卦
   */
  calculateSpecificHexagram() {
    console.log('🔮 特定主卦计算演示\n');
    console.log('=' * 50);

    // 给定的主卦
    const primaryGua = [0, 1, 1, 1, 0, 1]; // [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
    
    console.log('📊 主卦分析:');
    this.displayHexagram(primaryGua, '主卦');
    
    // 分析主卦的外卦和内卦
    const outerGua = [primaryGua[5], primaryGua[4], primaryGua[3]]; // 外卦（第6、5、4爻）
    const innerGua = [primaryGua[2], primaryGua[1], primaryGua[0]]; // 内卦（第3、2、1爻）
    
    console.log('\n外卦（第6、5、4爻）:', outerGua);
    console.log('内卦（第3、2、1爻）:', innerGua);
    
    // 获取八卦信息
    const outerGuaNumber = this.baguaSystem.getBaguaNumber(outerGua);
    const innerGuaNumber = this.baguaSystem.getBaguaNumber(innerGua);
    const outerGuaInfo = this.baguaSystem.getBaguaProperties(outerGuaNumber);
    const innerGuaInfo = this.baguaSystem.getBaguaProperties(innerGuaNumber);
    
    console.log(`\n外卦: ${outerGuaInfo.name}(${outerGuaInfo.element}) - ${outerGuaInfo.nature}`);
    console.log(`内卦: ${innerGuaInfo.name}(${innerGuaInfo.element}) - ${innerGuaInfo.nature}`);
    
    // 计算动爻（使用当前北京时间）
    const currentTimeInfo = getCurrentTimeInfo();
    const hourNumber = currentTimeInfo.hourNumber;
    const total = outerGuaNumber + innerGuaNumber + hourNumber;
    const movingLine = (total % 6) || 6;
    
    console.log(`\n⚡ 动爻计算:`);
    console.log(`当前北京时间: ${currentTimeInfo.formattedTime}`);
    console.log(`当前时辰: ${currentTimeInfo.hourName} (${currentTimeInfo.hour}时)`);
    console.log(`外卦数字: ${outerGuaNumber}`);
    console.log(`内卦数字: ${innerGuaNumber}`);
    console.log(`时辰数字: ${hourNumber}`);
    console.log(`总和: ${total}`);
    console.log(`动爻: 第${movingLine}爻`);
    
    // 生成变卦
    console.log('\n🔄 变卦计算:');
    const bianGua = this.divinationCore.generateBianGua(primaryGua, movingLine);
    this.displayHexagram(bianGua, '变卦');
    this.showChanges(primaryGua, bianGua, movingLine);
    
    // 生成互卦
    console.log('\n🔄 互卦计算:');
    const huGua = this.divinationCore.generateHuGua(primaryGua);
    this.displayHexagram(huGua, '互卦');
    this.showHuGuaGeneration(primaryGua, huGua);
    
    // 分析变卦的外卦和内卦
    const bianOuterGua = [bianGua[5], bianGua[4], bianGua[3]]; // 变卦外卦
    const bianInnerGua = [bianGua[2], bianGua[1], bianGua[0]]; // 变卦内卦
    const bianOuterGuaNumber = this.baguaSystem.getBaguaNumber(bianOuterGua);
    const bianInnerGuaNumber = this.baguaSystem.getBaguaNumber(bianInnerGua);
    const bianOuterGuaInfo = this.baguaSystem.getBaguaProperties(bianOuterGuaNumber);
    const bianInnerGuaInfo = this.baguaSystem.getBaguaProperties(bianInnerGuaNumber);
    
    console.log(`\n变卦外卦: ${bianOuterGuaInfo.name}(${bianOuterGuaInfo.element}) - ${bianOuterGuaInfo.nature}`);
    console.log(`变卦内卦: ${bianInnerGuaInfo.name}(${bianInnerGuaInfo.element}) - ${bianInnerGuaInfo.nature}`);
    
    // 分析互卦的外卦和内卦
    const huOuterGua = [huGua[5], huGua[4], huGua[3]]; // 互卦外卦
    const huInnerGua = [huGua[2], huGua[1], huGua[0]]; // 互卦内卦
    const huOuterGuaNumber = this.baguaSystem.getBaguaNumber(huOuterGua);
    const huInnerGuaNumber = this.baguaSystem.getBaguaNumber(huInnerGua);
    const huOuterGuaInfo = this.baguaSystem.getBaguaProperties(huOuterGuaNumber);
    const huInnerGuaInfo = this.baguaSystem.getBaguaProperties(huInnerGuaNumber);
    
    console.log(`\n互卦外卦: ${huOuterGuaInfo.name}(${huOuterGuaInfo.element}) - ${huOuterGuaInfo.nature}`);
    console.log(`互卦内卦: ${huInnerGuaInfo.name}(${huInnerGuaInfo.element}) - ${huInnerGuaInfo.nature}`);
    
    // 确定体用关系
    console.log('\n⚖️ 体用关系分析:');
    const tiYong = this.divinationCore.determineTiYong(movingLine, primaryGua);
    console.log(`动爻位置: 第${movingLine}爻`);
    console.log(`体卦: ${tiYong.tiIsOuter ? '外卦' : '内卦'}`);
    console.log(`用卦: ${tiYong.tiIsOuter ? '内卦' : '外卦'}`);
    
    return {
      primaryGua,
      bianGua,
      huGua,
      movingLine,
      outerGuaInfo,
      innerGuaInfo,
      bianOuterGuaInfo,
      bianInnerGuaInfo,
      huOuterGuaInfo,
      huInnerGuaInfo,
      tiYong
    };
  }

  /**
   * 显示卦象
   */
  displayHexagram(hexagram, name) {
    console.log(`\n${name}: [${hexagram.join(', ')}]`);
    console.log('爻位显示:');
    for (let i = 0; i < hexagram.length; i++) {
      const yaoPosition = i + 1;
      const yaoValue = hexagram[i] === 1 ? '━━━' : '━ ━';
      console.log(`  第${yaoPosition}爻: ${yaoValue}`);
    }
  }

  /**
   * 显示变卦的变化
   */
  showChanges(primaryGua, bianGua, movingLine) {
    console.log('\n变化详情:');
    for (let i = 0; i < primaryGua.length; i++) {
      const yaoPosition = i + 1;
      const originalValue = primaryGua[i];
      const newValue = bianGua[i];
      const changed = originalValue !== newValue;
      
      if (changed) {
        console.log(`  第${yaoPosition}爻: ${originalValue} → ${newValue} (动爻变化)`);
      } else {
        console.log(`  第${yaoPosition}爻: ${originalValue} → ${newValue} (不变)`);
      }
    }
  }

  /**
   * 显示互卦生成过程
   */
  showHuGuaGeneration(primaryGua, huGua) {
    console.log('\n互卦生成过程（234345顺序）:');
    const positions = [1, 2, 3, 2, 3, 4]; // 第2、3、4、3、4、5爻
    for (let i = 0; i < huGua.length; i++) {
      const sourcePosition = positions[i];
      const sourceIndex = sourcePosition - 1;
      const targetPosition = i + 1;
      console.log(`  互卦第${targetPosition}爻 = 主卦第${sourcePosition}爻 = ${primaryGua[sourceIndex]}`);
    }
  }
}

// 如果直接运行此文件，则执行计算
if (require.main === module) {
  const calculator = new SpecificCalculation();
  calculator.calculateSpecificHexagram();
}

module.exports = SpecificCalculation;
