# 梅花心易项目GitHub仓库同步指导文档

## 📋 项目结构说明

### 当前项目结构
```
MeiHuaXinYi/
├── design/                          # 设计文档和原型
│   ├── prototypes/                  # 前端原型文件
│   │   ├── css/                     # 样式文件
│   │   │   └── starry-theme.css     # 星空主题样式
│   │   ├── js/                      # JavaScript文件
│   │   │   ├── app-core.js          # 应用核心
│   │   │   ├── app-state.js         # 状态管理
│   │   │   ├── router.js            # 路由管理
│   │   │   └── utils.js             # 工具函数
│   │   ├── *.html                   # 各页面原型
│   │   ├── server.js                # 本地服务器
│   │   ├── start-server.py          # 启动脚本
│   │   └── *.md                     # 原型说明文档
│   ├── Flowchart.md                 # 流程图文档
│   └── README.md                    # 设计说明
├── docs/                            # 项目文档
│   ├── PRD.md                       # 产品需求文档
│   ├── PRD_MVP.md                   # MVP版本需求
│   ├── Roadmap.md                   # 产品路线图
│   ├── User_Story_Map.md            # 用户故事地图
│   ├── Metrics_Framework.md         # 指标框架
│   └── *.md                         # 其他分析文档
├── 梅花心易前端开发项目执行任务进度清单v1v0726.md
└── 梅花心易后端+数据库开发项目执行任务进度清单v1v0726.md
```

## 🚀 GitHub仓库同步步骤

### 步骤1：初始化Git仓库

```bash
# 进入项目根目录
cd /path/to/MeiHuaXinYi

# 初始化Git仓库
git init

# 查看当前状态
git status
```

**作用说明**：
- `git init` 在当前目录创建一个新的Git仓库
- `git status` 显示工作区和暂存区的状态

### 步骤2：创建.gitignore文件

```bash
# 创建.gitignore文件
touch .gitignore
```

**.gitignore文件内容**：
```gitignore
# 操作系统生成的文件
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE和编辑器文件
.vscode/
.idea/
*.swp
*.swo
*~

# 日志文件
*.log
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 依赖目录（如果后续添加）
node_modules/
bower_components/

# 构建输出目录
dist/
build/
out/

# 环境配置文件
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 缓存文件
.cache/
.parcel-cache/

# 临时文件
tmp/
temp/

# 备份文件
*.bak
*.backup
*.old

# 压缩文件
*.zip
*.tar.gz
*.rar

# 本地测试文件
test-local/
local-test/

# Python缓存（针对start-server.py）
__pycache__/
*.py[cod]
*$py.class
```

### 步骤3：添加和提交文件

```bash
# 添加.gitignore文件
git add .gitignore

# 提交.gitignore
git commit -m "feat: 添加.gitignore文件"

# 添加所有项目文件
git add .

# 查看将要提交的文件
git status

# 提交所有文件
git commit -m "feat: 初始化梅花心易项目

- 添加前端原型文件（HTML/CSS/JS）
- 添加项目文档（PRD、用户故事地图等）
- 添加开发任务清单
- 包含完整的星空主题UI设计"
```

**作用说明**：
- `git add` 将文件添加到暂存区
- `git commit` 将暂存区的文件提交到本地仓库
- 使用规范的提交信息格式

### 步骤4：在GitHub上创建新仓库

#### 推荐仓库信息：
- **仓库名称**: `meihua-xinyi`
- **描述**: `梅花心易 - 基于传统梅花易数的AI智能占卜决策助手 | MeiHua XinYi - AI-powered divination app based on traditional Chinese I Ching`
- **可见性**: Public（如果要开源）或 Private（如果是私有项目）

#### GitHub网页操作：
1. 登录GitHub账号
2. 点击右上角的"+"号，选择"New repository"
3. 填写仓库信息：
   - Repository name: `meihua-xinyi`
   - Description: 上述描述
   - 选择Public或Private
   - **不要**勾选"Add a README file"（因为我们已有文件）
   - **不要**勾选"Add .gitignore"（我们已创建）
   - **不要**选择License（可后续添加）
4. 点击"Create repository"

### 步骤5：连接本地仓库到GitHub

```bash
# 添加远程仓库（替换YOUR_USERNAME为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/meihua-xinyi.git

# 查看远程仓库配置
git remote -v

# 推送代码到GitHub（首次推送）
git push -u origin main
```

**如果遇到分支名称问题**：
```bash
# 如果默认分支是master，重命名为main
git branch -M main

# 然后再推送
git push -u origin main
```

**作用说明**：
- `git remote add origin` 添加远程仓库地址
- `git push -u origin main` 推送代码并设置上游分支

