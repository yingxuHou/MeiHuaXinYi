# 梅花心易 (MeiHua XinYi) 🔮

> 基于传统梅花易数的AI智能占卜决策助手

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.17-47A248?logo=mongodb)](https://www.mongodb.com/)
[![DeepSeek](https://img.shields.io/badge/AI-DeepSeek-blue)](https://www.deepseek.com/)

## 🎯 项目简介

梅花心易是一款结合传统易学智慧与现代AI技术的智能占卜应用，专注于为用户在人生选择中提供指引和决策支持。采用正宗的梅花易数算法，结合DeepSeek AI的智能解读，为用户提供专业、个性化的占卜服务。

**项目状态**: v0.5 - 核心功能已完成，正在完善生产环境部署

### ✨ 核心特色

- 🔮 **专业算法**: 基于正宗梅花易数算法的占卜逻辑（本卦、互卦、变卦）
- 🤖 **AI解读**: DeepSeek AI提供个性化、深度的卦象解读
- 🌌 **星空主题**: 神秘优雅的星空主题UI设计
- 📱 **移动优先**: 专为移动端优化的用户体验
- 💎 **小而美**: 专注核心功能，追求极致体验
- 💰 **高性价比**: 亲民的定价策略

### 🎨 界面预览

![星空主题界面](design/prototypes/ui-showcase.html)

## 🏗️ 项目架构

```
MeiHuaXinYi/
├── backend/                         # 后端服务
│   ├── src/
│   │   ├── algorithms/              # 梅花易数算法核心
│   │   │   ├── core/               # 算法核心实现
│   │   │   ├── data/               # 六十四卦数据
│   │   │   └── validators/         # 算法验证器
│   │   ├── ai/                     # AI服务模块
│   │   │   ├── deepseek/          # DeepSeek API
│   │   │   └── rag/                # RAG知识库（建设中）
│   │   ├── models/                 # 数据模型（User, Divination, Conversation, KnowledgeBase）
│   │   ├── controllers/            # 控制器层
│   │   ├── routes/                 # API路由
│   │   ├── services/              # 业务逻辑层
│   │   ├── middleware/             # 中间件（认证、限流、验证）
│   │   └── config/                 # 配置文件（数据库、AI、外部服务）
│   ├── scripts/                    # 工具脚本
│   └── README.md                    # 后端文档
├── frontend/                        # 前端应用
│   ├── src/
│   │   ├── components/             # Vue组件
│   │   │   ├── common/            # 通用组件（MysticalCard, MysticalButton）
│   │   │   ├── divination/        # 占卜组件
│   │   │   └── layout/            # 布局组件
│   │   ├── views/                  # 页面视图
│   │   │   ├── auth/              # 认证页面（登录、注册、资料设置）
│   │   │   ├── divination/        # 占卜页面（输入、加载、结果、历史）
│   │   │   └── user/              # 用户中心
│   │   ├── stores/                # Pinia状态管理（user, divination, app）
│   │   ├── api/                   # API接口封装（auth, divination, user）
│   │   ├── router/                # Vue Router路由配置
│   │   └── utils/                 # 工具函数
│   ├── public/                     # 静态资源
│   └── README.md                   # 前端文档
├── design/                         # 设计文档和原型
├── docs/                           # 项目文档
└── README.md                        # 项目主文档
```

### 核心模块说明

**后端核心模块**:
- **algorithms/**: 完整的梅花易数算法实现，包括本卦、互卦、变卦生成，五行分析，体用关系
- **ai/**: DeepSeek API集成，AI解读服务，RAG知识库（建设中）
- **models/**: MongoDB数据模型（用户、占卜记录、对话记录、知识库）
- **controllers/**: 业务控制器（认证、占卜、用户管理）
- **services/**: 业务逻辑服务（占卜服务、AI解读服务、邮件服务）

**前端核心模块**:
- **stores/**: Pinia状态管理，管理用户状态、占卜状态、应用全局状态
- **api/**: API接口封装，统一管理前后端通信
- **components/**: 可复用Vue组件，包括星空主题UI组件
- **views/**: 页面级组件，完整的占卜流程实现

### 数据库设计

**User模型**: 用户认证、档案、订阅信息
**Divination模型**: 占卜记录、卦象数据、AI解读
**Conversation模型**: AI顾问对话记录（开发中）
**KnowledgeBase模型**: RAG知识库条目（建设中）

## 🚀 快速开始

### 📱 查看原型演示

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/meihua-xinyi.git
cd meihua-xinyi

# 启动原型服务器
cd design/prototypes
python start-server.py

# 访问演示页面
# http://localhost:8000 - 主页
# http://localhost:8000/ui-showcase.html - UI展示
# http://localhost:8000/divination-ui-showcase.html - 占卜界面展示
```

### 🛠️ 开发环境搭建

#### 一键启动（推荐）
```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/meihua-xinyi.git
cd meihua-xinyi

# 安装所有依赖
npm run install:all

# 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env 配置数据库和API密钥

# 一键启动前后端开发环境
npm run dev

# 或使用生产模式
npm run start
```

#### 分别启动
```bash
# 后端开发服务器 (端口 3001)
cd backend
npm install
npm run dev

# 前端开发服务器 (端口 5173)
cd frontend
npm install
npm run dev
```

#### 环境变量配置
在 `backend/.env` 中配置：
```env
# 基础配置
NODE_ENV=development
PORT=3001

# 数据库配置
MONGODB_URI=mongodb+srv://...
REDIS_HOST=localhost
REDIS_PORT=6379

# AI服务配置
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_API_URL=https://api.deepseek.com

# Pinecone向量数据库配置
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-environment
```

详细开发指南请参考：
- [前端开发任务清单](./梅花心易前端开发项目执行任务进度清单v1v0726.md)
- [后端开发任务清单](./梅花心易后端+数据库开发项目执行任务进度清单v3.0_功能模块版.md)
- [技术架构文档](./梅花心易项目技术架构与开发指南.md)

## 🛠️ 技术栈

### 前端技术
- **框架**: Vue.js 3 + Composition API
- **构建工具**: Vite
- **UI组件**: Element Plus (移动端适配)
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **样式**: TailwindCSS + 自定义星空主题
- **图标**: FontAwesome

### 后端技术
- **运行环境**: Node.js 18+
- **框架**: Express.js 5.1
- **数据库**: MongoDB 8.17 + Mongoose 8.17 (MongoDB Atlas云数据库)
- **缓存**: Redis + ioredis (可选)
- **认证**: JWT + BCrypt + Express-validator
- **AI服务**: DeepSeek API + OpenAI Embeddings
- **向量数据库**: Pinecone (RAG知识库)
- **日志**: Winston
- **安全**: Helmet + CORS + Rate Limiting

### 开发工具
- **版本控制**: Git + GitHub
- **代码规范**: ESLint + Prettier
- **测试**: Jest + Vue Test Utils
- **CI/CD**: GitHub Actions

## 📚 项目文档

### 产品文档
- [📋 产品需求文档 (PRD)](./docs/PRD.md)
- [🚀 MVP版本需求](./docs/PRD_MVP.md)
- [🗺️ 产品路线图](./docs/Roadmap.md)
- [👥 用户故事地图](./docs/User_Story_Map.md)
- [📊 指标框架](./docs/Metrics_Framework.md)

### 设计文档
- [🎨 UI设计规范](./design/README.md)
- [🔄 用户流程图](./design/Flowchart.md)
- [🌟 星空主题设计](./design/prototypes/UI_MYSTICAL_UPGRADE_SUMMARY.md)

### 开发文档
- [💻 前端开发指南](./梅花心易前端开发项目执行任务进度清单v1v0726.md)
- [⚙️ 后端开发指南](./梅花心易后端+数据库开发项目执行任务进度清单v3.0_功能模块版.md)
- [🏗️ 技术架构文档](./梅花心易项目技术架构与开发指南.md)
- [🤖 DeepSeek AI实施报告](./backend/DEEPSEEK_AI_COMPLETE_SUMMARY.md)

## 🎮 功能特性

### 🔮 核心功能
- **智能占卜**: 完整的梅花易数算法实现（本卦、互卦、变卦）
- **AI解读**: 基于DeepSeek AI的专业卦象解读
- **五行分析**: 准确的五行生克关系分析
- **卦象展示**: 直观的卦象可视化展示（黄/蓝色区分阴阳）
- **占卜动画**: 流畅的钱币翻转动画效果
- **历史记录**: 完整的占卜历史管理和检索

### 👤 用户系统
- **用户认证**: JWT Token认证，安全可靠
- **用户档案**: 支持生辰八字信息管理
- **订阅系统**: 免费/会员/高级会员分级
- **使用统计**: 完整的使用数据追踪

### 🤖 AI功能
- **即时解读**: 占卜后立即生成AI解读
- **个性化建议**: 基于卦象的针对性建议
- **AI顾问**: 对话式AI顾问系统（开发中）
- **知识库**: RAG检索增强生成（建设中）

### 🎨 用户体验
- **星空主题**: 神秘优雅的视觉设计
- **移动优先**: 完美的移动端体验
- **响应式设计**: 适配各种屏幕尺寸
- **流畅动画**: 精心设计的交互动效
- **错误处理**: 完善的错误提示和降级机制

## 🚦 开发状态

### 当前进度 (2025.10.26)
- ✅ **产品设计**: 完成PRD和用户故事地图
- ✅ **UI设计**: 完成星空主题原型设计
- ✅ **技术架构**: 完成前后端架构设计
- ✅ **后端核心功能**: 完成梅花易数算法、占卜API、AI解读服务
- ✅ **前端基础功能**: 完成占卜流程、占卜动画、卦象展示
- ✅ **AI服务**: 完成DeepSeek API集成，AI解读功能正常
- ✅ **数据库模型**: 完成User、Divination、Conversation、KnowledgeBase模型
- 🔄 **生产模式优化**: 进行中（数据库集成、邮件服务）
- ⏳ **高级功能**: AI顾问、RAG知识库系统建设中

### 版本规划
- **v0.5 (当前)**: 核心占卜功能 + AI解读 ✅ 已完成
- **v0.7 (Beta)**: 完善用户体验 + 生产环境部署 🔄 进行中
- **v1.0**: 完整产品功能 + AI顾问 + 社区功能
- **v1.5**: 体验优化和扩展功能

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

### 开发流程
1. **Fork** 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 **Pull Request**

### 提交规范
使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

### 代码规范
- 遵循 ESLint 和 Prettier 配置
- 编写清晰的注释和文档
- 保持代码简洁和可读性
- 编写必要的单元测试

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) - 查看 LICENSE 文件了解详情

## 📞 联系我们

- **项目地址**: [GitHub Repository](https://github.com/YOUR_USERNAME/meihua-xinyi)
- **问题反馈**: [Issues](https://github.com/YOUR_USERNAME/meihua-xinyi/issues)
- **功能建议**: [Discussions](https://github.com/YOUR_USERNAME/meihua-xinyi/discussions)

## 🙏 致谢

- 感谢传统易学文化的智慧传承
- 感谢 DeepSeek AI 提供的智能解读服务
- 感谢开源社区提供的优秀工具和框架
- 感谢 MongoDB Atlas 提供的云数据库服务

---

## 📊 项目完成度总结 (2025.10.26)

### 已完成功能 ✅
1. **梅花易数占卜算法** - 完整的本卦、互卦、变卦生成系统
2. **AI解读功能** - DeepSeek AI集成，即时生成专业解读
3. **用户认证系统** - JWT认证、注册、登录基础功能
4. **数据库模型** - User、Divination、Conversation、KnowledgeBase模型完整
5. **占卜动画** - 流畅的钱币翻转动画，颜色区分阴阳
6. **API接口** - 完整的RESTful API设计
7. **前端占卜流程** - 问题输入、占卜动画、结果展示、历史记录

### 进行中功能 🔄
1. **生产环境部署** - 数据库完全集成、邮件服务配置
2. **用户系统完善** - 完整的用户档案管理、订阅系统
3. **RAG知识库** - Pinecone向量数据库集成、知识库内容建设
4. **AI顾问功能** - 对话式AI顾问系统开发

### 计划中功能 ⏳
1. **社交功能** - 分享、收藏、评论功能
2. **高级订阅** - 会员特权、AI顾问优先访问
3. **数据分析** - 用户行为分析、个性化推荐
4. **移动端优化** - 原生应用（可选）

---

<div align="center">

**梅花心易 - 传统智慧与现代科技的完美结合** 🌟

Made with ❤️ by MeiHua XinYi Team

**最后更新**: 2025.10.26

</div>
