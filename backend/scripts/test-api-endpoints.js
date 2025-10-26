/**
 * 测试API端点
 */

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPIEndpoints() {
  console.log('🧪 梅花心易API端点测试');
  console.log('=' .repeat(50));
  
  const baseUrl = 'localhost';
  const port = 3001;
  
  const tests = [
    {
      name: '健康检查',
      path: '/api/health',
      method: 'GET'
    },
    {
      name: '时间起卦',
      path: '/api/divination/time',
      method: 'POST',
      data: {}
    },
    {
      name: '数字起卦',
      path: '/api/divination/number',
      method: 'POST',
      data: {
        numbers: [123, 456]
      }
    },
    {
      name: '手动起卦',
      path: '/api/divination/manual',
      method: 'POST',
      data: {
        upperGua: 1,
        lowerGua: 2,
        movingLine: 3
      }
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      console.log(`\n🔍 测试: ${test.name}`);
      console.log(`📡 ${test.method} ${test.path}`);
      
      const options = {
        hostname: baseUrl,
        port: port,
        path: test.path,
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      };
      
      const response = await makeRequest(options, test.data);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log(`✅ 成功 (${response.statusCode})`);
        if (typeof response.data === 'object') {
          console.log(`📊 响应:`, JSON.stringify(response.data, null, 2));
        } else {
          console.log(`📊 响应:`, response.data);
        }
        passedTests++;
      } else {
        console.log(`⚠️ 状态码: ${response.statusCode}`);
        console.log(`📊 响应:`, response.data);
      }
      
    } catch (error) {
      console.log(`❌ 失败: ${error.message}`);
    }
  }
  
  console.log('\n📋 测试总结:');
  console.log(`   通过: ${passedTests}/${totalTests}`);
  console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有API测试通过！');
  } else {
    console.log('\n⚠️ 部分API测试失败，请检查服务器状态');
  }
  
  return passedTests === totalTests;
}

if (require.main === module) {
  testAPIEndpoints().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = testAPIEndpoints;
