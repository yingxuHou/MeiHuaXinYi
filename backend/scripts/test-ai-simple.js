/**
 * 简化的AI解读功能测试
 * 使用开发模式token进行测试
 */

const axios = require('axios');

// 开发模式token（从auth中间件看到的格式）
const DEV_TOKEN = 'dev-signature-test-user-' + Date.now();

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: {
    'Authorization': `Bearer ${DEV_TOKEN}`,
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

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
      fortune: '大吉'
    },
    fortune: '大吉',
    timing: '春季有利'
  },
  interpretation: {
    summary: '运势极佳，宜主动出击',
    advice: '把握机会，展现才能',
    precautions: '避免过于急躁'
  }
};

async function test() {
  console.log('🚀 开始测试AI解读功能（开发模式）...\n');

  try {
    const tempId = `div_${Date.now()}_test123`;

    console.log('📝 测试数据:');
    console.log(`  ID: ${tempId}`);
    console.log(`  问题: ${testDivinationData.question}`);
    console.log(`  主卦: ${testDivinationData.hexagrams.ben.name}`);
    console.log(`  Token: ${DEV_TOKEN.substring(0, 50)}...\n`);

    console.log('⏳ 发送请求...');

    const response = await api.post(`/divination/${tempId}/interpretation`, {
      divinationData: testDivinationData
    });

    console.log('✅ 请求成功!');
    console.log('响应数据:', {
      status: response.status,
      success: response.data.success,
      message: response.data.message,
      hasAIInterpretation: !!response.data.data?.aiInterpretation
    });

    if (response.data.data?.aiInterpretation?.content) {
      console.log('\n📄 AI解读内容:');
      console.log(response.data.data.aiInterpretation.content.substring(0, 300) + '...');
    }

    if (response.data.data?.aiInterpretation?.metadata) {
      console.log('\n📊 元数据:');
      console.log(response.data.data.aiInterpretation.metadata);
    }

  } catch (error) {
    console.error('❌ 测试失败:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.error?.code,
      details: error.response?.data
    });

    if (error.response?.status === 500) {
      console.log('\n🔍 500错误可能的原因:');
      console.log('1. DeepSeek API密钥无效');
      console.log('2. 网络连接问题');
      console.log('3. AI服务内部错误');
    }
  }
}

// 运行测试
test();