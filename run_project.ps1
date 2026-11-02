# PowerShell Launcher for AI Retail Analytics Platform
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  AI Retail Analytics Platform - Startup Script" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "[2/2] Launching React Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "cd '$ScriptDir\frontend'; npm.cmd run dev -- --host 0.0.0.0 --port 5173"

Write-Host ""
Write-Host "Services are live!" -ForegroundColor Green
Write-Host "Frontend Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "Swagger API Docs:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "Default Login:      admin / admin123" -ForegroundColor White
Write-Host ""

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
