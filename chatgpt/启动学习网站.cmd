@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 请先安装 Node.js 22.12 或更高版本，再打开此文件。
  pause
  exit /b 1
)
if not exist node_modules (
  call npm ci
  if errorlevel 1 (
    echo 依赖安装失败，请检查网络并重新尝试。
    pause
    exit /b 1
  )
)
echo 请在浏览器打开下方 Local 地址。关闭本窗口即可停止服务。
call npm run dev:full
pause

