/**
 * 简单的API测试脚本
 * 测试占卜API的基本功能
 */

const http = require('http');

/**
 * 简单的HTTP请求函数
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            data: body ? JSON.parse(body) : null
          };
          resolve(result);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            data: null
          });
        }
      });
    });

    req.on('error', (error) => {
      console.log('HTTP请求错误:', error.message);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * 测试API健康检查
 */
async function testHealthCheck() {
  console.log('🏥 测试API健康检查...');
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/divination/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ 健康检查成功');
      console.log('   响应:', response.data);
      return true;
    } else {
      console.log('❌ 健康检查失败');
      console.log('   状态码:', response.statusCode);
      console.log('   响应:', response.body);
      return false;
    }
    
  } catch (error) {
    console.log('❌ 健康检查请求失败:', error.message);
    return false;
  }
}

/**
 * 测试API信息接口
 */
async function testAPIInfo() {
  console.log('ℹ️ 测试API信息接口...');
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/divination/info',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ API信息获取成功');
      console.log('   API名称:', response.data?.data?.name);
      console.log('   API版本:', response.data?.data?.version);
      console.log('   支持方法:', response.data?.data?.supportedMethods);
      return true;
    } else {
      console.log('❌ API信息获取失败');
      console.log('   状态码:', response.statusCode);
      return false;
    }
    
  } catch (error) {
    console.log('❌ API信息请求失败:', error.message);
    return false;
  }
}

/**
 * 测试无认证访问（应该被拒绝）
 */
async function testUnauthorizedAccess() {
  console.log('🔒 测试无认证访问...');
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/divination/perform',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const data = {
      question: '测试问题',
      method: 'time',
      params: {}
    };

    const response = await makeRequest(options, data);
    
    if (response.statusCode === 401) {
      console.log('✅ 正确拒绝无认证访问');
      console.log('   错误信息:', response.data?.message);
      return true;
    } else {
      console.log('❌ 应该拒绝无认证访问');
      console.log('   状态码:', response.statusCode);
      return false;
    }
    
  } catch (error) {
    console.log('❌ 无认证访问测试失败:', error.message);
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🧪 开始API基础测试...\n');
  console.log('=' .repeat(50));

  const tests = [
    { name: '健康检查', test: testHealthCheck },
    { name: 'API信息', test: testAPIInfo },
    { name: '无认证访问', test: testUnauthorizedAccess }
  ];

  let passedTests = 0;
  const totalTests = tests.length;

  for (const { name, test } of tests) {
    console.log(`\n📋 ${name}测试:`);
    const result = await test();
    if (result) {
      passedTests++;
    }
    
    // 等待1秒再进行下一个测试
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '=' .repeat(50));
  console.log('📊 测试结果汇总:');
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过测试: ${passedTests}`);
  console.log(`   失败测试: ${totalTests - passedTests}`);
  console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有基础API测试通过！');
    console.log('💡 占卜API服务正常运行，可以进行完整功能测试。');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查服务器状态。');
  }

  console.log('=' .repeat(50));
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
