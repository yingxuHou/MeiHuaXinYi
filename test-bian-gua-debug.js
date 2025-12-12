/**
 * 调试变卦全翻转问题
 */

const MeihuaDivinationCore = require('./backend/src/algorithms/core/meihuaDivinationCore');

async function testDivination() {
  console.log('🔮 测试梅花心易算法...\n');

  const core = new MeihuaDivinationCore();

  // 模拟一个完整的占卜过程
  const question = '测试问题';

  try {
    const result = await core.performDivination(question);

    console.log('📊 占卜结果:');
    console.log('问题:', result.question);
    console.log('动爻:', result.movingLine);
    console.log('\n🔹 主卦:', result.hexagrams.ben.lines);
    console.log('🔹 变卦:', result.hexagrams.bian.lines);
    console.log('🔹 互卦:', result.hexagrams.hu.lines);

    // 验证变卦是否正确
    const benLines = result.hexagrams.ben.lines;
    const bianLines = result.hexagrams.bian.lines;
    const movingLine = result.movingLine;

    console.log('\n🔍 验证变卦计算:');
    console.log('动爻位置:', movingLine);
    console.log(`主卦第${movingLine}爻:`, benLines[movingLine - 1]);
    console.log(`变卦第${movingLine}爻:`, bianLines[movingLine - 1]);

    // 检查有几个爻发生了变化
    let changedCount = 0;
    let changedPositions = [];
    for (let i = 0; i < 6; i++) {
      if (benLines[i] !== bianLines[i]) {
        changedCount++;
        changedPositions.push(i + 1);
      }
    }

    console.log('\n📈 变化分析:');
    console.log('变化的爻数:', changedCount);
    console.log('变化的位置:', changedPositions);

    if (changedCount === 1 && changedPositions[0] === movingLine) {
      console.log('✅ 变卦计算正确！');
    } else {
      console.log('❌ 变卦计算错误！');
      console.log('预期: 只有第' + movingLine + '爻应该变化');
      console.log('实际: ' + changedCount + '个爻发生了变化');
    }

    // 检查是否是全翻转（6个爻都变化）
    if (changedCount === 6) {
      console.log('\n🚨 检测到全翻转问题！所有爻都被翻转了');
      console.log('这可能是因为某个地方执行了: bit => 1 - bit');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testDivination();