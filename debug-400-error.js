/**
 * 调试400错误的根本原因
 * 验证前端请求路径与后端路由的匹配问题
 */

const axios = require('axios');

// 配置
const API_BASE_URL = 'http://localhost:3000/api';

// 模拟前端请求的数据
const testDivinationData = {
  question: '测试占卜问题',
  method: 'time',
  params: {
    datetime: '2025-12-15T08:44:35Z'
  }
};

// 模拟开发token（从auth.js中看到的格式）
const devToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZXYtdXNlci0xMjM0NTY3ODkwIiwiZW1haWwiOiJkZXZAdGVzdC5jb20iLCJ0eXBlIjoiYWNjZXNzIiwiaXNEZXYiOnRydWUsImlhdCI6MTczNDM0NDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.dev-signature-12345';

async function testEndpoints() {
  console.log('🔍 开始调试400错误...\n');

  // 测试1: /divination/dev-perform (前端实际请求的路径)
  console.log('📡 测试1: POST /divination/dev-perform (前端实际请求)');
  try {
    const response1 = await axios.post(`${API_BASE_URL}/divination/dev-perform`, testDivinationData, {
      headers: {
        'Authorization': `Bearer ${devToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ /dev-perform 成功:', response1.status, response1.data.success ? '成功' : '失败');
  } catch (error1) {
    console.log('❌ /dev-perform 失败:', error1.response?.status, error1.response?.data?.message || error1.message);
    if (error1.response?.status === 400) {
      console.log('🔍 400错误详情:', JSON.stringify(error1.response.data, null, 2));
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试2: /divination/perform (后端实际存在的路径)
  console.log('📡 测试2: POST /divination/perform (后端实际存在)');
  try {
    const response2 = await axios.post(`${API_BASE_URL}/divination/perform`, testDivinationData, {
      headers: {
        'Authorization': `Bearer ${devToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ /perform 成功:', response2.status, response2.data.success ? '成功' : '失败');
  } catch (error2) {
    console.log('❌ /perform 失败:', error2.response?.status, error2.response?.data?.message || error2.message);
    if (error2.response?.status === 400) {
      console.log('🔍 400错误详情:', JSON.stringify(error2.response.data, null, 2));
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试3: /divination/dev-perform 无token (验证认证问题)
  console.log('📡 测试3: POST /divination/dev-perform 无认证token');
  try {
    const response3 = await axios.post(`${API_BASE_URL}/divination/dev-perform`, testDivinationData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ /dev-perform 无token 成功:', response3.status, response3.data.success ? '成功' : '失败');
  } catch (error3) {
    console.log('❌ /dev-perform 无token 失败:', error3.response?.status, error3.response?.data?.message || error3.message);
    if (error3.response?.status === 401) {
      console.log('🔍 认证失败详情:', JSON.stringify(error3.response.data, null, 2));
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试4: /divination/test (无需认证的测试接口)
  console.log('📡 测试4: POST /divination/test (无需认证)');
  try {
    const response4 = await axios.post(`${API_BASE_URL}/divination/test`, testDivinationData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ /test 成功:', response4.status, response4.data.success ? '成功' : '失败');
  } catch (error4) {
    console.log('❌ /test 失败:', error4.response?.status, error4.response?.data?.message || error4.message);
    if (error4.response?.status === 400) {
      console.log('🔍 400错误详情:', JSON.stringify(error4.response.data, null, 2));
    }
  }

  console.log('\n🎯 调试结论:');
  console.log('1. 如果测试1失败且测试2成功 → 路径不匹配问题');
  console.log('2. 如果测试1和测试2都400 → 验证规则问题');
  console.log('3. 如果测试1是401而测试2是400 → 认证+验证双重问题');
  console.log('4. 如果测试4成功而测试1失败 → 认证中间件问题');
}

// 运行测试
testEndpoints().catch(console.error);