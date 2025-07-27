@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 梅花心易项目GitHub同步脚本 (Windows版本)
:: 使用方法: github-sync.bat YOUR_GITHUB_USERNAME

if "%1"=="" (
    echo ❌ 错误: 请提供GitHub用户名
    echo 使用方法: github-sync.bat YOUR_GITHUB_USERNAME
    pause
    exit /b 1
)

set GITHUB_USERNAME=%1
set REPO_NAME=meihua-xinyi

echo 🚀 开始同步梅花心易项目到GitHub...
echo 📝 GitHub用户名: %GITHUB_USERNAME%
echo 📦 仓库名称: %REPO_NAME%
echo.

:: 检查是否已经是Git仓库
if not exist ".git" (
    echo 📁 初始化Git仓库...
    git init
    if !errorlevel! equ 0 (
        echo ✅ Git仓库初始化完成
    ) else (
        echo ❌ Git仓库初始化失败
        pause
        exit /b 1
    )
) else (
    echo 📁 检测到已存在的Git仓库
)

:: 检查是否有远程仓库
git remote get-url origin >nul 2>&1
if !errorlevel! equ 0 (
    echo 🔗 检测到已存在的远程仓库
    for /f "delims=" %%i in ('git remote get-url origin') do set EXISTING_REMOTE=%%i
    echo    当前远程仓库: !EXISTING_REMOTE!
    
    set /p UPDATE_REMOTE="是否要更新远程仓库地址? (y/N): "
    if /i "!UPDATE_REMOTE!"=="y" (
        git remote set-url origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
        echo ✅ 远程仓库地址已更新
    )
) else (
    echo 🔗 添加远程仓库...
    git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
    if !errorlevel! equ 0 (
        echo ✅ 远程仓库添加完成
    ) else (
        echo ❌ 远程仓库添加失败
        pause
        exit /b 1
    )
)

:: 检查当前分支名称
for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set CURRENT_BRANCH=%%i
if not "!CURRENT_BRANCH!"=="main" (
    if not "!CURRENT_BRANCH!"=="" (
        echo 🌿 当前分支: !CURRENT_BRANCH!
        echo 🔄 重命名分支为main...
        git branch -M main
        echo ✅ 分支重命名完成
    ) else (
        echo 🌿 设置默认分支为main...
        git checkout -b main
        echo ✅ 默认分支设置完成
    )
)

:: 添加文件到暂存区
echo 📝 添加文件到暂存区...
git add .

:: 检查是否有文件需要提交
git diff --staged --quiet
if !errorlevel! equ 0 (
    echo ℹ️  没有新的文件需要提交
) else (
    echo 💾 提交文件...
    git commit -m "feat: 初始化梅花心易项目

- 添加前端原型文件（HTML/CSS/JS）
- 添加项目文档（PRD、用户故事地图等）
- 添加开发任务清单
- 包含完整的星空主题UI设计
- 添加GitHub同步配置文件"
    if !errorlevel! equ 0 (
        echo ✅ 文件提交完成
    ) else (
        echo ❌ 文件提交失败
        pause
        exit /b 1
    )
)

:: 推送到GitHub
echo 🚀 推送代码到GitHub...
git push -u origin main
if !errorlevel! equ 0 (
    echo ✅ 代码推送成功!
    echo.
    echo 🎉 GitHub仓库同步完成!
    echo 📍 仓库地址: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
    echo.
    echo 📋 后续步骤:
    echo 1. 访问 https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
    echo 2. 检查仓库内容是否正确
    echo 3. 设置仓库描述和标签
    echo 4. 邀请团队成员协作
    echo 5. 设置分支保护规则
    echo.
    echo 🔧 开发分支创建:
    echo    git checkout -b develop
    echo    git push -u origin develop
) else (
    echo ❌ 推送失败!
    echo.
    echo 🔍 可能的原因:
    echo 1. GitHub仓库不存在，请先在GitHub上创建仓库
    echo 2. 没有推送权限，请检查GitHub认证
    echo 3. 网络连接问题
    echo.
    echo 📝 手动创建GitHub仓库步骤:
    echo 1. 访问 https://github.com/new
    echo 2. 仓库名称: %REPO_NAME%
    echo 3. 描述: 梅花心易 - 基于传统梅花易数的AI智能占卜决策助手
    echo 4. 选择Public或Private
    echo 5. 不要勾选任何初始化选项
    echo 6. 点击Create repository
    echo 7. 重新运行此脚本
)

echo.
pause
