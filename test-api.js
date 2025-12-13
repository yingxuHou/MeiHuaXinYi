/**
 * 直接测试后端API的参数验证
 */

const axios = require('axios');

// 模拟认证token（需要从后端获取有效的token）
async function getAuthToken() {
  try {
    // 尝试使用测试用户登录
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'test@example.com',
      password: '123456'
    });

    if (response.data.success) {
      return response.data.data.token;
    } else {
      // 登录失败，尝试注册新用户
      const registerResponse = await axios.post('http://localhost:8080/api/auth/register', {
        email: 'test@example.com',
        password: '123456',
        username: 'testuser'
      });

      if (registerResponse.data.success) {
        return registerResponse.data.data.token;
      }
    }
  } catch (error) {
    console.log('⚠️ 无法获取认证token，将使用测试模式');
    return null;
  }
}

async function testDivinationAPI() {
  console.log('🧪 开始测试占卜API...\n');

  const baseURL = 'http://localhost:8080/api';

  // 测试数据
  const testData = {
    question: '我最近的工作发展如何？',
    method: 'time',
    params: {
      datetime: '2025-12-13T14:30:00Z'
    }
  };

  console.log('📋 测试数据:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试1：无认证的测试接口
  console.log('🔧 测试1: 无认证的测试接口 (/api/divination/test)');
  try {
    const response = await axios.post(`${baseURL}/divination/test`, testData);
    console.log('✅ 成功:', response.status);
    console.log('📊 响应:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ 失败:', error.response?.status);
    console.log('🔍 错误:', error.response?.data);
  }
  console.log('\n' + '='.repeat(50) + '\n');

  // 获取认证token
  const token = await getAuthToken();

  if (token) {
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 测试2：开发环境接口（需要认证）
    console.log('🔧 测试2: 开发环境接口 (/api/divination/dev-perform)');
    try {
      const response = await axios.post(`${baseURL}/divination/dev-perform`, testData, {
        headers: authHeaders
      });
      console.log('✅ 成功:', response.status);
      console.log('📊 响应:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ 失败:', error.response?.status);
      console.log('🔍 错误:', error.response?.data);
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // 测试3：生产环境接口（需要认证）
    console.log('🔧 测试3: 生产环境接口 (/api/divination/perform)');
    try {
      const response = await axios.post(`${baseURL}/divination/perform`, testData, {
        headers: authHeaders
      });
      console.log('✅ 成功:', response.status);
      console.log('📊 响应:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ 失败:', error.response?.status);
      console.log('🔍 错误:', error.response?.data);
    }
    console.log('\n' + '='.repeat(50) + '\n');

  } else {
    console.log('⚠️ 无法获取认证token，跳过需要认证的测试');
  }

  // 测试4：测试错误的参数格式
  console.log('🔧 测试4: 错误参数格式测试');
  const invalidData = {
    question: '',  // 空问题
    method: 'invalid',  // 无效方法
    params: 'not an object'  // 非对象参数
  };

  try {
    const response = await axios.post(`${baseURL}/divination/test`, invalidData);
    console.log('❌ 意外成功:', response.status);
    console.log('📊 响应:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('✅ 正确拒绝:', error.response?.status);
    console.log('🔍 验证错误:', error.response?.data);
  }

  console.log('\n🎯 API测试完成！');
}

// 运行测试
testDivinationAPI().catch(console.error);