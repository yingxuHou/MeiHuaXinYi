# MongoDB 数据库配置指南

## 🎯 概述

本指南将帮助您为梅花心易项目配置MongoDB数据库，支持本地开发和云端部署两种方案。

## 🏠 方案一：本地MongoDB (开发环境推荐)

### 1. 安装MongoDB Community Edition

#### Windows:
1. 访问 [MongoDB下载页面](https://www.mongodb.com/try/download/community)
2. 选择 Windows 版本下载
3. 运行安装程序，选择 "Complete" 安装
4. 勾选 "Install MongoDB as a Service"
5. 勾选 "Install MongoDB Compass" (可选的图形界面工具)

#### macOS:
```bash
# 使用 Homebrew 安装
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux (Ubuntu):
```bash
# 导入公钥
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# 添加MongoDB仓库
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 安装MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### 2. 启动MongoDB服务

#### Windows:
MongoDB会自动作为Windows服务启动。如需手动控制：
```cmd
# 启动服务
net start MongoDB

# 停止服务
net stop MongoDB
```

#### macOS/Linux:
```bash
# 启动MongoDB
sudo systemctl start mongod

# 设置开机自启
sudo systemctl enable mongod

# 检查状态
sudo systemctl status mongod
```

### 3. 验证安装

```bash
# 连接到MongoDB
mongosh

# 在MongoDB shell中执行
show dbs
```

### 4. 配置环境变量

在 `backend/.env` 文件中设置：
```env
MONGODB_URI=mongodb://localhost:27017/meihuaxinyi
```

## ☁️ 方案二：MongoDB Atlas (生产环境推荐)

### 1. 创建MongoDB Atlas账户

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 点击 "Try Free" 注册免费账户
3. 验证邮箱并登录

### 2. 创建免费集群

1. 选择 "Build a Database"
2. 选择 "M0 Sandbox" (免费层)
3. 选择云服务商和地区 (推荐选择离您最近的地区)
4. 集群名称可以保持默认或自定义
5. 点击 "Create Cluster"

### 3. 配置数据库访问

#### 创建数据库用户：
1. 在左侧菜单选择 "Database Access"
2. 点击 "Add New Database User"
3. 选择 "Password" 认证方式
4. 设置用户名和密码 (请记住这些信息)
5. 在 "Database User Privileges" 选择 "Read and write to any database"
6. 点击 "Add User"

#### 配置网络访问：
1. 在左侧菜单选择 "Network Access"
2. 点击 "Add IP Address"
3. 选择 "Allow Access from Anywhere" (开发环境)
   - 或者添加您的具体IP地址 (生产环境推荐)
4. 点击 "Confirm"

### 4. 获取连接字符串

1. 回到 "Database" 页面
2. 点击集群的 "Connect" 按钮
3. 选择 "Connect your application"
4. 选择 "Node.js" 和版本 "4.1 or later"
5. 复制连接字符串，格式类似：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 5. 配置环境变量

在 `backend/.env` 文件中设置：
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/meihuaxinyi?retryWrites=true&w=majority
```

**注意**：
- 将 `<username>` 替换为您创建的数据库用户名
- 将 `<password>` 替换为您设置的密码
- 在连接字符串末尾添加数据库名称 `/meihuaxinyi`

## 🧪 测试数据库连接

### 运行连接测试

```bash
# 进入后端目录
cd backend

# 运行基础测试
npm run db:test

# 运行完整测试 (推荐)
npm run db:test-v2
```

### 预期输出

成功连接时应该看到：
```
🧪 梅花心易数据库连接测试 v2.0
==================================================

🔍 1. 验证环境配置...
📡 连接字符串: mongodb://***:***@localhost:27017/meihuaxinyi
🌐 连接类型: 本地数据库
✅ 环境配置验证通过

🔗 2. 测试数据库连接...
✅ 连接成功 (45ms)
📊 数据库: meihuaxinyi
🏠 主机: localhost
🔌 端口: 27017
📈 连接状态: 已连接

🔧 3. 测试基本操作...
🏓 Ping: ✅ 成功
📁 集合数量: 0
✅ 写入测试: 成功
✅ 读取测试: 成功
✅ 删除测试: 成功

⚡ 4. 性能测试...
📊 平均延迟: 12.40ms
🚀 延迟优秀 (< 50ms)
💾 数据大小: 0 Bytes
🗄️ 存储大小: 0 Bytes
📇 索引数量: 0

✅ 所有测试通过！
⏱️ 总耗时: 234ms

👋 数据库连接已关闭
```

## 🔧 常见问题排除

### 1. 连接被拒绝 (ECONNREFUSED)

**本地MongoDB**：
- 确认MongoDB服务是否启动
- 检查端口27017是否被占用
- 尝试重启MongoDB服务

**MongoDB Atlas**：
- 检查网络访问设置
- 确认IP地址是否在白名单中
- 检查防火墙设置

### 2. 认证失败 (Authentication failed)

- 检查用户名和密码是否正确
- 确认用户是否有数据库访问权限
- 检查连接字符串格式

### 3. 服务器选择超时 (Server selection timed out)

- 检查网络连接
- 确认连接字符串是否正确
- 尝试增加超时时间

### 4. DNS解析失败 (ENOTFOUND)

**MongoDB Atlas**：
- 检查集群是否正常运行
- 确认连接字符串中的集群地址正确
- 尝试使用不同的网络环境

## 📊 性能优化建议

### 开发环境
- 使用本地MongoDB以获得最佳性能
- 启用MongoDB日志记录以便调试
- 定期清理测试数据

### 生产环境
- 使用MongoDB Atlas的付费层获得更好性能
- 配置适当的读写关注级别
- 启用连接池和索引优化
- 设置监控和告警

## 🔒 安全最佳实践

1. **强密码策略**：使用复杂的数据库密码
2. **网络限制**：仅允许必要的IP地址访问
3. **最小权限原则**：为应用创建专用的数据库用户
4. **定期备份**：设置自动备份策略
5. **监控访问**：启用访问日志和异常监控

## 📚 相关资源

- [MongoDB官方文档](https://docs.mongodb.com/)
- [MongoDB Atlas文档](https://docs.atlas.mongodb.com/)
- [Mongoose文档](https://mongoosejs.com/docs/)
- [Node.js MongoDB驱动文档](https://mongodb.github.io/node-mongodb-native/)

---

如果您在配置过程中遇到问题，请参考故障排除部分或查阅相关文档。
