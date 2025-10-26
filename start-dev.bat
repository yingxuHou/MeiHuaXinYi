@echo off
chcp 65001 >nul
title 梅花心易 - 开发环境启动器

echo.
echo 🌟 梅花心易 - 开发环境启动器
echo ==================================================
echo.

:: 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    echo 📥 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查npm是否可用
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: npm不可用
    pause
    exit /b 1
)

:: 检查项目目录
if not exist "backend" (
    echo ❌ 错误: backend目录不存在
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ 错误: frontend目录不存在
    pause
    exit /b 1
)

if not exist "backend\package.json" (
    echo ❌ 错误: backend\package.json不存在
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ❌ 错误: frontend\package.json不存在
    pause
    exit /b 1
)

echo ✅ 环境检查通过
echo.

:: 使用Node.js脚本启动
echo 🚀 启动开发环境...
node start-dev.js

pause
