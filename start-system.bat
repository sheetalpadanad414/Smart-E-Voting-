@echo off
echo ============================================
echo Smart E-Voting System - Complete Startup
echo ============================================
echo.

echo Step 1: Killing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo.

echo Step 2: Resetting admin account...
cd backend
node resetAdminAccount.js
echo.

echo Step 3: Ensuring database tables exist...
node create-missing-tables.js
echo.

echo Step 4: Starting backend server...
start "Backend Server" cmd /k "npm run dev"
echo.

echo Step 5: Waiting for backend to start...
timeout /t 5 /nobreak >nul
echo.

echo ============================================
echo System Started Successfully!
echo ============================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Login with:
echo Email: admin@evoting.com
echo Password: admin123
echo.
pause
