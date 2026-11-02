@echo off
title Launch Retail AI Prediction Platform
echo ===================================================
echo Starting Retail AI Analytics and Prediction Server
echo ===================================================

echo [1/2] Starting FastAPI Backend on port 8000...
start "Retail AI Backend (Port 8000)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting React Vite Frontend on port 5173...
start "Retail AI Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 0.0.0.0 --port 5173"

timeout /t 3 >nul
start http://localhost:5173

echo.
echo Both servers have been launched!
echo UI URL: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo Login: admin / admin123
echo.
pause
