/**
 * 调试用户注册问题
 */

require('dotenv').config();
const axios = require('axios');

const testRegistration = async () => {
  try {
    console.log('🔄 测试用户注册...');
    
    const timestamp = Date.now().toString().slice(-6); // 只取最后6位
    const testUser = {
      username: 'test_' + timestamp,
      email: `test_${timestamp}@example.com`,
      password: 'Test123456A',
      phone: '13800138000'
    };
    
    console.log('📋 注册数据:', JSON.stringify(testUser, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/auth/register', testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 注册成功:', response.data);
    
  } catch (error) {
    console.error('❌ 注册失败:');
    console.error('状态码:', error.response?.status);
    console.error('错误信息:', JSON.stringify(error.response?.data, null, 2));
    if (error.response?.data?.error?.details) {
      console.error('验证详情:');
      error.response.data.error.details.forEach((detail, index) => {
        console.error(`  ${index + 1}. ${detail.msg} (字段: ${detail.path})`);
      });
    }
    console.error('完整错误:', error.message);
  }
};

testRegistration();
