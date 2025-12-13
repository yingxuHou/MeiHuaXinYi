/**
 * 测试真实的占卜API（需要认证）
 */

const axios = require('axios');

async function testRealDivinationAPI() {
  console.log('🧪 测试真实的占卜API...\n');

  const baseURL = 'http://localhost:8080/api';

  // 先注册一个测试用户
  console.log('📝 步骤1: 注册测试用户');
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: '123456',
    username: `testuser${Date.now()}`
  };

  try {
    const registerResponse = await axios.post(`${baseURL}/auth/register`, testUser);
    console.log('✅ 注册成功:', registerResponse.data.success);

    const token = registerResponse.data.data.token;
    console.log('✅ 获取token成功');

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 测试数据 - 现在不包含location字段
    const testData = {
      question: '我最近的工作发展如何？',
      method: 'time'
    };

    console.log('\n📋 测试数据:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');

    // 测试开发环境接口
    console.log('🔧 测试: 开发环境接口 (/api/divination/dev-perform)');
    try {
      const response = await axios.post(`${baseURL}/divination/dev-perform`, testData, {
        headers: authHeaders
      });

      console.log('✅ 成功:', response.status);
      console.log('📊 返回数据结构:');
      console.log('- ID:', response.data.data.id ? '✅' : '❌');
      console.log('- 问题:', response.data.data.question ? '✅' : '❌');
      console.log('- 时间戳:', response.data.data.timestamp ? '✅' : '❌');
      console.log('- 卦象:', response.data.data.hexagrams ? '✅' : '❌');
      console.log('- 解读:', response.data.data.interpretation ? '✅' : '❌');

      if (response.data.success) {
        console.log('\n🎉 API调用成功！400错误已修复！');
        console.log('\n📄 完整响应数据:');
        console.log(JSON.stringify(response.data, null, 2));
      }

    } catch (error) {
      console.log('❌ 失败:', error.response?.status);
      console.log('🔍 错误详情:');
      console.log(JSON.stringify(error.response?.data, null, 2));

      if (error.response?.data?.errors) {
        console.log('\n🚨 验证错误详情:');
        error.response.data.errors.forEach(err => {
          console.log(`- ${err.path}: ${err.msg}`);
        });
      }
    }

  } catch (error) {
    console.log('❌ 注册失败:', error.response?.data);
  }

  console.log('\n🎯 测试完成！');
}

// 运行测试
testRealDivinationAPI().catch(console.error);