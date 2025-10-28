# 用户认证系统设置指南

## 📋 概述

本指南将帮助您设置用户认证系统，实现真实的用户注册和登录功能，连接到 MongoDB Atlas 云端数据库。

## ✅ 已完成的工作

### 1. 登录功能实现
- ✅ 修改了 `authController.js` 中的登录函数，实现真正的用户认证
- ✅ 验证用户名/邮箱和密码
- ✅ 只有注册过的用户才能登录
- ✅ 未注册的用户无法登录
- ✅ 添加了账户锁定保护（连续5次失败后锁定2小时）
- ✅ 更新用户的最后登录时间和连续登录天数

### 2. 功能特性
- ✅ 密码加密存储（使用 bcrypt）
- ✅ JWT token 认证
- ✅ 账户状态检查（active/inactive/suspended/deleted）
- ✅ 账户锁定保护
- ✅ 登录失败次数追踪

## 🔧 配置步骤

### 步骤 1: 设置环境变量

1. 复制环境变量模板文件：
```bash
cd backend
cp env.template .env
```

2. 编辑 `.env` 文件，设置以下必需配置：

#### MongoDB Atlas 数据库配置
```env
# 替换为您的 MongoDB Atlas 连接字符串
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/meihuaxinyi?retryWrites=true&w=majority
MONGODB_DB_NAME=meihuaxinyi
```

**如何获取 MongoDB Atlas 连接字符串：**
1. 登录 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建或选择您的集群
3. 点击 "Connect" 按钮
4. 选择 "Connect your application"
5. 复制连接字符串
6. 替换 `<password>` 为您的数据库密码

#### JWT 密钥配置
```env
# 生成一个至少32字符的随机字符串
JWT_SECRET=your-secure-random-secret-key-at-least-32-characters-long
```

**如何生成安全的 JWT_SECRET：**
```bash
# 在 Linux/Mac 上使用
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 应用基本配置
```env
NODE_ENV=development
PORT=3001
```

### 步骤 2: 安装依赖

确保所有必需的依赖已安装：

```bash
cd backend
npm install
```

### 步骤 3: 启动服务器

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 步骤 4: 验证数据库连接

启动服务器后，检查控制台输出，应该看到：

```
✅ MongoDB Atlas 连接成功
📊 数据库: meihuaxinyi
🌐 集群: cluster0.xxxxx.mongodb.net
```

如果连接失败，请检查：
- MongoDB Atlas IP 白名单设置
- 连接字符串是否正确
- 网络连接是否正常

## 📚 API 使用说明

### 1. 用户注册

**接口：** `POST /api/auth/register`

**请求示例：**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "profile": {
    "nickname": "测试用户",
    "gender": "male"
  }
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "...",
      "username": "testuser",
      "email": "test@example.com"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": "7d"
    }
  }
}
```

### 2. 用户登录（真实认证）

**接口：** `POST /api/auth/login`

**请求示例：**
```json
{
  "identifier": "test@example.com",
  "password": "password123"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "...",
      "username": "testuser",
      "email": "test@example.com",
      "isEmailVerified": false,
      "isVIP": true,
      "divination": {
        "freeCount": 10,
        "paidCount": 0
      }
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": "7d"
    }
  }
}
```

**登录失败示例：**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "用户名/邮箱或密码错误"
  }
}
```

### 3. 获取当前用户信息

**接口：** `GET /api/auth/me`

**请求头：**
```
Authorization: Bearer {accessToken}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "testuser",
      "email": "test@example.com",
      "isEmailVerified": false,
      "isVIP": true,
      "status": "active"
    }
  }
}
```

## 🔒 安全特性

### 1. 密码加密
- 使用 bcrypt 加密存储
- 盐值轮数：12（可在 `.env` 中配置）

### 2. 账户锁定保护
- 连续 5 次登录失败后锁定账户
- 锁定时间：2 小时
- 自动解锁或在管理员干预后解锁

### 3. JWT Token
- Access Token：7 天有效期
- Refresh Token：30 天有效期
- 支持令牌刷新机制

### 4. 用户状态管理
- `active`: 正常状态
- `inactive`: 未激活
- `suspended`: 已暂停
- `deleted`: 已删除

## 🧪 测试功能

### 测试注册和登录

1. **注册新用户**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

2. **使用注册的用户登录**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "test123456"
  }'
```

3. **测试错误密码**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "wrongpassword"
  }'
```

4. **测试未注册用户**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "nonexistent@example.com",
    "password": "password123"
  }'
```

## 🐛 常见问题

### 1. MongoDB 连接失败

**问题：** 无法连接到 MongoDB Atlas

**解决方案：**
- 检查 MongoDB Atlas IP 白名单，添加 `0.0.0.0/0` 允许所有IP
- 确认连接字符串中的用户名和密码正确
- 检查网络连接是否正常

### 2. JWT_SECRET 验证失败

**问题：** 配置验证失败：JWT_SECRET 长度应至少为32个字符

**解决方案：**
生成一个32字符以上的随机字符串，更新 `.env` 文件中的 `JWT_SECRET`

### 3. 用户无法登录

**问题：** 已注册用户无法登录

**解决方案：**
- 检查密码是否正确
- 确认数据库连接正常
- 检查账户状态是否为 `active`

## 📝 下一步

1. **邮箱验证**：实现邮箱验证码发送和验证
2. **密码重置**：实现忘记密码和密码重置功能
3. **多设备登录管理**：查看和撤销其他设备的登录
4. **社交登录**：集成微信、QQ等第三方登录

## 📞 支持

如果遇到问题，请检查：
- 服务器日志输出
- 数据库连接状态
- 网络连接
- 环境变量配置

---

**文档版本：** v1.0  
**更新日期：** 2025-01-26  
**维护者：** 梅花心易开发团队
