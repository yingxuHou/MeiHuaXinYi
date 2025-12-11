/**
 * AI解读功能测试脚本
 * 用于验证修复后的AI解读功能是否正常工作
 */

const axios = require('axios');

// 配置
const API_BASE_URL = 'http://localhost:8081/api';
let TEST_USER_TOKEN = null; // 将在登录后获取

// 创建axios实例（不带token的）
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// 添加token到请求头的辅助函数
const setAuthToken = (token) => {
  TEST_USER_TOKEN = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// 测试数据
const testDivinationData = {
  question: '我的事业发展会如何？',
  method: 'time',
  hexagrams: {
    ben: {
      name: '乾为天',
      id: 1,
      upperGua: { name: '乾', element: '金' },
      lowerGua: { name: '乾', element: '金' },
      keywords: ['刚健', '主动', '创造']
    },
    hu: {
      name: '坤为地',
      id: 2,
      upperGua: { name: '坤', element: '土' },
      lowerGua: { name: '坤', element: '土' }
    },
    bian: {
      name: '泽天夬',
      id: 43,
      upperGua: { name: '兑', element: '金' },
      lowerGua: { name: '乾', element: '金' }
    }
  },
  movingLine: 4,
  analysis: {
    wuxing: {
      ben: '金',
      hu: '土',
      bian: '金',
      fortune: '大吉',
      relationships: {
        '体生用': '金生土',
        '用生体': '土生金'
      }
    },
    fortune: '大吉',
    timing: '春季有利',
    favorableElements: ['土', '金']
  },
  interpretation: {
    summary: '运势极佳，宜主动出击',
    advice: '把握机会，展现才能',
    precautions: '避免过于急躁'
  }
};

// 登录获取token
async function login() {
  console.log('🔐 正在登录获取测试token...');
  try {
    // 使用测试用户登录
    const loginData = {
      username: 'test@example.com', // 使用username而不是email
      password: 'password123'
    };

    const response = await api.post('/auth/login', loginData);

    if (response.data.success && response.data.data.token) {
      setAuthToken(response.data.data.token);
      console.log('✅ 登录成功，获取到token');
      return true;
    } else {
      // 如果测试用户不存在，尝试注册
      console.log('⚠️ 测试用户不存在，尝试注册...');
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        nickname: '测试用户'
      };

      const registerResponse = await api.post('/auth/register', registerData);
      if (registerResponse.data.success) {
        // 注册成功后再次登录
        return await login();
      }

      console.error('❌ 注册失败');
      return false;
    }
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试用例
async function testAIInterpretation() {
  console.log('🚀 开始测试AI解读功能...\n');

  // 首先登录获取token
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('❌ 无法获取有效token，跳过测试');
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试1: 使用临时ID生成AI解读
  console.log('📝 测试1: 使用临时ID生成AI解读');
  try {
    const tempId = `div_${Date.now()}_test123`;
    const response = await api.post(`/divination/${tempId}/interpretation`, {
      divinationData: testDivinationData
    });

    console.log('✅ 临时ID测试成功:', {
      status: response.status,
      success: response.data.success,
      message: response.data.message,
      hasAIInterpretation: !!response.data.data?.aiInterpretation,
      interpretationLength: response.data.data?.aiInterpretation?.content?.length || 0
    });

    if (response.data.data?.aiInterpretation?.content) {
      console.log('📄 AI解读预览:', response.data.data.aiInterpretation.content.substring(0, 100) + '...');
    }
  } catch (error) {
    console.error('❌ 临时ID测试失败:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试2: 测试认证问题
  console.log('📝 测试2: 测试认证问题');
  try {
    const apiWithoutToken = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const tempId = `div_${Date.now()}_auth_test`;
    const response = await apiWithoutToken.post(`/divination/${tempId}/interpretation`, {
      divinationData: testDivinationData
    });

    console.log('❌ 认证测试意外成功（应该失败）');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ 认证测试通过 - 正确返回401未授权错误');
    } else {
      console.log('⚠️ 认证测试返回意外状态码:', error.response?.status);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试3: 测试缺少占卜数据的情况
  console.log('📝 测试3: 测试缺少占卜数据的情况');
  try {
    const tempId = `div_${Date.now()}_no_data`;
    const response = await api.post(`/divination/${tempId}/interpretation`, {});

    console.log('❌ 缺少数据测试意外成功（应该失败）');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.code === 'MISSING_DIVINATION_DATA') {
      console.log('✅ 缺少数据测试通过 - 正确返回400错误');
    } else {
      console.log('⚠️ 缺少数据测试返回意外状态码:', error.response?.status);
      console.log('错误详情:', error.response?.data);
    }
  }

  console.log('\n🏁 AI解读功能测试完成！');
}

// 运行测试
testAIInterpretation().catch(console.error);