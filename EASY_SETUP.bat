@echo off
title Sun Festival Carpool - Easy Setup
color 0A
echo.
echo ========================================
echo   SUN FESTIVAL CARPOOL - EASY SETUP
echo ========================================
echo.
echo This will install and run your carpool website with one click!
echo Please wait while we set everything up...
echo.

REM Kill any existing Node.js processes to avoid conflicts
echo Stopping any running services...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Install main project dependencies
echo Installing main project dependencies...
call npm install --silent
if %errorlevel% neq 0 (
    echo ERROR: Failed to install main dependencies. Make sure Node.js is installed.
    echo Download Node.js from: https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Main dependencies installed

REM Install client dependencies
echo Installing website dependencies...
cd client
call npm install --silent
if %errorlevel% neq 0 (
    echo ERROR: Failed to install website dependencies
    pause
    exit /b 1
)
echo ✓ Website dependencies installed

cd ..

echo.
echo ========================================
echo        STARTING SUN FESTIVAL CARPOOL
echo ========================================
echo.
echo ✓ Setup complete! Starting your website...
echo.
echo WEBSITE INFORMATION:
echo - Main Website: http://localhost:3000
echo - Admin Panel: http://localhost:3000/admin/login
echo - Admin Login: admin@sunfestival.com
echo - Admin Password: admin123
echo.
echo IMPORTANT: Keep this window open while using the website!
echo To stop the website, close this window or press Ctrl+C
echo.

REM Start server in background
echo Starting server...
start /min "Sun Festival Server" cmd /c "node server/index.js"
timeout /t 3 /nobreak >nul

REM Open website in browser
echo Opening website in your browser...
start "" http://localhost:3000

REM Start client (this keeps the window open)
echo Starting website interface...
cd client
npm start 