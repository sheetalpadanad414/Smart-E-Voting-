@echo off
echo ============================================
echo Fixing Port 5000 Issue
echo ============================================
echo.

echo Finding process using port 5000...
netstat -ano | findstr :5000

echo.
echo If you see a process above, note the PID (last number)
echo.
set /p pid="Enter the PID to kill (or press Enter to skip): "

if "%pid%"=="" (
    echo Skipped killing process
) else (
    echo Killing process %pid%...
    taskkill /PID %pid% /F
    echo Process killed!
)

echo.
echo ============================================
echo Port 5000 should now be free
echo ============================================
echo.
echo You can now run: node serverSimple.js
pause
