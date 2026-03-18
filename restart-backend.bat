@echo off
echo ========================================
echo Restarting Backend Server
echo ========================================
echo.

echo Killing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo Killing PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Starting backend server...
cd backend
start cmd /k "npm run dev"

echo.
echo ========================================
echo Backend server is starting...
echo Check the new window for server status
echo ========================================
pause
