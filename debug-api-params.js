/**
 * 调试API参数问题
 */

// 模拟前端发送的数据
const testCases = [
  // 情况1：只有问题字符串（旧版本兼容）
  { input: "我的运势如何？" },

  // 情况2：完整的时间起卦参数
  {
    question: "我的事业如何？",
    method: "time",
    datetime: new Date().toISOString()
  },

  // 情况3：使用adaptDivinationParams转换后的格式
  {
    question: "我的财运如何？",
    method: "time",
    params: {
      datetime: new Date().toISOString()
    },
    location: null
  }
];

// 验证函数（模拟后端验证）
function validateDivinationParams(data) {
  console.log('🔍 验证参数:', JSON.stringify(data, null, 2));

  const errors = [];

  // 检查必需字段
  if (!data.question || typeof data.question !== 'string') {
    errors.push('问题必须是字符串');
  } else if (data.question.length < 1 || data.question.length > 200) {
    errors.push('问题长度必须在1-200字符之间');
  }

  if (!data.method || !['time', 'number', 'manual'].includes(data.method)) {
    errors.push('起卦方法必须是time、number或manual');
  }

  if (!data.params || typeof data.params !== 'object') {
    errors.push('参数必须是对象');
  }

  // 检查时间起卦的特定参数
  if (data.method === 'time') {
    if (data.params.datetime) {
      const datetime = new Date(data.params.datetime);
      if (isNaN(datetime.getTime())) {
        errors.push('时间格式无效，必须是ISO8601格式');
      }
    }
  }

  console.log('验证结果:', errors.length === 0 ? '✅ 通过' : '❌ 失败');
  if (errors.length > 0) {
    console.log('错误列表:', errors);
  }

  return errors.length === 0;
}

// 模拟adaptDivinationParams函数
function adaptDivinationParams(formData) {
  if (typeof formData === 'string') {
    formData = { question: formData, method: 'time' };
  }

  const { question, method, category, ...otherParams } = formData;

  let params = {};

  switch (method) {
    case 'time':
      params = {
        datetime: otherParams.datetime || new Date().toISOString()
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

// 运行测试
console.log('🧪 测试API参数适配和验证...\n');

testCases.forEach((testCase, index) => {
  console.log(`\n测试用例 ${index + 1}:`);
  console.log('─'.repeat(50));

  let adaptedData;

  if (testCase.input) {
    // 情况1：字符串输入
    console.log('原始输入（字符串）:', testCase.input);
    adaptedData = adaptDivinationParams(testCase.input);
  } else {
    // 其他情况：对象输入
    console.log('原始输入（对象）:', testCase);
    adaptedData = testCase;
  }

  console.log('适配后数据:', JSON.stringify(adaptedData, null, 2));
  validateDivinationParams(adaptedData);
});

console.log('\n✨ 测试完成！');