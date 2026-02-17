@echo off
echo ========================================
echo Smart E-Voting System - Quick Setup
echo ========================================
echo.

echo Step 1: Creating database...
cd backend
node create-database.js
if %errorlevel% neq 0 (
    echo Failed to create database. Make sure MySQL is running.
    pause
    exit /b 1
)

echo.
echo Step 2: Initializing database tables...
node config/initDatabase.js
if %errorlevel% neq 0 (
    echo Failed to initialize database.
    pause
    exit /b 1
)

echo.
echo Step 3: Creating admin user...
node createAdmin.js

echo.
echo Step 4: Creating test voter...
node createTestVoter.js

echo.
echo Step 5: Creating test election...
node createTestElection.js

echo.
echo Step 6: Testing system...
node testVotingSystem.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& npm run dev
echo 2. Start frontend: cd frontend ^&^& npm start
echo 3. Open browser: http://localhost:3000
echo.
echo Login credentials:
echo Admin: admin@evoting.com / admin123
echo Voter: voter@test.com / voter123
echo.
pause
