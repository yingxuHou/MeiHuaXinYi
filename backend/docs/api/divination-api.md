# 梅花心易占卜API文档 v2.0

## 📖 概述

梅花心易占卜API提供完整的占卜功能，包括三种起卦方法、五行分析、卦象解读等。所有API都需要用户认证，并根据订阅类型提供不同的访问权限。

## 🔐 认证

所有占卜API都需要JWT认证。在请求头中包含：

```
Authorization: Bearer <your_jwt_token>
```

## 📊 响应格式

所有API响应都遵循统一格式：

```json
{
  "success": true|false,
  "message": "响应消息",
  "data": { /* 响应数据 */ },
  "code": "错误代码（仅失败时）",
  "errors": [ /* 验证错误详情（仅验证失败时） */ ]
}
```

## 🔮 占卜API

### 1. 执行占卜

**POST** `/api/divination/perform`

执行占卜并返回完整的分析结果。

#### 请求参数

```json
{
  "question": "占卜问题（1-200字符）",
  "method": "time|number|manual",
  "params": {
    // 根据method不同而不同的参数
  },
  "location": {
    "latitude": 39.9042,
    "longitude": 116.4074,
    "city": "北京"
  }
}
```

#### 起卦方法参数

**时间起卦 (method: "time")**
```json
{
  "params": {
    "datetime": "2024-01-01T12:00:00.000Z" // 可选，默认当前时间
  }
}
```

**数字起卦 (method: "number")**
```json
{
  "params": {
    "numbers": [123, 456] // 至少2个正整数
  }
}
```

**手动起卦 (method: "manual")**
```json
{
  "params": {
    "upperGua": 1,    // 上卦序号 (1-8)
    "lowerGua": 8,    // 下卦序号 (1-8)
    "movingLine": 3   // 动爻位置 (1-6)
  }
}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "div_1234567890_abc123",
    "question": "今日运势如何？",
    "method": "time",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "hexagrams": {
      "ben": {
        "id": 5,
        "name": "水天需",
        "upperGua": {
          "number": 6,
          "name": "坎",
          "symbol": "☵",
          "element": "水"
        },
        "lowerGua": {
          "number": 1,
          "name": "乾",
          "symbol": "☰",
          "element": "金"
        },
        "lines": [1,1,1,0,1,0]
      },
      "hu": { /* 互卦信息 */ },
      "bian": { /* 变卦信息 */ }
    },
    "movingLine": 3,
    "analysis": {
      "wuxing": {
        "ben": "水",
        "hu": "木",
        "bian": "火",
        "relationships": {
          "benToHu": {
            "type": "generation",
            "meaning": "生",
            "description": "水生木"
          },
          "benToBian": {
            "type": "destruction",
            "meaning": "克",
            "description": "水克火"
          }
        },
        "fortune": "中吉",
        "timing": "春季有利，五行力量强盛"
      }
    },
    "interpretation": {
      "summary": "得水天需卦，主五行为水，总体运势中吉...",
      "detailed": "本卦水天需，表示等待时机...",
      "advice": "运势良好，适合推进计划，稳步前行...",
      "precautions": "避免与火相关的事物",
      "confidence": 0.85
    },
    "metadata": {
      "algorithmVersion": "v2.0",
      "processingTime": 15
    }
  }
}
```

#### 限流规则

- 免费用户：15分钟内最多10次
- 基础会员：15分钟内最多30次
- 高级会员：15分钟内最多100次

### 2. 获取占卜详情

**GET** `/api/divination/:id`

获取指定占卜记录的详细信息。

#### 路径参数

- `id`: 占卜记录ID

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "div_1234567890_abc123",
    "question": "今日运势如何？",
    "method": "time",
    "hexagrams": { /* 卦象信息 */ },
    "analysis": { /* 分析结果 */ },
    "interpretation": { /* 解读内容 */ },
    "userRating": {
      "overall": 4,
      "accuracy": 5,
      "helpfulness": 4,
      "feedback": "很准确的解读",
      "ratedAt": "2024-01-01T13:00:00.000Z"
    },
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. 获取占卜历史

**GET** `/api/divination/history`

获取用户的占卜历史记录。

#### 查询参数

- `page`: 页码（默认1）
- `limit`: 每页数量（默认10，最大50）
- `startDate`: 开始日期（ISO8601格式）
- `endDate`: 结束日期（ISO8601格式）
- `method`: 起卦方法筛选
- `sortBy`: 排序字段（createdAt|question|method）
- `sortOrder`: 排序方向（asc|desc）

