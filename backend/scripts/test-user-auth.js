/**
 * 梅花心易 - 用户认证测试脚本
 * 测试用户注册和登录功能
 */

const axios = require('axios');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// 测试数据
const testUser = {
  username: 'testuser_' + Date.now(),
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!'
};

/**
 * 测试用户注册
 */
async function testRegister() {
  console.log('\n📝 测试用户注册...');
  console.log('测试用户:', testUser.username);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, {
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
      profile: {
        nickname: '测试用户',
        gender: 'male'
      }
    });

    if (response.data.success) {
      console.log('✅ 注册成功!');
      console.log('用户ID:', response.data.data.user.id);
      console.log('Token:', response.data.data.tokens.accessToken.substring(0, 50) + '...');
      
      // 保存访问令牌
      testUser.accessToken = response.data.data.tokens.accessToken;
      return true;
    } else {
      console.error('❌ 注册失败:', response.data.error.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 注册错误:', error.response?.data?.error?.message || error.message);
    return false;
  }
}

/**
 * 测试用户登录（正确密码）
 */
async function testLoginSuccess() {
  console.log('\n🔐 测试用户登录（正确密码）...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: testUser.email,
      password: testUser.password
    });

    if (response.data.success) {
      console.log('✅ 登录成功!');
      console.log('用户ID:', response.data.data.user.id);
      console.log('用户名:', response.data.data.user.username);
      console.log('邮箱:', response.data.data.user.email);
      console.log('VIP状态:', response.data.data.user.isVIP ? '是' : '否');
      console.log('免费次数:', response.data.data.user.divination.freeCount);
      
      // 保存新的访问令牌
      testUser.accessToken = response.data.data.tokens.accessToken;
      return true;
    } else {
      console.error('❌ 登录失败:', response.data.error.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 登录错误:', error.response?.data?.error?.message || error.message);
    return false;
  }
}

/**
 * 测试用户登录（错误密码）
 */
async function testLoginFailure() {
  console.log('\n🚫 测试用户登录（错误密码）...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: testUser.email,
      password: 'WrongPassword123!'
    });

    if (!response.data.success) {
      console.log('✅ 登录失败（预期行为）');
      console.log('错误码:', response.data.error.code);
      console.log('错误信息:', response.data.error.message);
      return true;
    } else {
      console.error('❌ 登录应该失败但却成功了！');
      return false;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ 登录失败（预期行为）');
      console.log('错误信息:', error.response.data.error.message);
      return true;
    } else {
      console.error('❌ 未预期的错误:', error.message);
      return false;
    }
  }
}

/**
 * 测试未注册用户登录
 */
async function testLoginNonexistentUser() {
  console.log('\n🚫 测试未注册用户登录...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'nonexistent@example.com',
      password: 'password123'
    });

    if (!response.data.success) {
      console.log('✅ 登录失败（预期行为）');
      console.log('错误码:', response.data.error.code);
      console.log('错误信息:', response.data.error.message);
      return true;
    } else {
      console.error('❌ 登录应该失败但却成功了！');
      return false;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ 登录失败（预期行为）');
      console.log('错误信息:', error.response.data.error.message);
      return true;
    } else {
      console.error('❌ 未预期的错误:', error.message);
      return false;
    }
  }
}

/**
 * 测试获取当前用户信息
 */
async function testGetCurrentUser() {
  console.log('\n👤 测试获取当前用户信息...');
  
  if (!testUser.accessToken) {
    console.log('⚠️ 没有访问令牌，跳过此测试');
    return true;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${testUser.accessToken}`
      }
    });

    if (response.data.success) {
      console.log('✅ 获取用户信息成功!');
      console.log('用户ID:', response.data.data.user.id);
      console.log('用户名:', response.data.data.user.username);
      console.log('邮箱:', response.data.data.user.email);
      console.log('状态:', response.data.data.user.status);
      return true;
    } else {
      console.error('❌ 获取用户信息失败:', response.data.error.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 获取用户信息错误:', error.response?.data?.error?.message || error.message);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 梅花心易 - 用户认证测试');
  console.log('='.repeat(60));
  console.log('测试服务器:', BASE_URL);
  console.log('='.repeat(60));

  const results = [];

  // 测试注册
  results.push({ name: '用户注册', result: await testRegister() });

  // 测试登录（正确密码）
  results.push({ name: '用户登录（正确密码）', result: await testLoginSuccess() });

  // 测试登录（错误密码）
  results.push({ name: '用户登录（错误密码）', result: await testLoginFailure() });

  // 测试未注册用户
  results.push({ name: '未注册用户登录', result: await testLoginNonexistentUser() });

  // 测试获取当前用户信息
  results.push({ name: '获取当前用户信息', result: await testGetCurrentUser() });

  // 打印测试结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  results.forEach((test, index) => {
    const status = test.result ? '✅ 通过' : '❌ 失败';
    console.log(`${index + 1}. ${test.name}: ${status}`);
    if (test.result) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log('='.repeat(60));
  console.log(`总计: ${results.length} | 通过: ${passed} | 失败: ${failed}`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('🎉 所有测试通过！');
    process.exit(0);
  } else {
    console.log('⚠️ 部分测试失败，请检查日志');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试执行失败:', error.message);
  process.exit(1);
});
