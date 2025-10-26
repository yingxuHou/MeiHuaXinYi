# DeepSeek AI占卜解读使用指南

## 🎯 功能概述

现在你可以使用DeepSeek AI对你的占卜结果进行专业解读了！系统已经配置好了完整的AI解读服务，包括：

- ✅ DeepSeek API客户端
- ✅ 占卜解读服务
- ✅ 自定义提示词支持
- ✅ 降级处理机制
- ✅ 完整的错误处理

## 🚀 快速使用

### 1. 基本用法

在你的控制器或服务中引入解读服务：

```javascript
const DivinationInterpretationService = require('../services/divinationInterpretation.service');

// 创建服务实例
const interpretationService = new DivinationInterpretationService();

// 生成AI解读
const result = await interpretationService.generateAIInterpretation(divinationResult);

if (result.success) {
  console.log('AI解读:', result.data.content);
} else {
  console.log('降级解读:', result.data.content);
}
```

### 2. 自定义解读

你可以使用自定义提示词来获得特定角度的解读：

```javascript
const customPrompt = '请从职场发展的角度，结合梅花易数的体用关系，为我分析这个卦象对事业发展的启示。';

const result = await interpretationService.generateCustomInterpretation(
  divinationResult, 
  customPrompt,
  { 
    temperature: 0.8,  // 创造性程度
    maxTokens: 1500    // 最大长度
  }
);
```

### 3. 检查AI服务状态

```javascript
const status = await interpretationService.checkAIStatus();
console.log('AI服务状态:', status.data.connections);
```

## 📝 提示词设计建议

### 基础提示词模板

```javascript
const basicPrompt = `你是梅花易数专家。请解读这个占卜：

问题：${question}

卦象：
- 主卦：${mainHexagram}
- 变卦：${changingHexagram}
- 五行：${fiveElements}

请简洁地分析：
1. 卦象含义
2. 对问题的启示
3. 具体建议

用温和专业的语调回答。`;
```

### 专业领域提示词

**事业发展：**
```javascript
const careerPrompt = `请从职场发展的角度分析这个卦象，重点关注：
1. 当前职业阶段的特征
2. 未来发展趋势
3. 需要提升的能力
4. 具体的行动建议`;
```

**感情运势：**
```javascript
const relationshipPrompt = `请从感情关系的角度解读这个卦象，分析：
1. 当前感情状态
2. 双方关系特点
3. 感情发展趋势
4. 维护关系的建议`;
```

**财运分析：**
```javascript
const wealthPrompt = `请从财运的角度分析这个卦象，包括：
1. 当前财务状况
2. 投资理财建议
3. 风险提示
4. 财富积累策略`;
```

## 🔧 集成到现有系统

### 在占卜控制器中添加AI解读

```javascript
// 在 divination.controller.js 中添加
const DivinationInterpretationService = require('../services/divinationInterpretation.service');

class DivinationController {
  constructor() {
    this.divinationService = new DivinationService();
    this.interpretationService = new DivinationInterpretationService();
  }

  async performDivination(req, res) {
    try {
      // 执行占卜
      const divinationResult = await this.divinationService.performDivination(
        req.user.id,
        req.body.question,
        req.body.method,
        req.body.params
      );

      // 生成AI解读
      const aiInterpretation = await this.interpretationService.generateAIInterpretation(
        divinationResult.data
      );

      // 合并结果
      const response = {
        ...divinationResult.data,
        aiInterpretation: aiInterpretation.data
      };

      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
```

### 添加专门的AI解读接口

```javascript
// 新增路由：POST /api/divination/:id/interpretation
async generateInterpretation(req, res) {
  try {
    const { id } = req.params;
    const { customPrompt, options } = req.body;

    // 获取占卜结果
    const divinationResult = await this.divinationService.getDivinationById(id, req.user.id);

    // 生成AI解读
    let interpretation;
    if (customPrompt) {
      interpretation = await this.interpretationService.generateCustomInterpretation(
        divinationResult.data,
        customPrompt,
        options
      );
    } else {
      interpretation = await this.interpretationService.generateAIInterpretation(
        divinationResult.data
      );
    }

    res.json({
      success: true,
      data: interpretation.data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
```

## 🎨 前端集成示例

```javascript
// 前端调用示例
async function getDivinationWithAI(question, method) {
  try {
    const response = await fetch('/api/divination/perform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        question,
        method,
        params: {}
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // 显示占卜结果
      displayDivinationResult(result.data);
      
      // 显示AI解读
      if (result.data.aiInterpretation) {
        displayAIInterpretation(result.data.aiInterpretation);
      }
    }
  } catch (error) {
    console.error('占卜失败:', error);
  }
}

// 自定义解读
async function getCustomInterpretation(divinationId, customPrompt) {
  try {
    const response = await fetch(`/api/divination/${divinationId}/interpretation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        customPrompt,
        options: {
          temperature: 0.8,
          maxTokens: 1500
        }
      })
    });

    const result = await response.json();
    
    if (result.success) {
      displayAIInterpretation(result.data);
    }
  } catch (error) {
    console.error('AI解读失败:', error);
  }
}
```

## ⚙️ 配置选项

### 环境变量

确保在 `.env` 文件中配置了：

```bash
DEEPSEEK_API_KEY=sk-4b874041faa641f9921ddd5990a41752
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=4000
DEEPSEEK_TEMPERATURE=0.7
```

### 解读参数

```javascript
const options = {
  temperature: 0.7,    // 0.1-1.0，越高越有创造性
  maxTokens: 2000,     // 最大生成长度
  service: 'deepseek'  // 指定AI服务
};
```

## 🛡️ 错误处理

系统已经内置了完善的错误处理机制：

1. **API超时**：自动降级到基础解读
2. **服务不可用**：返回降级解读内容
3. **网络错误**：重试机制和错误提示
4. **参数错误**：参数验证和默认值

## 📊 测试验证

运行测试脚本验证功能：

```bash
# 基础功能测试
node scripts/simple-interpretation-test.js

# 完整功能测试
node scripts/test-divination-interpretation.js
```

## 🎯 下一步建议

1. **集成到现有占卜流程**：在占卜完成后自动生成AI解读
2. **添加用户反馈**：让用户评价AI解读的准确性
3. **优化提示词**：根据用户反馈不断改进解读质量
4. **添加解读历史**：保存用户的AI解读记录
5. **多语言支持**：支持英文等其他语言的解读

现在你可以开始使用DeepSeek AI来为你的占卜结果提供专业的解读了！🎉
