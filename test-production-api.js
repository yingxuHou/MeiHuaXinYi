/**
 * 测试生产环境占卜API
 */

const axios = require('axios');

async function testProductionAPI() {
  console.log('🔍 测试生产环境占卜API...\n');

  const baseURL = 'https://meihua-api.zeabur.app/api/divination';

  // 测试1: 检查修复状态
  console.log('1. 测试修复状态端点:');
  try {
    const response = await axios.get(`${baseURL}/test-fix`);
    console.log('✅ 成功:', response.data.message);
    console.log('版本:', response.data.version);
    console.log('功能:', response.data.features);
  } catch (error) {
    console.error('❌ 失败:', error.response?.data || error.message);
  }

  // 测试2: 测试占卜算法
  console.log('\n2. 测试占卜算法端点:');
  try {
    const response = await axios.get(`${baseURL}/test-divination`);
    console.log('✅ 成功:', response.data.message);
    console.log('占卜结果:', response.data.result);
  } catch (error) {
    console.error('❌ 失败:', error.response?.data || error.message);
  }

  // 测试3: 测试完整占卜流程
  console.log('\n3. 测试完整占卜流程:');
  try {
    const response = await axios.post(`${baseURL}/test-perform`, {
      question: '我最近的工作发展如何？',
      method: 'time',
      params: {
        datetime: new Date().toISOString()
      }
    });
    console.log('✅ 成功:', response.data.message);
    if (response.data.data) {
      console.log('占卜结果ID:', response.data.data.id);
      console.log('主卦:', response.data.data.hexagrams?.ben?.name);
      console.log('动爻:', response.data.data.movingLine);
    }
  } catch (error) {
    console.error('❌ 失败:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('错误详情:', error.response.data.error);
    }
  }
}

testProductionAPI().catch(console.error);