@echo off
title AI Retail Analytics Platform Runner
echo ========================================================
echo   AI Retail Analytics Platform - Startup Script
echo ========================================================
echo.

echo [1/3] Checking environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH.
    pause
    exit /b 1
)

echo [2/3] Starting FastAPI Backend on port 8000...
start "RetailAI Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [3/3] Starting React Frontend on port 5173...
start "RetailAI Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 0.0.0.0 --port 5173"

echo.
echo ========================================================
echo   Both services are starting!
echo.
echo   Frontend UI:  http://localhost:5173
echo   Backend API:  http://localhost:8000/api/v1
echo   Swagger Docs: http://localhost:8000/docs
echo.
echo   Login: admin / admin123
echo ========================================================
echo.
timeout /t 5 >nul
start http://localhost:5173