#### 响应示例

```json
{
  "success": true,
  "data": {
    "divinations": [
      {
        "id": "div_1234567890_abc123",
        "question": "今日运势如何？",
        "method": "time",
        "hexagram": "水天需",
        "fortune": "中吉",
        "rating": 4,
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 4. 获取占卜统计

**GET** `/api/divination/stats`

获取用户的占卜统计信息。

#### 响应示例

```json
{
  "success": true,
  "data": {
    "total": 25,
    "thisMonth": 8,
    "averageRating": 4.2,
    "methodDistribution": {
      "time": 15,
      "number": 8,
      "manual": 2
    },
    "fortuneDistribution": {
      "大吉": 3,
      "中吉": 12,
      "小吉": 8,
      "平": 2
    }
  }
}
```

### 5. 评价占卜结果

**PUT** `/api/divination/:id/rating`

对占卜结果进行评价。

#### 路径参数

- `id`: 占卜记录ID

#### 请求参数

```json
{
  "overall": 4,        // 总体评分 (1-5)
  "accuracy": 5,       // 准确性评分 (1-5)
  "helpfulness": 4,    // 有用性评分 (1-5)
  "feedback": "很准确的解读，对我很有帮助" // 可选反馈
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "评价提交成功",
  "data": {
    "id": "div_1234567890_abc123",
    "rating": {
      "overall": 4,
      "accuracy": 5,
      "helpfulness": 4,
      "feedback": "很准确的解读，对我很有帮助",
      "ratedAt": "2024-01-01T13:00:00.000Z"
    }
  }
}
```

## 🔧 工具API

### 健康检查

**GET** `/api/divination/health`

检查占卜服务状态。

```json
{
  "success": true,
  "message": "占卜服务运行正常",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "2.0"
}
```

### API信息

**GET** `/api/divination/info`

获取API基本信息。

```json
{
  "success": true,
  "data": {
    "name": "梅花心易占卜API",
    "version": "2.0",
    "description": "基于传统梅花易数理论的智能占卜系统",
    "endpoints": [
      "POST /api/divination/perform - 执行占卜",
      "GET /api/divination/:id - 获取占卜详情"
    ],
    "supportedMethods": ["time", "number", "manual"],
    "rateLimit": {
      "free": "10 requests per 15 minutes",
      "basic": "30 requests per 15 minutes",
      "premium": "100 requests per 15 minutes"
    }
  }
}
```

## ❌ 错误代码

| 代码 | 描述 | HTTP状态码 |
|------|------|------------|
| `TOKEN_MISSING` | 访问令牌缺失 | 401 |
| `TOKEN_INVALID` | 访问令牌无效 | 401 |
| `USER_NOT_FOUND` | 用户不存在 | 401 |
| `ACCOUNT_DISABLED` | 账户已被禁用 | 403 |
| `FREE_QUOTA_EXCEEDED` | 免费配额已用完 | 403 |
| `PERMISSION_DENIED` | 权限不足 | 403 |
| `RATE_LIMIT_EXCEEDED` | 请求频率超限 | 429 |
| `VALIDATION_ERROR` | 参数验证失败 | 400 |
| `DIVINATION_ERROR` | 占卜执行失败 | 400 |
| `NOT_FOUND` | 资源不存在 | 404 |
| `INTERNAL_ERROR` | 服务器内部错误 | 500 |

## 📝 使用示例

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Authorization': `Bearer ${your_token}`,
    'Content-Type': 'application/json'
  }
});

// 执行时间起卦
const divination = await api.post('/divination/perform', {
  question: '今日运势如何？',
  method: 'time',
  params: {}
});

console.log('占卜结果:', divination.data);
```

### cURL

```bash
# 执行占卜
curl -X POST http://localhost:3001/api/divination/perform \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "今日运势如何？",
    "method": "time",
    "params": {}
  }'

# 获取占卜历史
curl -X GET "http://localhost:3001/api/divination/history?page=1&limit=10" \
  -H "Authorization: Bearer your_token"
```

## 🔄 版本历史

- **v2.0** (2024-08): 完整的占卜API实现
  - 支持三种起卦方法
  - 完整的五行分析
  - 用户权限控制
  - API限流保护

---

**维护者**: 梅花心易开发团队  
**更新时间**: 2024年8月  
**技术支持**: api-support@meihuaxinyi.com
