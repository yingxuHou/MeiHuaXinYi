@echo off
title Meihua Xinyi Production Server

echo.
echo ================================================
echo  Meihua Xinyi - Production Environment Startup
echo ================================================
echo.

echo [1/3] Building frontend...
cd frontend
npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Frontend build failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo Frontend build completed successfully.
echo.

echo [2/3] Building backend...
cd ..\backend
npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Backend build failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo Backend build completed successfully.
echo.

echo [3/3] Starting production server...
echo.
echo ================================================
echo  Server will start at: http://localhost:3000
echo  Press Ctrl+C to stop the server
echo ================================================
echo.

npm run start:prod
