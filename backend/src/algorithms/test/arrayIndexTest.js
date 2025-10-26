/**
 * 数组索引与爻位对应关系测试
 * 验证修改后的算法是否符合用户要求
 */

const { MeihuaDivinationCore } = require('../index');

class ArrayIndexTest {
  constructor() {
    this.divinationCore = new MeihuaDivinationCore();
  }

  /**
   * 运行测试
   */
  runTest() {
    console.log('🔍 数组索引与爻位对应关系测试\n');
    console.log('=' * 50);

    // 测试主卦生成
    this.testPrimaryHexagramGeneration();
    
    // 测试互卦生成
    this.testHuGuaGeneration();
    
    // 测试变卦生成
    this.testBianGuaGeneration();
    
    // 测试体用关系
    this.testTiYongRelationship();
  }

  /**
   * 测试主卦生成
   */
  testPrimaryHexagramGeneration() {
    console.log('\n📊 测试主卦生成:');
    
    // 生成一个固定的主卦用于测试
    const primaryGua = [1, 0, 1, 0, 1, 0]; // [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
    
    console.log('主卦数组:', primaryGua);
    console.log('数组索引对应关系:');
    for (let i = 0; i < primaryGua.length; i++) {
      const yaoPosition = i + 1;
      const yaoValue = primaryGua[i] === 1 ? '阳爻(━━━)' : '阴爻(━ ━)';
      console.log(`  数组[${i}] = 第${yaoPosition}爻 = ${yaoValue}`);
    }
    
    // 分析外卦和内卦
    const outerGua = [primaryGua[5], primaryGua[4], primaryGua[3]]; // 外卦（第6、5、4爻）
    const innerGua = [primaryGua[2], primaryGua[1], primaryGua[0]]; // 内卦（第3、2、1爻）
    
    console.log('\n外卦（第6、5、4爻）:', outerGua);
    console.log('内卦（第3、2、1爻）:', innerGua);
  }

  /**
   * 测试互卦生成
   */
  testHuGuaGeneration() {
    console.log('\n🔄 测试互卦生成:');
    
    const primaryGua = [1, 0, 1, 0, 1, 0]; // [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
    const huGua = this.divinationCore.generateHuGua(primaryGua);
    
    console.log('主卦:', primaryGua);
    console.log('互卦:', huGua);
    console.log('\n互卦生成规则（234345顺序）:');
    console.log(`  互卦[0] = 主卦[1] = 第2爻 = ${primaryGua[1]}`);
    console.log(`  互卦[1] = 主卦[2] = 第3爻 = ${primaryGua[2]}`);
    console.log(`  互卦[2] = 主卦[3] = 第4爻 = ${primaryGua[3]}`);
    console.log(`  互卦[3] = 主卦[2] = 第3爻 = ${primaryGua[2]}`);
    console.log(`  互卦[4] = 主卦[3] = 第4爻 = ${primaryGua[3]}`);
    console.log(`  互卦[5] = 主卦[4] = 第5爻 = ${primaryGua[4]}`);
    
    console.log('\n互卦数组索引对应关系:');
    for (let i = 0; i < huGua.length; i++) {
      const yaoPosition = i + 1;
      const yaoValue = huGua[i] === 1 ? '阳爻(━━━)' : '阴爻(━ ━)';
      console.log(`  互卦[${i}] = 第${yaoPosition}爻 = ${yaoValue}`);
    }
  }

  /**
   * 测试变卦生成
   */
  testBianGuaGeneration() {
    console.log('\n⚡ 测试变卦生成:');
    
    const primaryGua = [1, 0, 1, 0, 1, 0]; // [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
    const movingLine = 3; // 第3爻动
    
    console.log('主卦:', primaryGua);
    console.log(`动爻: 第${movingLine}爻`);
    
    const bianGua = this.divinationCore.generateBianGua(primaryGua, movingLine);
    
    console.log('变卦:', bianGua);
    console.log('\n变卦生成规则:');
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
   * 测试体用关系
   */
  testTiYongRelationship() {
    console.log('\n⚖️ 测试体用关系:');
    
    const primaryGua = [1, 0, 1, 0, 1, 0]; // [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
    
    // 测试内卦动的情况
    console.log('\n情况1: 内卦动（第2爻动）');
    const movingLine1 = 2;
    const tiYong1 = this.divinationCore.determineTiYong(movingLine1, primaryGua);
    console.log(`动爻: 第${movingLine1}爻`);
    console.log(`体卦: 外卦（第6、5、4爻） = [${tiYong1.ti.join(', ')}]`);
    console.log(`用卦: 内卦（第3、2、1爻） = [${tiYong1.yong.join(', ')}]`);
    console.log(`体用关系: 内卦动，外卦为体，内卦为用`);
    
    // 测试外卦动的情况
    console.log('\n情况2: 外卦动（第5爻动）');
    const movingLine2 = 5;
    const tiYong2 = this.divinationCore.determineTiYong(movingLine2, primaryGua);
    console.log(`动爻: 第${movingLine2}爻`);
    console.log(`体卦: 内卦（第3、2、1爻） = [${tiYong2.ti.join(', ')}]`);
    console.log(`用卦: 外卦（第6、5、4爻） = [${tiYong2.yong.join(', ')}]`);
    console.log(`体用关系: 外卦动，内卦为体，外卦为用`);
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  const test = new ArrayIndexTest();
  test.runTest();
}

module.exports = ArrayIndexTest;

