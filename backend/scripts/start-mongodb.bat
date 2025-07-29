@echo off
echo 🍃 启动MongoDB服务...

REM 检查MongoDB服务是否已经运行
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% == 0 (
    echo ✅ MongoDB服务已经在运行
    goto :end
)

REM 尝试启动MongoDB服务
echo 📡 正在启动MongoDB服务...
net start MongoDB
if %errorlevel% == 0 (
    echo ✅ MongoDB服务启动成功
) else (
    echo ❌ MongoDB服务启动失败，可能需要管理员权限
    echo 💡 请以管理员身份运行此脚本，或手动启动MongoDB服务
    echo 💡 命令：net start MongoDB
)

:end
pause
