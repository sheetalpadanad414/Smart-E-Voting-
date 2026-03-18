@echo off
echo ========================================
echo Fixing Port 5000 Issue
echo ========================================
echo.

echo Checking for processes using port 5000...
netstat -ano | findstr :5000

echo.
echo Killing all processes on port 5000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Verifying port is free...
timeout /t 2 /nobreak >nul

netstat -ano | findstr :5000
if %errorlevel% equ 0 (
    echo.
    echo WARNING: Port 5000 still in use. Trying again...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        taskkill /F /PID %%a 2>nul
    )
) else (
    echo.
    echo SUCCESS: Port 5000 is now free!
)

echo.
echo ========================================
echo You can now start the backend server:
echo   cd backend
echo   npm run dev
echo ========================================
echo.
pause
