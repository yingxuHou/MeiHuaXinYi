/**
 * 测试占卜API修复效果
 */

// 模拟后端 dev-perform 端点的行为
const MeihuaDivinationCore = require('./backend/src/algorithms/core/meihuaDivinationCore');

async function simulateDevPerform(question) {
  console.log('🔮 模拟后端 dev-perform 端点...\n');

  const core = new MeihuaDivinationCore();

  try {
    // 直接调用核心算法（模拟 dev-perform 端点的行为）
    const result = await core.performDivination(question);

    // 模拟 dev-perform 端点的响应格式
    const response = {
      success: true,
      data: {
        ...result,
        id: 'dev_' + Date.now(),
        userId: 'test-user',
        createdAt: new Date(),
        userRating: null,
        metadata: {
          ...result.metadata,
          isDev: true,
          note: '开发模式，数据未保存到数据库'
        }
      }
    };

    return response;
  } catch (error) {
    console.error('❌ 模拟失败:', error);
    throw error;
  }
}

async function testMultipleDivinations() {
  console.log('🧪 测试多次占卜，验证变卦计算...\n');

  const questions = [
    '我的事业发展如何？',
    '感情生活顺利吗？',
    '健康运势怎么样？',
    '财运何时好转？',
    '学业能否成功？'
  ];

  for (let i = 0; i < questions.length; i++) {
    console.log(`\n📿 第${i + 1}次占卜: ${questions[i]}`);
    console.log('─'.repeat(50));

    try {
      const response = await simulateDevPerform(questions[i]);
      const { hexagrams, movingLine } = response.data;

      console.log('主卦:', hexagrams.ben.lines);
      console.log('动爻:', movingLine);
      console.log('变卦:', hexagrams.bian.lines);

      // 验证变卦
      const benLines = hexagrams.ben.lines;
      const bianLines = hexagrams.bian.lines;

      let changedCount = 0;
      let changedPositions = [];
      for (let j = 0; j < 6; j++) {
        if (benLines[j] !== bianLines[j]) {
          changedCount++;
          changedPositions.push(j + 1);
        }
      }

      if (changedCount === 1 && changedPositions[0] === movingLine) {
        console.log('✅ 变卦计算正确！');
      } else {
        console.log('❌ 变卦计算错误！');
        console.log(`预期: 只有第${movingLine}爻变化`);
        console.log(`实际: ${changedCount}个爻变化 (${changedPositions.join(', ')})`);
      }

    } catch (error) {
      console.error('❌ 占卜失败:', error.message);
    }
  }

  console.log('\n✨ 测试完成！');
}

// 运行测试
testMultipleDivinations();