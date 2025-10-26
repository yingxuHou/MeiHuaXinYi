# 🎯 AI解读功能使用指南

## 📍 如何在项目中调用AI解读功能

### 1. 基本调用方式

```javascript
// 引入AI解读服务
const DivinationInterpretationService = require('./src/services/divinationInterpretation.service');

// 创建服务实例
const interpretationService = new DivinationInterpretationService();

// 为占卜结果生成AI解读
const result = await interpretationService.generateAIInterpretation(divinationResult);

if (result.success) {
  console.log('AI解读内容:', result.data.content);
} else {
  console.log('降级解读:', result.data.content);
}
```

### 2. 结果输出位置

**AI解读结果包含以下信息：**

```javascript
{
  success: true,
  data: {
    // AI解读内容（主要输出）
    content: "### 🌟 卦象含义\n**主卦乾为天**（䷀）象征纯粹阳刚...",
    
    // 原始占卜数据
    divinationData: {
      mainHexagram: "乾为天",
      changingHexagram: "坤为地",
      fiveElements: { ben: "金", hu: "金", bian: "土", fortune: "中吉" }
    },
    
    // 用户问题
    question: "我想知道我的事业发展如何？",
    
    // AI模型信息
    aiModel: "deepseek-chat",
    
    // 生成时间
    generatedAt: "2025-10-25T01:43:33.547Z",
    
    // 原始占卜结果
    originalResult: {
      hexagrams: { ben: {...}, bian: {...} },
      analysis: { wuxing: {...} },
      method: "时间起卦"
    },
    
    // 元数据
    metadata: {
      aiProvider: "DeepSeek",
      interpretationType: "ai-generated",
      confidence: "high",
      language: "zh-CN"
    }
  }
}
```

## 🔧 实际集成示例

### 在占卜控制器中集成

```javascript
// 在你的 divination.controller.js 中添加
const DivinationInterpretationService = require('../services/divinationInterpretation.service');

class DivinationController {
  constructor() {
    this.divinationService = new DivinationService();
    this.interpretationService = new DivinationInterpretationService(); // 新增
  }

  async performDivination(req, res) {
    try {
      // 1. 执行占卜
      const divinationResult = await this.divinationService.performDivination(
        req.user.id,
        req.body.question,
        req.body.method,
        req.body.params
      );

      if (!divinationResult.success) {
        return res.status(500).json({
          success: false,
          message: '占卜执行失败'
        });
      }

      // 2. 生成AI解读
      const aiResult = await this.interpretationService.generateAIInterpretation(
        divinationResult.data
      );

      // 3. 返回完整结果
      res.json({
        success: true,
        data: {
          // 原始占卜结果
          ...divinationResult.data,
          // AI解读结果
          aiInterpretation: aiResult.data
        }
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

### 在前端显示AI解读

```javascript
// 前端调用示例
async function performDivinationWithAI(question) {
  try {
    const response = await fetch('/api/divination/perform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        question,
        method: '时间起卦'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // 显示占卜结果
      displayDivinationResult(result.data);
      
      // 显示AI解读
      if (result.data.aiInterpretation) {
        displayAIInterpretation(result.data.aiInterpretation.content);
      }
    }
  } catch (error) {
    console.error('占卜失败:', error);
  }
}

function displayAIInterpretation(content) {
  const interpretationDiv = document.getElementById('ai-interpretation');
  interpretationDiv.innerHTML = `
    <h3>🤖 AI专业解读</h3>
    <div class="interpretation-content">
      ${content.replace(/\n/g, '<br>')}
    </div>
  `;
}
```

## 🎨 自定义解读

### 生成特定角度的解读

```javascript
// 事业发展角度
const careerPrompt = '请从职场发展的角度分析这个卦象，重点关注当前职业阶段特征、未来发展趋势、需要提升的能力和具体行动建议。';

const careerResult = await interpretationService.generateCustomInterpretation(
  divinationResult,
  careerPrompt,
  { temperature: 0.8, maxTokens: 1500 }
);

// 感情运势角度
const relationshipPrompt = '请从感情关系的角度解读这个卦象，分析当前感情状态、双方关系特点、感情发展趋势和维护关系的建议。';

const relationshipResult = await interpretationService.generateCustomInterpretation(
  divinationResult,
  relationshipPrompt,
  { temperature: 0.7, maxTokens: 1200 }
);
```

## 📊 测试验证

运行测试脚本查看实际效果：

```bash
# 运行AI解读演示
node examples/ai-usage-demo.js
```

**测试结果显示：**
- ✅ 标准AI解读功能正常
- ✅ 自定义解读功能正常  
- ✅ 多角度解读支持
- ✅ 错误处理和降级机制完善

## 🎯 实际输出示例

从刚才的测试可以看到，AI解读的实际输出内容：

### 标准解读输出：
```
### 🌟 卦象含义
**主卦乾为天**（䷀）象征纯粹阳刚、健行不息的天道，代表你事业当前处于积极进取的阶段，充满创造力与领导力，但需警惕因过于刚强而失之灵活。**变卦坤为地**（䷁）则转为厚德载物之象，暗示事业将逐渐从开拓转向稳定积累，需以柔韧包容的姿态面对变化。

### 💡 对问题的启示
乾卦动极而静，化为坤卦，揭示你的事业正经历**从主动开拓到沉淀整合的转折**：
- **优势**：乾卦的刚健说明你具备卓越的行动力与责任感，易在竞争中获得认可；
- **挑战**：坤卦的柔顺提醒需注意人际协作，避免独断或急于求成，部分机会需"以退为进"。

### 🌱 具体建议
1. **调整节奏**：乾卦的"自强不息"需结合坤卦"厚德载物"，在锐意进取时，多倾听团队意见，将刚强化为韧劲。
2. **夯实基础**：坤卦象征积累，可专注提升专业深度或完善管理体系，为未来机遇铺路。
3. **顺应时势**：若遇暂时困顿，保持沉静，待时机自然转化，避免强破僵局。
```

### 感情运势解读输出：
```
### 感情关系角度的卦象解读

#### 一、当前感情状态
**乾为天**作为主卦，象征纯粹阳刚之气，反映当前感情关系可能呈现以下特点：
1. **双方独立性较强**：双乾卦象如同两龙并立，彼此重视自我空间与个人目标，关系中理性多于感性。
2. **缺乏情感流动性**：纯阳无阴的格局暗示感情表达可能过于直接或缺乏柔情，容易陷入"原则性过强"的相处模式。

#### 二、双方关系特点
1. **本质契合度高**（体用皆乾金）：核心价值观一致，对感情忠诚度要求较高
2. **发展阻力明显**（互卦仍为乾）：外部环境可能持续消耗情感能量
3. **转变契机初现**（变卦坤为地）：需要从"刚健"转向"柔顺"

#### 三、感情发展趋势
1. **短期波动**：若维持现状，可能陷入"相敬如宾但缺乏温情"的状态
2. **长期转向**：坤土生乾金预示关系可能向更稳定的方向发展

#### 四、维护关系建议
1. **刚柔并济之道**：主动注入柔和元素，学习坤德包容
2. **能量平衡调整**：利用土元素作为缓冲，避免金气过旺
3. **发展阶段重点**：建立清晰的情感边界，培养"示弱"的勇气
```

## 🚀 下一步集成建议

1. **在现有占卜流程中添加AI解读**
2. **创建AI解读的API接口**
3. **在前端添加解读显示组件**
4. **添加用户对AI解读的反馈功能**
5. **根据反馈优化提示词**

现在你可以开始在你的项目中集成AI解读功能了！🎉
