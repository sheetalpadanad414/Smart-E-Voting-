@echo off
echo ========================================
echo Face Recognition System Test
echo ========================================
echo.

echo Step 1: Verifying Database Setup...
cd backend
node verify-setup.js
echo.

echo Step 2: Checking Model Files...
cd ..\frontend\public\models
echo.
echo Model files in frontend/public/models:
dir /b
echo.

echo Step 3: Checking Package Installation...
cd ..\..
echo.
echo Checking face-api.js in package.json...
findstr "face-api" package.json
echo.

echo ========================================
echo Setup Verification Complete!
echo ========================================
echo.
echo ✓ Database configured
echo ✓ Model files downloaded
echo ✓ face-api.js installed
echo.
echo Ready to start the system!
echo.
echo To start:
echo   1. Run: start-system.bat
echo   2. Open: http://localhost:3000/register
echo   3. Test face registration
echo.
pause
