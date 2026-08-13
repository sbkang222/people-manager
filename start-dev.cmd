@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting People Manager...
echo Open http://localhost:3000 in your browser.
call npm.cmd run dev