## 🌿 分支结构建议

### 推荐分支策略

```bash
# 创建并切换到develop分支
git checkout -b develop

# 推送develop分支到远程
git push -u origin develop

# 创建功能分支示例
git checkout -b feature/frontend-vue-setup
git checkout -b feature/backend-api-design
git checkout -b feature/ui-optimization

# 创建发布分支示例
git checkout -b release/v1.0.0
```

### 分支说明：
- **main**: 稳定的生产版本，只接受来自release分支的合并
- **develop**: 开发主分支，集成所有功能分支
- **feature/***: 功能开发分支，从develop分支创建
- **release/***: 发布准备分支，从develop分支创建
- **hotfix/***: 紧急修复分支，从main分支创建

## 📖 README.md文件创建

```bash
# 创建README.md文件
touch README.md
```

**README.md内容建议**：
```markdown
# 梅花心易 (MeiHua XinYi)

> 基于传统梅花易数的AI智能占卜决策助手

## 🎯 项目简介

梅花心易是一款结合传统易学智慧与现代AI技术的智能占卜应用，专注于为用户在人生选择中提供指引和决策支持。

### 核心特色
- 🔮 **专业算法**: 基于正宗梅花易数算法
- 🤖 **AI解读**: Claude AI提供个性化解读
- 🌟 **星空主题**: 神秘优雅的用户界面
- 📱 **移动优先**: 专为移动端优化设计

## 🏗️ 项目结构

```
├── design/prototypes/    # 前端原型文件
├── docs/                # 项目文档
├── frontend/            # Vue.js前端项目（待开发）
├── backend/             # Node.js后端项目（待开发）
└── README.md           # 项目说明
```

## 🚀 快速开始

### 查看原型
```bash
cd design/prototypes
python start-server.py
# 访问 http://localhost:8000
```

### 开发环境搭建
详见开发任务清单：
- [前端开发任务清单](./梅花心易前端开发项目执行任务进度清单v1v0726.md)
- [后端开发任务清单](./梅花心易后端+数据库开发项目执行任务进度清单v1v0726.md)

## 📚 文档

- [产品需求文档 (PRD)](./docs/PRD.md)
- [MVP版本需求](./docs/PRD_MVP.md)
- [产品路线图](./docs/Roadmap.md)
- [用户故事地图](./docs/User_Story_Map.md)

## 🛠️ 技术栈

### 前端
- Vue.js 3 + Vite
- Element Plus
- TailwindCSS
- Pinia (状态管理)

### 后端
- Node.js + Express.js
- MongoDB + Redis
- JWT认证
- Claude AI API

### 部署
- Sealos DevBox
- Docker

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- 项目链接: [https://github.com/YOUR_USERNAME/meihua-xinyi](https://github.com/YOUR_USERNAME/meihua-xinyi)
- 问题反馈: [Issues](https://github.com/YOUR_USERNAME/meihua-xinyi/issues)
```

```bash
# 添加README.md
git add README.md
git commit -m "docs: 添加项目README文档"
git push origin main
```

## 👥 团队协作设置

### 1. 邀请团队成员

在GitHub仓库页面：
1. 点击"Settings"标签
2. 选择"Manage access"
3. 点击"Invite a collaborator"
4. 输入团队成员的GitHub用户名或邮箱

### 2. 设置分支保护规则

```bash
# 在GitHub网页端设置：
# Settings → Branches → Add rule
```

推荐保护规则：
- 保护main分支
- 要求Pull Request审查
- 要求状态检查通过
- 限制推送到匹配分支

### 3. 设置Issue和Project模板

创建`.github`目录：
```bash
mkdir .github
mkdir .github/ISSUE_TEMPLATE
mkdir .github/workflows
```

### 4. 团队工作流程

```bash
# 团队成员克隆仓库
git clone https://github.com/YOUR_USERNAME/meihua-xinyi.git
cd meihua-xinyi

# 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 开发完成后
git add .
git commit -m "feat: 添加新功能"
git push origin feature/your-feature-name

# 在GitHub上创建Pull Request
```

## 🔄 后续维护

### 定期同步
```bash
# 获取最新代码
git fetch origin
git checkout main
git pull origin main

# 更新develop分支
git checkout develop
git pull origin develop
```

### 版本标签
```bash
# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

**注意事项**：
1. 替换所有`YOUR_USERNAME`为实际的GitHub用户名
2. 根据实际情况调整仓库名称和描述
3. 确保团队成员都了解Git工作流程
4. 定期备份重要分支
5. 使用规范的提交信息格式

这个指导文档涵盖了从初始化到团队协作的完整流程，您可以按照步骤逐一执行。
