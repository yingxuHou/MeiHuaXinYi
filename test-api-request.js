/**
 * 测试实际API请求
 */

const axios = require('axios');

// 模拟前端请求
async function testDivinationAPI() {
  const baseURL = 'http://localhost:3000/api';

  // 模拟开发token（开发环境使用）
  const devToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZXYtdXNlci0xMjM0NTY3OCIsImVtYWlsIjoiZGV2QGV4YW1wbGUuY29tIiwiaXNEZXYiOnRydWUsImlhdCI6MTYzNTU0NDAwMCwiZXhwIjo5OTk5OTk5OTk5LCJpc3MiOiJtZWlodWEteGlueWkifQ.dev-signature';

  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`
    }
  });

  // 测试不同的请求格式
  const testCases = [
    {
      name: '字符串格式（旧版本兼容）',
      data: '我的运势如何？'
    },
    {
      name: '对象格式（包含datetime）',
      data: {
        question: '我的事业如何？',
        method: 'time',
        datetime: new Date().toISOString()
      }
    },
    {
      name: '标准格式（包含params）',
      data: {
        question: '我的财运如何？',
        method: 'time',
        params: {
          datetime: new Date().toISOString()
        }
      }
    },
    {
      name: '完整格式（适配后）',
      data: {
        question: '我的健康如何？',
        method: 'time',
        params: {
          datetime: new Date().toISOString()
        },
        location: null
      }
    }
  ];

  console.log('🧪 测试占卜API请求格式...\n');

  for (const testCase of testCases) {
    console.log(`\n测试: ${testCase.name}`);
    console.log('─'.repeat(50));
    console.log('请求数据:', JSON.stringify(testCase.data, null, 2));

    try {
      let response;

      // 根据不同的端点测试
      if (testCase.name.includes('字符串格式')) {
        // dev-perform 端点应该能处理字符串
        response = await api.post('/divination/dev-perform', {
          question: testCase.data,
          method: 'time',
          params: {
            datetime: new Date().toISOString()
          }
        });
      } else {
        response = await api.post('/divination/dev-perform', testCase.data);
      }

      console.log('✅ 响应成功:', {
        status: response.status,
        hasData: !!response.data,
        hasHexagrams: !!response.data.data?.hexagrams
      });

    } catch (error) {
      console.error('❌ 请求失败:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      });
    }
  }
}

// 运行测试
testDivinationAPI().catch(console.error);