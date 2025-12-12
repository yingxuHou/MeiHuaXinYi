// 调试前端数据接收问题

// 模拟 API 响应数据（基于后端实际返回的格式）
const mockAPIResponse = {
  success: true,
  data: {
    id: 'dev_' + Date.now(),
    question: '我的事业发展如何？',
    timestamp: new Date(),
    hexagrams: {
      ben: {
        id: 1,
        name: '乾为天',
        lines: [1, 1, 1, 1, 1, 1],  // 主卦：全是阳爻
        info: { name: '乾为天' }
      },
      hu: {
        id: 2,
        name: '坤为地',
        lines: [0, 0, 0, 0, 0, 0],  // 互卦：全是阴爻
        info: { name: '坤为地' }
      },
      bian: {
        id: 43,
        name: '泽天夬',
        lines: [0, 1, 1, 1, 1, 1],  // 变卦：只有第一爻是阴爻
        info: { name: '泽天夬' }
      }
    },
    movingLine: 1,  // 动爻在第1位
    hexagram: {
      name: '乾为天',
      number: 1,
      lines: [
        { position: 6, type: 'yang', changing: false },
        { position: 5, type: 'yang', changing: false },
        { position: 4, type: 'yang', changing: false },
        { position: 3, type: 'yang', changing: false },
        { position: 2, type: 'yang', changing: false },
        { position: 1, type: 'yang', changing: true }  // 动爻
      ]
    }
  }
};

// 模拟 dataAdapter.adaptDivinationResult 的行为
function adaptDivinationResult(apiData) {
  console.log('🔍 接收到的原始数据:');
  console.log('主卦 lines:', apiData.hexagrams?.ben?.lines);
  console.log('变卦 lines:', apiData.hexagrams?.bian?.lines);
  console.log('动爻位置:', apiData.movingLine);

  // 前端适配器处理
  const adaptedData = {
    id: apiData.id,
    question: apiData.question,
    hexagrams: apiData.hexagrams,
    movingLine: apiData.movingLine,
    // 兼容性字段
    hexagram: {
      name: apiData.hexagrams?.ben?.name || '未知',
      number: apiData.hexagrams?.ben?.id || 0,
      lines: apiData.hexagram?.lines?.map(l => l.type === 'yang' ? 1 : 0) || []
    }
  };

  console.log('\n📦 适配后的数据:');
  console.log('hexagrams.ben.lines:', adaptedData.hexagrams?.ben?.lines);
  console.log('hexagram.lines (兼容):', adaptedData.hexagram?.lines);

  return adaptedData;
}

// 测试前端显示逻辑
function testFrontendDisplay(result) {
  console.log('\n🎨 前端显示逻辑测试:');
  console.log('================');

  // 主卦显示逻辑（来自 DivinationResult.vue）
  const mainHexagramDisplay = result.hexagrams?.ben?.lines ||
    result.hexagram?.lines?.map(l => l.type === 'yang' ? 1 : 0) ||
    [1,1,1,1,1,1];

  // 变卦显示逻辑
  const changedHexagramDisplay = result.hexagrams?.bian?.lines || [];

  console.log('主卦显示:', mainHexagramDisplay);
  console.log('变卦显示:', changedHexagramDisplay);
  console.log('动爻位置:', result.movingLine);

  // 验证显示
  let differences = 0;
  for (let i = 0; i < 6; i++) {
    if (mainHexagramDisplay[i] !== changedHexagramDisplay[i]) {
      differences++;
    }
  }

  console.log('\n📊 验证结果:');
  console.log('差异数量:', differences);

  if (differences === 1) {
    console.log('✅ 显示正常：只有动爻发生变化');
  } else {
    console.log('❌ 显示异常：期望只有1个爻变化，实际有', differences, '个');
  }
}

// 运行测试
console.log('🔍 调试前端数据接收和显示问题');
console.log('=====================================\n');

const adaptedResult = adaptDivinationResult(mockAPIResponse.data);
testFrontendDisplay(adaptedResult);

console.log('\n💡 问题分析:');
console.log('============');
console.log('1. 如果 hexagrams.ben.lines 存在，使用它');
console.log('2. 如果不存在，尝试使用 hexagram.lines');
console.log('3. 如果都不存在，使用默认的 [1,1,1,1,1,1]');
console.log('\n可能的问题：');
console.log('- 后端返回的数据结构可能不一致');
console.log('- 前端适配器可能没有正确处理数据');