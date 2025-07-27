@echo off
chcp 65001 >nul
title 梅花心易占卜应用 - 本地服务器

echo.
echo ========================================
echo   梅花心易占卜应用 - 本地开发服务器
echo ========================================
echo.

cd /d "%~dp0"

echo 🚀 正在启动本地HTTP服务器...
echo 📁 服务目录: %CD%
echo 🌐 服务地址: http://localhost:8000
echo 📱 应用入口: http://localhost:8000/index.html
echo.

REM 检查Python是否可用
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到Python，请先安装Python 3.x
    echo 💡 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python已找到
echo 💡 提示: 使用 Ctrl+C 停止服务器
echo.

REM 启动Python HTTP服务器
python -m http.server 8000

pause
