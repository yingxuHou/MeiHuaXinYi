const axios = require('axios');
const algorithmManager = require('./backend/src/algorithms').algorithmManager;

async function debugDivinationAPI() {
  console.log('🔍 开始调试占卜API...\n');

  // 1. 测试算法管理器
  console.log('1. 测试算法管理器:');
  try {
    const result = await algorithmManager.performDivination('我最近的工作发展如何？', {
      method: 'time',
      params: {
        datetime: '2025-12-16T07:53:10Z'
      }
    });
    console.log('✅ 算法管理器测试成功');
    console.log('主卦:', result.hexagrams?.ben?.name);
  } catch (error) {
    console.error('❌ 算法管理器测试失败:', error.message);
  }

  // 2. 测试验证器
  console.log('\n2. 测试验证器:');
  try {
    const { DivinationValidator } = require('./backend/src/algorithms');
    const validator = new DivinationValidator();
    const validation = validator.validateDivinationRequest({
      question: '我最近的工作发展如何？',
      options: {
        method: 'time'
      }
    });
    console.log('✅ 验证器测试结果:', validation.isValid ? '通过' : '失败');
    if (!validation.isValid) {
      console.log('错误:', validation.errors);
    }
  } catch (error) {
    console.error('❌ 验证器测试失败:', error.message);
  }

  // 3. 测试本地API（跳过认证测试）
  console.log('\n3. 测试本地API端点（仅测试连通性）:');
  try {
    const response = await axios.get('http://localhost:8080/api/user/status');
    console.log('✅ 本地API服务器运行正常');
    console.log('状态码:', response.status);
  } catch (error) {
    console.error('❌ 本地API服务器连接失败:');
    if (error.code === 'ECONNREFUSED') {
      console.log('本地服务器未运行，请先启动服务器');
    } else {
      console.log('错误:', error.message);
    }
  }
}

debugDivinationAPI().catch(console.error);