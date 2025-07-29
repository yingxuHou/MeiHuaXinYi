const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 开始测试梅花心易API...\n');

  try {
    // 1. 测试基础路由
    console.log('1️⃣ 测试基础路由...');
    const homeResponse = await axios.get(BASE_URL);
    console.log('✅ 基础路由正常:', homeResponse.data.message);
    console.log('📋 可用端点:', homeResponse.data.endpoints.length, '个\n');

    // 2. 测试用户注册
    console.log('2️⃣ 测试用户注册...');
    const registerData = {
      email: 'test@meihua.com',
      password: 'test123456',
      nickname: '测试用户'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
    console.log('✅ 用户注册成功');
    console.log('👤 用户信息:', registerResponse.data.data.user);
    console.log('🔑 Token:', registerResponse.data.data.token.substring(0, 20) + '...\n');
    
    const token = registerResponse.data.data.token;

    // 3. 测试用户登录
    console.log('3️⃣ 测试用户登录...');
    const loginData = {
      email: 'test@meihua.com',
      password: 'test123456'
    };
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    console.log('✅ 用户登录成功');
    console.log('👤 用户信息:', loginResponse.data.data.user);
    console.log('🔑 新Token:', loginResponse.data.data.token.substring(0, 20) + '...\n');

    // 4. 测试占卜提交
    console.log('4️⃣ 测试占卜提交...');
    const divinationData = {
      question: '我今年的事业运势如何？',
      category: '事业'
    };
    
    const divinationResponse = await axios.post(
      `${BASE_URL}/api/divination/submit`, 
      divinationData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ 占卜提交成功');
    console.log('🔮 占卜ID:', divinationResponse.data.data.divinationId);
    console.log('📝 问题:', divinationResponse.data.data.result.question);
    console.log('🎯 卦象:', divinationResponse.data.data.result.hexagram.original.name);
    console.log('💡 解读:', divinationResponse.data.data.result.aiInterpretation.overall);
    console.log('📋 建议:', divinationResponse.data.data.result.aiInterpretation.advice.join(', ') + '\n');

    // 5. 测试占卜历史
    console.log('5️⃣ 测试占卜历史...');
    const historyResponse = await axios.get(
      `${BASE_URL}/api/divination/history`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('✅ 获取占卜历史成功');
    console.log('📚 历史记录数量:', historyResponse.data.data.length);
    if (historyResponse.data.data.length > 0) {
      console.log('📖 最新记录:', historyResponse.data.data[0].question + '\n');
    }

    // 6. 测试错误处理
    console.log('6️⃣ 测试错误处理...');
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        email: 'test@meihua.com', // 重复邮箱
        password: 'test123456'
      });
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log('✅ 重复注册错误处理正常:', error.response.data.error.message);
      }
    }

    try {
      await axios.post(`${BASE_URL}/api/divination/submit`, {
        question: '短' // 太短的问题
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ 验证错误处理正常:', error.response.data.error.message);
      }
    }

    console.log('\n🎉 所有API测试完成！系统运行正常！');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    if (error.response) {
      console.error('📄 响应数据:', error.response.data);
      console.error('🔢 状态码:', error.response.status);
    }
  }
}

// 运行测试
testAPI();
