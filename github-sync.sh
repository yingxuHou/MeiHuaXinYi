#!/bin/bash

# 梅花心易项目GitHub同步脚本
# 使用方法: ./github-sync.sh YOUR_GITHUB_USERNAME

# 检查参数
if [ $# -eq 0 ]; then
    echo "❌ 错误: 请提供GitHub用户名"
    echo "使用方法: ./github-sync.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="meihua-xinyi"

echo "🚀 开始同步梅花心易项目到GitHub..."
echo "📝 GitHub用户名: $GITHUB_USERNAME"
echo "📦 仓库名称: $REPO_NAME"
echo ""

# 检查是否已经是Git仓库
if [ ! -d ".git" ]; then
    echo "📁 初始化Git仓库..."
    git init
    echo "✅ Git仓库初始化完成"
else
    echo "📁 检测到已存在的Git仓库"
fi

# 检查是否有远程仓库
if git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 检测到已存在的远程仓库"
    EXISTING_REMOTE=$(git remote get-url origin)
    echo "   当前远程仓库: $EXISTING_REMOTE"
    
    read -p "是否要更新远程仓库地址? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
        echo "✅ 远程仓库地址已更新"
    fi
else
    echo "🔗 添加远程仓库..."
    git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
    echo "✅ 远程仓库添加完成"
fi

# 检查当前分支名称
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "" ]; then
    echo "🌿 当前分支: $CURRENT_BRANCH"
    echo "🔄 重命名分支为main..."
    git branch -M main
    echo "✅ 分支重命名完成"
elif [ "$CURRENT_BRANCH" == "" ]; then
    echo "🌿 设置默认分支为main..."
    git checkout -b main
    echo "✅ 默认分支设置完成"
fi

# 添加文件到暂存区
echo "📝 添加文件到暂存区..."
git add .

# 检查是否有文件需要提交
if git diff --staged --quiet; then
    echo "ℹ️  没有新的文件需要提交"
else
    echo "💾 提交文件..."
    git commit -m "feat: 初始化梅花心易项目

- 添加前端原型文件（HTML/CSS/JS）
- 添加项目文档（PRD、用户故事地图等）
- 添加开发任务清单
- 包含完整的星空主题UI设计
- 添加GitHub同步配置文件"
    echo "✅ 文件提交完成"
fi

# 推送到GitHub
echo "🚀 推送代码到GitHub..."
if git push -u origin main; then
    echo "✅ 代码推送成功!"
    echo ""
    echo "🎉 GitHub仓库同步完成!"
    echo "📍 仓库地址: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "📋 后续步骤:"
    echo "1. 访问 https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "2. 检查仓库内容是否正确"
    echo "3. 设置仓库描述和标签"
    echo "4. 邀请团队成员协作"
    echo "5. 设置分支保护规则"
    echo ""
    echo "🔧 开发分支创建:"
    echo "   git checkout -b develop"
    echo "   git push -u origin develop"
else
    echo "❌ 推送失败!"
    echo ""
    echo "🔍 可能的原因:"
    echo "1. GitHub仓库不存在，请先在GitHub上创建仓库"
    echo "2. 没有推送权限，请检查GitHub认证"
    echo "3. 网络连接问题"
    echo ""
    echo "📝 手动创建GitHub仓库步骤:"
    echo "1. 访问 https://github.com/new"
    echo "2. 仓库名称: $REPO_NAME"
    echo "3. 描述: 梅花心易 - 基于传统梅花易数的AI智能占卜决策助手"
    echo "4. 选择Public或Private"
    echo "5. 不要勾选任何初始化选项"
    echo "6. 点击Create repository"
    echo "7. 重新运行此脚本"
fi
