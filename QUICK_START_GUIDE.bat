@echo off
REM Smart E-Voting System - Quick Start Testing Guide for Windows

setlocal enabledelayedexpansion

cls
echo.
echo ========================================
echo Smart E-Voting - Quick Start Guide
echo ========================================
echo.

REM Check Node.js
echo Checking prerequisites...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    pause
    exit /b 1
)
echo [OK] Node.js installed

REM Check npm
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)
echo [OK] npm installed
echo.

REM Check MySQL
where mysql >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MySQL not found in PATH
    echo           Make sure MySQL server is running
) else (
    echo [OK] MySQL found
)
echo.

REM Install dependencies
if exist "backend\node_modules" (
    echo [OK] Backend dependencies already installed
) else (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo [OK] Dependencies installed
)
echo.

REM Check .env file
if exist "backend\.env" (
    echo [OK] .env file exists
) else (
    echo [WARNING] .env file not found
    if exist "backend\.env.example" (
        echo Creating .env from template...
        copy backend\.env.example backend\.env
        echo [OK] .env created
    ) else (
        echo [ERROR] .env.example not found
    )
)
echo.

REM Display next steps
echo ========================================
echo NEXT STEPS
echo ========================================
echo.
echo 1. Make sure MySQL is running
echo    - Windows: Services ^> MySQL ^> Start
echo    - Or: net start MySQL80 ^(if installed^)
echo.
echo 2. Initialize database (first time only):
echo    cd backend
echo    node config/initDatabase.js
echo    cd ..
echo.
echo 3. Start backend server:
echo    cd backend
echo    npm start
echo.
echo 4. In another terminal, run tests:
echo    cd backend
echo    node testAuthIntegration.js
echo.
echo 5. Or run interactive test:
echo    cd backend
echo    node testAuthFlow.js
echo.
echo 6. Test frontend:
echo    Open http://localhost:3000/register
echo    - Select role
echo    - Fill form
echo    - Enter OTP from backend console
echo.

echo ========================================
echo What Was Fixed
echo ========================================
echo.
echo [FIXED] Register.jsx - Populated roles array
echo [FIXED] Login flow - Now sends OTP
echo [FIXED] ResendOTP - Using OTP model
echo [FIXED] User model - Removed duplicate methods
echo [FIXED] Role-specific fields - Department, designation
echo.

echo ========================================
echo Configuration
echo ========================================
echo.
echo Check backend\.env settings:
echo   - DB_HOST=localhost
echo   - DB_USER=root
echo   - DB_NAME=smart_voting_db
echo   - Email configuration (optional for basic testing)
echo.

echo ========================================
echo Support
echo ========================================
echo.
echo See documentation for details:
echo   - FIX_SUMMARY.md
echo   - QUICK_FIX_REFERENCE.md
echo   - AUTH_FIXES_DOCUMENTATION.md
echo.

pause
