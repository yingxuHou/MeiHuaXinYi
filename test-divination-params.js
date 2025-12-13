/**
 * 测试占卜参数验证
 * 用于验证前端发送的参数是否符合后端验证规则
 */

// 模拟前端适配器函数
function adaptDivinationParams(formData) {
  const { question, method, category, ...otherParams } = formData;

  let params = {};

  switch (method) {
    case 'time':
      // 确保时间格式严格符合ISO8601标准
      let datetime = otherParams.datetime || new Date().toISOString();
      // 移除毫秒部分，但避免重复的Z
      if (datetime.includes('.')) {
        datetime = datetime.split('.')[0] + 'Z';
      } else if (!datetime.endsWith('Z')) {
        datetime = datetime + 'Z';
      }
      params = {
        datetime: datetime
      };
      break;

    case 'number':
      params = {
        numbers: otherParams.numbers || []
      };
      break;

    case 'manual':
      params = {
        upperGua: otherParams.upperGua,
        lowerGua: otherParams.lowerGua,
        movingLine: otherParams.movingLine
      };
      break;
  }

  return {
    question,
    method,
    params,
    location: otherParams.location || null
  };
}

// 模拟后端验证函数
function validateDivinationParams(data) {
  const errors = [];

  // 验证question
  if (!data.question || typeof data.question !== 'string') {
    errors.push('问题字段缺失或类型错误');
  } else if (data.question.length < 1 || data.question.length > 200) {
    errors.push('问题长度必须在1-200字符之间');
  }

  // 验证method
  if (!data.method || !['time', 'number', 'manual'].includes(data.method)) {
    errors.push('起卦方法必须是time、number或manual');
  }

  // 验证params
  if (!data.params || typeof data.params !== 'object' || Array.isArray(data.params)) {
    errors.push('参数必须是对象');
  } else {
    // 根据method验证具体参数
    if (data.method === 'time') {
      if (data.params.datetime) {
        // 验证ISO8601格式
        const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
        if (!iso8601Regex.test(data.params.datetime)) {
          errors.push('时间格式必须是ISO8601格式 (YYYY-MM-DDTHH:mm:ssZ)');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 测试用例
console.log('🧪 开始测试占卜参数验证...\n');

// 测试用例1：时间起卦
console.log('📋 测试用例1: 时间起卦');
const testCase1 = {
  question: '我最近的工作发展如何？',
  method: 'time'
};

const adaptedData1 = adaptDivinationParams(testCase1);
console.log('✅ 适配后的数据:', JSON.stringify(adaptedData1, null, 2));

const validation1 = validateDivinationParams(adaptedData1);
console.log('✅ 验证结果:', validation1);
console.log('📊 状态:', validation1.isValid ? '✅ 通过' : '❌ 失败');
if (!validation1.isValid) {
  console.log('🔍 错误:', validation1.errors);
}
console.log('\n' + '='.repeat(50) + '\n');

// 测试用例2：数字起卦
console.log('📋 测试用例2: 数字起卦');
const testCase2 = {
  question: '我的感情运势如何？',
  method: 'number',
  numbers: [1, 2, 3, 4]
};

const adaptedData2 = adaptDivinationParams(testCase2);
console.log('✅ 适配后的数据:', JSON.stringify(adaptedData2, null, 2));

const validation2 = validateDivinationParams(adaptedData2);
console.log('✅ 验证结果:', validation2);
console.log('📊 状态:', validation2.isValid ? '✅ 通过' : '❌ 失败');
if (!validation2.isValid) {
  console.log('🔍 错误:', validation2.errors);
}
console.log('\n' + '='.repeat(50) + '\n');

// 测试用例3：手动起卦
console.log('📋 测试用例3: 手动起卦');
const testCase3 = {
  question: '投资理财是否合适？',
  method: 'manual',
  upperGua: 1,
  lowerGua: 8,
  movingLine: 3
};

const adaptedData3 = adaptDivinationParams(testCase3);
console.log('✅ 适配后的数据:', JSON.stringify(adaptedData3, null, 2));

const validation3 = validateDivinationParams(adaptedData3);
console.log('✅ 验证结果:', validation3);
console.log('📊 状态:', validation3.isValid ? '✅ 通过' : '❌ 失败');
if (!validation3.isValid) {
  console.log('🔍 错误:', validation3.errors);
}
console.log('\n' + '='.repeat(50) + '\n');

// 测试用例4：测试时间格式
console.log('📋 测试用例4: 时间格式验证');
const timeFormats = [
  '2025-12-13T14:30:00.000Z',  // 带毫秒
  '2025-12-13T14:30:00Z',      // 标准格式
  '2025-12-13T14:30:00+08:00', // 带时区
  '2025/12/13 14:30:00',       // 错误格式
  new Date().toISOString(),     // JavaScript原生格式
  new Date().toISOString().split('.')[0] + 'Z'  // 修复后的格式
];

timeFormats.forEach((timeFormat, index) => {
  const testData = {
    question: '测试时间格式',
    method: 'time'
  };

  testData.datetime = timeFormat;
  const adaptedData = adaptDivinationParams(testData);
  const validation = validateDivinationParams(adaptedData);

  console.log(`  🕐 时间格式${index + 1}: ${timeFormat}`);
  console.log(`  📝 适配后: ${adaptedData.params.datetime}`);
  console.log(`  ✅ 验证: ${validation.isValid ? '通过' : '失败'}`);
  if (!validation.isValid) {
    console.log(`  🔍 错误: ${validation.errors.join(', ')}`);
  }
  console.log('');
});

console.log('🎯 测试完成！');