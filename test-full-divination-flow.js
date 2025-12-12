/**
 * 测试完整的占卜流程
 * 模拟前端 -> 后端 -> 前端的完整数据流
 */

const axios = require('axios');

// 后端 API 地址（开发环境）
const API_BASE_URL = 'http://localhost:8080/api';

// 测试用的请求头
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer mock-token-for-testing'  // 使用模拟 token
};

async function testFullDivinationFlow() {
  console.log('🔮 测试完整的占卜流程');
  console.log('========================\n');

  try {
    // 1. 准备请求数据
    const requestData = {
      question: '测试占卜：我的运势如何？',
      method: 'time',
      params: {
        datetime: new Date().toISOString()
      }
    };

    console.log('📤 发送请求:');
    console.log('问题:', requestData.question);
    console.log('方法:', requestData.method);
    console.log('参数:', requestData.params);

    // 2. 调用后端 API
    console.log('\n🔄 调用后端 API...');
    console.log('URL:', `${API_BASE_URL}/divination/test`);

    const response = await axios.post(`${API_BASE_URL}/divination/test`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('\n✅ API 响应成功');
    console.log('状态码:', response.status);

    // 3. 分析响应数据
    const result = response.data.data;
    console.log('\n📊 响应数据分析:');
    console.log('================');

    // 检查主卦
    if (result.hexagrams?.ben?.lines) {
      console.log('\n✅ 主卦 (ben):');
      console.log('  爻位:', result.hexagrams.ben.lines);
      console.log('  名称:', result.hexagrams.ben.name);
      console.log('  ID:', result.hexagrams.ben.id);
    } else {
      console.log('\n❌ 主卦数据缺失!');
    }

    // 检查变卦
    if (result.hexagrams?.bian?.lines) {
      console.log('\n✅ 变卦 (bian):');
      console.log('  爻位:', result.hexagrams.bian.lines);
      console.log('  名称:', result.hexagrams.bian.name);
      console.log('  ID:', result.hexagrams.bian.id);
    } else {
      console.log('\n❌ 变卦数据缺失!');
    }

    // 检查动爻
    console.log('\n✅ 动爻信息:');
    console.log('  位置:', result.movingLine);

    // 4. 验证变卦逻辑
    if (result.hexagrams?.ben?.lines && result.hexagrams?.bian?.lines) {
      console.log('\n🔍 验证变卦逻辑:');
      console.log('================');

      const benLines = result.hexagrams.ben.lines;
      const bianLines = result.hexagrams.bian.lines;
      const movingLine = result.movingLine;

      console.log('爻位对比:');
      console.log('  1 2 3 4 5 6');
      console.log('主卦:', benLines.join(' '));
      console.log('变卦:', bianLines.join(' '));

      // 标记不同的爻
      const diffMarks = benLines.map((v, i) => {
        if (v !== bianLines[i]) {
          return v === 1 ? '↓' : '↑';  // 阳变阴或阴变阳
        }
        return '=';
      });
      console.log('变化:', diffMarks.join(' '));

      // 计算差异数
      let differences = 0;
      let changedPositions = [];
      for (let i = 0; i < 6; i++) {
        if (benLines[i] !== bianLines[i]) {
          differences++;
          changedPositions.push(i + 1);
        }
      }

      console.log('\n📊 验证结果:');
      console.log('  差异数量:', differences);
      console.log('  变化位置:', changedPositions.join(', '));
      console.log('  动爻位置:', movingLine);

      if (differences === 1 && changedPositions[0] === movingLine) {
        console.log('\n✅ 验证通过: 变卦计算正确！');
      } else {
        console.log('\n❌ 验证失败: 变卦逻辑错误！');
        console.log('  期望: 只有第', movingLine, '爻变化');
        console.log('  实际:', differences, '个爻变化');

        if (differences === 6) {
          console.log('  ⚠️ 警告: 所有爻都变化了！这是导致看到纯乾变纯坤的原因');
        }
      }
    }

    // 5. 测试前端适配
    console.log('\n🎨 模拟前端数据适配:');
    console.log('====================');

    // 使用前端 dataAdapter 的逻辑
    const adaptedData = {
      hexagrams: result.hexagrams,
      movingLine: result.movingLine,
      // 兼容性字段
      hexagram: {
        name: result.hexagrams?.ben?.name || '未知',
        number: result.hexagrams?.ben?.id || 0,
        lines: result.hexagram?.lines?.map(l => l.type === 'yang' ? 1 : 0) || []
      }
    };

    // 前端显示逻辑
    const mainHexagramDisplay = adaptedData.hexagrams?.ben?.lines ||
      adaptedData.hexagram?.lines?.map(l => l.type === 'yang' ? 1 : 0) ||
      [1,1,1,1,1,1];

    console.log('主卦显示:', mainHexagramDisplay);
    console.log('变卦显示:', adaptedData.hexagrams?.bian?.lines || []);

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);

    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testFullDivinationFlow();