@echo off
echo ========================================
echo Voter Tracking Feature Setup
echo ========================================
echo.

echo Step 1: Running database migration...
cd backend
node migrations/add-voter-tracking-fields.js
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Migration failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Testing implementation...
node test-voter-tracking.js
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Tests failed!
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& npm run dev
echo 2. Start frontend: cd frontend ^&^& npm start
echo 3. Login as admin and go to /admin/voters
echo.
pause
