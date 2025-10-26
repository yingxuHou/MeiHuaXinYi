# 梅花心易占卜系统 - 后端服务

## 📖 项目概述

梅花心易占卜系统后端服务，基于Node.js + Express + MongoDB构建，提供完整的占卜业务API服务。

### 🏗️ 架构特点

- **微服务架构**: 模块化设计，易于扩展和维护
- **外部算法集成**: 调用专业的梅花易数算法API
- **AI智能解读**: 集成Claude AI提供智能卦象解读
- **RESTful API**: 标准化的API接口设计
- **数据库支持**: MongoDB + Redis双数据库架构
- **安全认证**: JWT + 多层安全防护

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- MongoDB >= 4.4
- Redis >= 6.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置必要的环境变量：

```env
# 基础配置
NODE_ENV=development
PORT=3001

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/meihuaxinyi
REDIS_HOST=localhost
REDIS_PORT=6379

# 外部算法API配置
ALGORITHM_API_URL=https://api.meihuaxinyi.com/algorithm
ALGORITHM_API_KEY=your-algorithm-api-key

# AI服务配置
CLAUDE_API_KEY=your-claude-api-key
```

### 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start

# 测试模式
npm test
```

## 📁 项目结构

```
src/
├── config/                 # 配置文件
│   ├── database.js         # 数据库配置
│   ├── external-algorithm.js # 外部算法API配置
│   └── redis.js            # Redis配置
├── controllers/            # 控制器层
│   ├── auth.controller.js  # 认证控制器
│   ├── divination.controller.js # 占卜控制器
│   └── user.controller.js  # 用户控制器
├── middleware/             # 中间件
│   ├── auth.middleware.js  # 认证中间件
│   ├── validation.middleware.js # 验证中间件
│   └── error.middleware.js # 错误处理中间件
├── models/                 # 数据模型
│   ├── User.js            # 用户模型
│   ├── Divination.js      # 占卜记录模型
│   └── index.js           # 模型导出
├── routes/                 # 路由定义
│   ├── auth.routes.js     # 认证路由
│   ├── divination.routes.js # 占卜路由
│   └── user.routes.js     # 用户路由
├── services/               # 业务服务层
│   ├── auth.service.js    # 认证服务
│   ├── divination.service.js # 占卜服务
│   └── user.service.js    # 用户服务
├── utils/                  # 工具函数
│   ├── logger.js          # 日志工具
│   ├── validator.js       # 验证工具
│   └── crypto.js          # 加密工具
└── app.js                  # 应用入口
```

## 🔧 核心功能

### 1. 占卜服务

- **外部算法集成**: 调用专业的梅花易数算法API
- **多种起卦方式**: 支持时间起卦、数字起卦、手动起卦
- **AI智能解读**: 基于Claude AI的智能卦象解读
- **结果存储**: 完整的占卜记录管理

### 2. 用户管理

- **注册登录**: 支持邮箱/手机号注册
- **资料管理**: 用户基本信息和生辰八字管理
- **权限控制**: 基于JWT的认证授权
- **免费次数**: 每日免费占卜次数管理

### 3. 数据管理

- **MongoDB**: 主要业务数据存储
- **Redis**: 缓存和会话管理
- **数据备份**: 自动数据备份机制
- **性能优化**: 查询优化和索引管理

## 🔌 API接口

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新Token
- `POST /api/auth/logout` - 用户登出

### 占卜相关

- `POST /api/divination/perform` - 执行占卜
- `GET /api/divination/:id` - 获取占卜详情
- `GET /api/divination/history` - 获取占卜历史
- `PUT /api/divination/:id/rating` - 评价占卜结果

### 用户相关

- `GET /api/user/profile` - 获取用户资料
- `PUT /api/user/profile` - 更新用户资料
- `POST /api/user/birth-info` - 设置生辰八字
- `GET /api/user/stats` - 获取用户统计

## 🔒 安全特性

- **JWT认证**: 无状态的用户认证
- **密码加密**: bcrypt密码哈希
- **请求验证**: 严格的参数验证
- **频率限制**: API调用频率限制
- **CORS配置**: 跨域请求安全控制
- **SQL注入防护**: 参数化查询防护

## 🌐 外部服务集成

### 专业算法API

系统已重构为调用外部专业算法API，不再包含自实现的算法代码：

- **算法服务**: 专业的梅花易数算法实现
- **高可用性**: 支持降级和容错机制
- **性能优化**: 缓存和重试机制
- **监控告警**: 完整的服务监控

配置示例：
```env
ALGORITHM_API_URL=https://api.meihuaxinyi.com/algorithm
ALGORITHM_API_KEY=your-api-key
ALGORITHM_TIMEOUT=30000
ALGORITHM_ENABLE_FALLBACK=true
```

### AI解读服务

- **Claude API**: 智能卦象解读
- **提示词优化**: 专业的解读模板
- **上下文分析**: 基于用户问题的个性化解读

## 📊 监控和日志

- **Winston日志**: 结构化日志记录
- **性能监控**: API响应时间监控
- **错误追踪**: 详细的错误日志
- **健康检查**: 服务健康状态监控

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 测试覆盖率
npm run test:coverage
```

## 📦 部署

### Docker部署

```bash
# 构建镜像
docker build -t meihuaxinyi-backend .

# 运行容器
docker run -p 3001:3001 meihuaxinyi-backend
```

### 生产环境

1. 设置生产环境变量
2. 配置数据库连接
3. 配置外部服务API密钥
4. 启动服务监控

## 🤝 开发指南

### 代码规范

- 使用ESLint进行代码检查
- 遵循JavaScript Standard Style
- 编写清晰的注释和文档
- 保持代码模块化和可测试性

### 提交规范

- 使用语义化的提交信息
- 每个提交只包含一个功能或修复
- 提交前运行测试确保代码质量

## 📄 许可证

MIT License

## 📞 联系我们

- **项目地址**: https://github.com/meihuaxinyi/backend
- **问题反馈**: https://github.com/meihuaxinyi/backend/issues
- **技术支持**: support@meihuaxinyi.com
