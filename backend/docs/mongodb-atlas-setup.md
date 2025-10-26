# MongoDB Atlas 连接配置指南

## 📋 概述

本指南将帮助您正确配置《梅花心易》项目与MongoDB Atlas云端数据库的连接。

## 🔧 环境变量配置

### 1. 创建 `.env` 文件

在 `backend` 目录下创建 `.env` 文件（如果不存在），并添加以下配置：

```env
# 数据库配置
# 生产环境 - MongoDB Atlas
MONGODB_URI=mongodb+srv://yingxu0102:rK6Pax3ORKUJ8H3g@clustermeihuaxinyi.bzdajgt.mongodb.net/meihuaxinyi?retryWrites=true&w=majority

# 本地开发环境（可选）
MONGODB_LOCAL_URI=mongodb://localhost:27017/meihuaxinyi

# 测试环境
MONGODB_TEST_URI=mongodb://localhost:27017/meihuaxinyi_test

# 数据库名称
MONGODB_DB_NAME=meihuaxinyi

# 数据库连接选项
MONGODB_MAX_POOL_SIZE=10
MONGODB_SERVER_SELECTION_TIMEOUT=5000
MONGODB_SOCKET_TIMEOUT=45000
MONGODB_CONNECT_TIMEOUT=10000
MONGODB_MAX_IDLE_TIME=30000
```

### 2. 密码特殊字符处理

⚠️ **重要提醒**: 如果您的MongoDB Atlas密码包含特殊字符，必须进行URL编码！

#### 常见特殊字符编码表：

| 字符 | URL编码 | 示例 |
|------|---------|------|
| `@`  | `%40`   | `p@ssw0rd` → `p%40ssw0rd` |
| `#`  | `%23`   | `pass#123` → `pass%23123` |
| `$`  | `%24`   | `pa$$word` → `pa%24%24word` |
| `%`  | `%25`   | `pa%ss123` → `pa%25ss123` |
| `&`  | `%26`   | `pass&123` → `pass%26123` |
| `+`  | `%2B`   | `pass+123` → `pass%2B123` |
| `/`  | `%2F`   | `pass/123` → `pass%2F123` |
| `?`  | `%3F`   | `pass?123` → `pass%3F123` |
| `:`  | `%3A`   | `pass:123` → `pass%3A123` |
| `;`  | `%3B`   | `pass;123` → `pass%3B123` |
| `=`  | `%3D`   | `pass=123` → `pass%3D123` |
| ` `  | `%20`   | `pass 123` → `pass%20123` |

#### 示例：

**原始密码**: `MyP@ssw0rd#123`  
**编码后**: `MyP%40ssw0rd%23123`

**完整连接字符串**:
```
mongodb+srv://username:MyP%40ssw0rd%23123@cluster.mongodb.net/database
```

### 3. 连接字符串格式说明

```
mongodb+srv://[username]:[password]@[cluster-address]/[database]?[options]
```

**参数说明**:
- `username`: MongoDB Atlas用户名
- `password`: URL编码后的密码
- `cluster-address`: 集群地址（如：clustermeihuaxinyi.bzdajgt.mongodb.net）
- `database`: 数据库名称
- `options`: 连接选项（如：retryWrites=true&w=majority）

### 4. 推荐的连接选项

```
?retryWrites=true&w=majority&readPreference=primary&ssl=true&authSource=admin
```

**选项说明**:
- `retryWrites=true`: 启用写操作重试
- `w=majority`: 写关注级别，确保数据写入大多数节点
- `readPreference=primary`: 从主节点读取数据
- `ssl=true`: 启用SSL连接
- `authSource=admin`: 认证数据库

## 🔍 验证配置

### 1. 运行连接测试

```bash
cd backend
npm run test:mongodb
```

或者直接运行：

```bash
node scripts/test-mongodb-atlas.js
```

### 2. 预期输出

成功连接时应该看到：

```
🚀 开始MongoDB Atlas连接测试

✅ 连接字符串格式验证通过
🔄 测试MongoDB Atlas连接...
📡 连接地址: mongodb+srv://yingxu0102:***@clustermeihuaxinyi.bzdajgt.mongodb.net/meihuaxinyi
✅ MongoDB Atlas连接成功
🔄 测试身份验证...
✅ 身份验证成功
🔄 测试读写操作...
✅ 写入测试成功
✅ 读取测试成功
✅ 清理测试数据成功
🔄 测试索引操作...
✅ 索引创建成功
✅ 索引验证成功
✅ 索引清理成功
📊 获取数据库信息...
📈 数据库统计信息:
  数据库名称: meihuaxinyi
  集合数量: 0
  数据大小: 0.00 MB
  索引大小: 0.00 MB
  MongoDB版本: 7.0.x
  主机信息: xxx

📋 测试结果汇总:
================================
连接测试: ✅ 通过
身份验证: ✅ 通过
读写操作: ✅ 通过
索引操作: ✅ 通过

总体结果: 4/4 项测试通过
🎉 所有测试通过！MongoDB Atlas连接配置正确。

🔌 数据库连接已关闭
```

## 🚨 常见问题排查

### 1. 连接超时

**错误信息**: `MongooseServerSelectionError: connection timed out`

**解决方案**:
- 检查MongoDB Atlas IP白名单设置
- 添加当前IP地址到白名单，或使用 `0.0.0.0/0` 允许所有IP
- 确认网络连接正常

### 2. 身份验证失败

**错误信息**: `MongooseServerSelectionError: bad auth : authentication failed`

**解决方案**:
- 验证用户名和密码是否正确
- 检查密码中的特殊字符是否已正确URL编码
- 确认数据库用户权限设置

### 3. DNS解析失败

**错误信息**: `MongooseServerSelectionError: getaddrinfo ENOTFOUND`

**解决方案**:
- 检查集群地址是否正确
- 确认网络DNS设置正常
- 尝试使用不同的网络环境

### 4. 数据库不存在

**错误信息**: `MongooseError: database does not exist`

**解决方案**:
- MongoDB Atlas会自动创建数据库，通常不会出现此错误
- 检查连接字符串中的数据库名称是否正确
- 确认用户有创建数据库的权限

## 🔒 安全最佳实践

### 1. 环境变量安全

- ✅ 使用 `.env` 文件存储敏感信息
- ✅ 将 `.env` 文件添加到 `.gitignore`
- ✅ 生产环境使用环境变量而非文件
- ❌ 不要在代码中硬编码连接字符串

### 2. 数据库安全

- ✅ 使用强密码
- ✅ 定期更换密码
- ✅ 限制IP白名单范围
- ✅ 使用最小权限原则
- ✅ 启用数据库审计日志

### 3. 连接安全

- ✅ 始终使用SSL/TLS连接
- ✅ 设置合理的连接超时时间
- ✅ 使用连接池管理连接
- ✅ 监控连接状态和性能

## 📞 技术支持

如果遇到问题，请：

1. 首先运行测试脚本进行诊断
2. 查看详细的错误信息和建议
3. 检查MongoDB Atlas控制台的连接状态
4. 参考本文档的常见问题排查部分

**联系方式**:
- 项目Issues: [GitHub Issues](https://github.com/meihuaxinyi/issues)
- 技术支持: tech-support@meihuaxinyi.com
