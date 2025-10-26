# DeepSeek AI 环境变量配置说明

## 📋 环境变量配置

请在 `backend` 目录下创建 `.env` 文件，并添加以下配置：

```bash
# DeepSeek AI配置
DEEPSEEK_API_KEY=sk-4b874041faa641f9921ddd5990a41752
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=4000
DEEPSEEK_TEMPERATURE=0.7
```

## 🚀 快速测试

运行以下命令测试DeepSeek API连接：

```bash
# 在backend目录下运行
node scripts/simple-deepseek-test.js
```

## 📁 已创建的文件结构

```
backend/src/ai/
├── deepseek/
│   └── DeepSeekAPI.js          # DeepSeek API客户端
├── AIServiceManager.js         # AI服务管理器
└── utils/                      # AI工具类（预留）
```

## 🔧 已安装的依赖包

- `axios` - HTTP客户端
- `openai` - OpenAI API客户端（用于向量嵌入）
- `@pinecone-database/pinecone` - Pinecone向量数据库
- `pdf-parse` - PDF文档解析
- `mammoth` - Word文档解析
- `cheerio` - HTML解析
- `natural` - 自然语言处理
- `jieba` - 中文分词

## ✅ 配置完成状态

- [x] DeepSeek API环境变量配置
- [x] 更新配置文件添加DeepSeek支持
- [x] 创建AI文件夹结构
- [x] 创建DeepSeek API客户端类
- [x] 安装必要的npm依赖包
- [x] 测试DeepSeek API连接

## 🎯 下一步

现在可以开始使用DeepSeek AI服务：

1. 在控制器中引入 `AIServiceManager`
2. 调用 `generateResponse()` 方法生成AI回答
3. 调用 `generateDivinationInterpretation()` 方法生成占卜解读

示例代码：
```javascript
const AIServiceManager = require('../ai/AIServiceManager');
const aiManager = new AIServiceManager();

// 生成AI回答
const response = await aiManager.generateResponse('你好，请介绍一下梅花易数');

// 生成占卜解读
const interpretation = await aiManager.generateDivinationInterpretation(
  divinationData, 
  '我想知道我的事业发展如何？'
);
```
