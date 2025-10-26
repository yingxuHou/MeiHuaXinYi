# 外部专业算法API接口规范

## 概述

本文档定义了梅花心易占卜系统与外部专业算法服务的接口规范。外部算法服务负责实现核心的梅花易数算法，包括起卦、卦象计算、五行分析等功能。

## 基础信息

- **API版本**: v1.0
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: Bearer Token

## 接口规范

### 1. 执行占卜

**端点**: `POST /divination/perform`

**请求头**:
```
Content-Type: application/json
Authorization: Bearer {api_key}
X-Client-Version: 2.0
X-Client-Type: meihuaxinyi-backend
X-Request-ID: {unique_request_id}
```

**请求体**:
```json
{
  "question": "今日运势如何？",
  "method": "time",
  "params": {
    "datetime": "2025-08-04T12:00:00.000Z"
  },
  "timestamp": "2025-08-04T12:00:00.000Z",
  "requestId": "req_1754309378439_abc123def",
  "userContext": {
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "location": {
      "latitude": 39.9042,
      "longitude": 116.4074,
      "city": "北京"
    }
  }
}
```

**请求参数说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| question | string | 是 | 占卜问题，5-200字符 |
| method | string | 是 | 起卦方法：time/number/manual |
| params | object | 是 | 起卦参数，根据method不同而不同 |
| timestamp | string | 是 | 请求时间戳，ISO 8601格式 |
| requestId | string | 是 | 唯一请求ID |
| userContext | object | 否 | 用户上下文信息 |

**起卦参数 (params) 详细说明**:

1. **时间起卦 (method: "time")**:
```json
{
  "datetime": "2025-08-04T12:00:00.000Z"
}
```

2. **数字起卦 (method: "number")**:
```json
{
  "numbers": [123, 456]
}
```

3. **手动起卦 (method: "manual")**:
```json
{
  "upperGua": 1,
  "lowerGua": 8,
  "movingLine": 3
}
```

**响应体**:
```json
{
  "success": true,
  "data": {
    "hexagrams": {
      "ben": {
        "id": 23,
        "name": "山地剥",
        "upperGua": {
          "name": "艮",
          "symbol": "☶",
          "element": "土",
          "nature": "山"
        },
        "lowerGua": {
          "name": "坤",
          "symbol": "☷",
          "element": "土",
          "nature": "地"
        },
        "lines": [0, 0, 0, 1, 0, 1],
        "judgment": "剥：不利有攸往。",
        "image": "山附于地，剥；上以厚下安宅。"
      },
      "hu": {
        "id": 2,
        "name": "坤为地",
        "upperGua": { /* 同上结构 */ },
        "lowerGua": { /* 同上结构 */ },
        "lines": [0, 0, 0, 0, 0, 0]
      },
      "bian": {
        "id": 24,
        "name": "地雷复",
        "upperGua": { /* 同上结构 */ },
        "lowerGua": { /* 同上结构 */ },
        "lines": [1, 0, 0, 0, 0, 0]
      }
    },
    "analysis": {
      "wuxing": {
        "ben": "土",
        "hu": "土",
        "bian": "土",
        "relationships": {
          "benToHu": {
            "type": "same",
            "strength": "neutral",
            "meaning": "同"
          },
          "benToBian": {
            "type": "generation",
            "strength": "weak",
            "meaning": "生"
          },
          "huToBian": {
            "type": "same",
            "strength": "neutral",
            "meaning": "同"
          }
        },
        "fortune": "中平",
        "timing": "秋冬有利",
        "favorableElements": ["火", "土"],
        "unfavorableElements": ["木"],
        "compatibility": 0.65,
        "strength": 0.7
      },
      "fortune": "中平",
      "timing": "秋冬有利",
      "movingLine": {
        "position": 3,
        "description": "三爻动",
        "influence": "变化在即"
      }
    },
    "interpretation": {
      "summary": "山地剥卦显示当前处于剥落阶段...",
      "detailed": "详细的卦象解读内容...",
      "advice": "建议保持低调，等待时机...",
      "timing": "秋冬季节较为有利..."
    },
    "metadata": {
      "algorithmVersion": "v2.1.0",
      "processingTime": 156,
      "confidence": 0.92,
      "requestId": "req_1754309378439_abc123def",
      "timestamp": "2025-08-04T12:00:00.156Z"
    }
  },
  "message": "占卜成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMS",
    "message": "起卦参数无效",
    "details": {
      "field": "params.datetime",
      "reason": "时间格式不正确"
    }
  },
  "requestId": "req_1754309378439_abc123def",
  "timestamp": "2025-08-04T12:00:00.156Z"
}
```

### 2. 健康检查

**端点**: `GET /health`

**响应体**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "v2.1.0",
    "uptime": 86400,
    "timestamp": "2025-08-04T12:00:00.000Z"
  }
}
```

## 错误码说明

| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| INVALID_PARAMS | 400 | 请求参数无效 |
| UNAUTHORIZED | 401 | 认证失败 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| RATE_LIMITED | 429 | 请求频率超限 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| SERVICE_UNAVAILABLE | 503 | 服务暂时不可用 |

## 数据模型

### 卦象对象 (Hexagram)
```typescript
interface Hexagram {
  id: number;           // 卦象ID (1-64)
  name: string;         // 卦象名称
  upperGua: Bagua;      // 上卦
  lowerGua: Bagua;      // 下卦
  lines: number[];      // 六爻数组 [0,1,0,1,1,0]
  judgment?: string;    // 卦辞
  image?: string;       // 象辞
}
```

### 八卦对象 (Bagua)
```typescript
interface Bagua {
  name: string;         // 八卦名称
  symbol: string;       // 八卦符号
  element: string;      // 五行属性
  nature: string;       // 自然属性
  direction?: string;   // 方位
  season?: string;      // 季节
}
```

### 五行分析 (WuxingAnalysis)
```typescript
interface WuxingAnalysis {
  ben: string;          // 本卦五行
  hu: string;           // 互卦五行
  bian: string;         // 变卦五行
  relationships: {      // 五行关系
    benToHu: Relationship;
    benToBian: Relationship;
    huToBian: Relationship;
  };
  fortune: string;      // 运势
  timing: string;       // 时机
  favorableElements: string[];    // 有利五行
  unfavorableElements: string[];  // 不利五行
  compatibility: number;          // 兼容性 (0-1)
  strength: number;              // 强度 (0-1)
}
```

## 安全要求

1. **HTTPS**: 所有API调用必须使用HTTPS协议
2. **认证**: 使用Bearer Token进行身份认证
3. **请求签名**: 重要请求需要进行签名验证
4. **频率限制**: 实施合理的API调用频率限制
5. **数据加密**: 敏感数据需要加密传输

## 性能要求

1. **响应时间**: 95%的请求应在2秒内响应
2. **可用性**: 服务可用性应达到99.9%
3. **并发**: 支持至少1000并发请求
4. **缓存**: 合理使用缓存提高性能

## 开发环境

开发环境下可以使用模拟数据进行测试，API会返回固定的示例结果用于前端开发和测试。

**开发环境标识**:
- 请求头中包含 `X-Environment: development`
- 或者使用专门的开发环境端点

## 联系信息

- **技术支持**: algorithm-support@meihuaxinyi.com
- **API文档**: https://docs.meihuaxinyi.com/algorithm-api
- **状态页面**: https://status.meihuaxinyi.com
