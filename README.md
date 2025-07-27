# 梅花心易 (MeiHua XinYi) 🔮

> 基于传统梅花易数的AI智能占卜决策助手

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248?logo=mongodb)](https://www.mongodb.com/)

## 🎯 项目简介

梅花心易是一款结合传统易学智慧与现代AI技术的智能占卜应用，专注于为用户在人生选择中提供指引和决策支持。采用正宗的梅花易数算法，结合Claude AI的智能解读，为用户提供专业、个性化的占卜服务。

### ✨ 核心特色

- 🔮 **专业算法**: 基于正宗梅花易数算法的占卜逻辑
- 🤖 **AI解读**: Claude AI提供个性化、深度的卦象解读
- 🌌 **星空主题**: 神秘优雅的星空主题UI设计
- 📱 **移动优先**: 专为移动端优化的用户体验
- 💎 **小而美**: 专注核心功能，追求极致体验
- 💰 **高性价比**: 亲民的定价策略

### 🎨 界面预览

![星空主题界面](design/prototypes/ui-showcase.html)

## 🏗️ 项目架构

```
MeiHuaXinYi/
├── design/                          # 设计文档和原型
│   ├── prototypes/                  # 前端原型文件
│   │   ├── css/starry-theme.css     # 星空主题样式
│   │   ├── js/                      # JavaScript核心文件
│   │   ├── *.html                   # 页面原型
│   │   └── *.md                     # 原型说明文档
│   └── specs/                       # 设计规范
├── docs/                            # 项目文档
│   ├── PRD.md                       # 产品需求文档
│   ├── PRD_MVP.md                   # MVP版本需求
│   ├── Roadmap.md                   # 产品路线图
│   └── User_Story_Map.md            # 用户故事地图
├── frontend/                        # Vue.js前端项目（开发中）
├── backend/                         # Node.js后端项目（开发中）
├── 梅花心易前端开发项目执行任务进度清单v1v0726.md
├── 梅花心易后端+数据库开发项目执行任务进度清单v1v0726.md
└── README.md
```

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

#### 前端开发
```bash
# 进入前端目录（待创建）
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 后端开发
```bash
# 进入后端目录（待创建）
cd backend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

详细开发指南请参考：
- [前端开发任务清单](./梅花心易前端开发项目执行任务进度清单v1v0726.md)
- [后端开发任务清单](./梅花心易后端+数据库开发项目执行任务进度清单v1v0726.md)

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
- **框架**: Express.js
- **数据库**: MongoDB + Redis
- **认证**: JWT + BCrypt
- **AI服务**: Claude 3.7 Sonnet API
- **部署**: Docker + Sealos DevBox

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
- [⚙️ 后端开发指南](./梅花心易后端+数据库开发项目执行任务进度清单v1v0726.md)

## 🎮 功能特性

### 🔮 核心功能
- **智能占卜**: 基于梅花易数算法的专业占卜
- **AI解读**: Claude AI提供个性化解读
- **卦象展示**: 直观的卦象可视化展示
- **历史记录**: 完整的占卜历史管理

### 👤 用户系统
- **快速注册**: 邮箱注册，简化流程
- **免费体验**: 新用户10次免费占卜
- **用户中心**: 个人信息和设置管理

### 💳 商业功能
- **付费系统**: 微信支付、支付宝集成
- **套餐管理**: 灵活的次数套餐
- **邀请系统**: 邀请好友获得奖励

### 🎨 用户体验
- **星空主题**: 神秘优雅的视觉设计
- **移动优先**: 完美的移动端体验
- **响应式设计**: 适配各种屏幕尺寸
- **流畅动画**: 精心设计的交互动效

## 🚦 开发状态

### 当前进度
- ✅ **产品设计**: 完成PRD和用户故事地图
- ✅ **UI设计**: 完成星空主题原型设计
- ✅ **技术架构**: 完成前后端架构设计
- 🔄 **前端开发**: 进行中 (Vue.js 3)
- 🔄 **后端开发**: 进行中 (Node.js + Express)
- ⏳ **测试部署**: 待开始

### 版本规划
- **v0.1 (MVP)**: 核心占卜功能 (3天开发周期)
- **v0.5 (Beta)**: 商业化功能 (2周开发周期)
- **v1.0**: 完整产品功能
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
- 感谢 Claude AI 提供的智能解读服务
- 感谢开源社区提供的优秀工具和框架

---

<div align="center">

**梅花心易 - 传统智慧与现代科技的完美结合** 🌟

Made with ❤️ by MeiHua XinYi Team

</div>
