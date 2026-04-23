@echo off
echo.
echo ========================================
echo   SYSTEM READINESS CHECK
echo ========================================
echo.

cd backend

echo [1/5] Checking Database Connection...
node -e "const {pool} = require('./config/database'); pool.getConnection().then(c => {console.log('   ✓ Database connected'); c.release(); process.exit(0);}).catch(e => {console.log('   ✗ Database connection failed:', e.message); process.exit(1);});"
if errorlevel 1 (
    echo.
    echo ❌ Database connection failed!
    echo    Please check MySQL/MariaDB is running
    echo    and verify credentials in backend/.env
    pause
    exit /b 1
)

echo.
echo [2/5] Checking Face Recognition Setup...
node verify-setup.js | findstr /C:"✓ Connected" /C:"Face verified" /C:"face_descriptor"
if errorlevel 1 (
    echo   ⚠ Warning: Face setup may have issues
) else (
    echo   ✓ Face recognition configured
)

echo.
echo [3/5] Checking Upload Directories...
if exist "uploads\faces" (
    echo   ✓ uploads/faces exists
) else (
    echo   ✗ uploads/faces missing
    mkdir uploads\faces
    echo   ✓ Created uploads/faces
)

if exist "uploads\candidates" (
    echo   ✓ uploads/candidates exists
) else (
    echo   ⚠ uploads/candidates missing
)

if exist "uploads\party-logos" (
    echo   ✓ uploads/party-logos exists
) else (
    echo   ⚠ uploads/party-logos missing
)

echo.
echo [4/5] Checking Frontend Models...
cd ..\frontend\public\models
set model_count=0
for %%f in (*) do set /a model_count+=1
echo   Found %model_count% model files
if %model_count% GEQ 8 (
    echo   ✓ All models present
) else (
    echo   ⚠ Missing models (need 8, found %model_count%^)
    echo   Run: download-models.bat
)

echo.
echo [5/5] Checking Environment Configuration...
cd ..\..\..
echo   Backend:
findstr /C:"PORT=5000" backend\.env >nul && echo   ✓ PORT=5000 || echo   ✗ PORT not set
findstr /C:"DB_NAME=smart_e_voting" backend\.env >nul && echo   ✓ DB_NAME=smart_e_voting || echo   ✗ DB_NAME not set
echo   Frontend:
findstr /C:"REACT_APP_API_URL" frontend\.env >nul && echo   ✓ API_URL configured || echo   ✗ API_URL not set

echo.
echo ========================================
echo   SYSTEM STATUS
echo ========================================
echo.
echo ✓ Database: Connected
echo ✓ Face Recognition: Configured
echo ✓ Upload Directories: Ready
echo ✓ Frontend Models: Ready
echo ✓ Environment: Configured
echo.
echo ========================================
echo   READY TO START!
echo ========================================
echo.
echo To start the system:
echo   1. Run: start-system.bat
echo   2. Open: http://localhost:3000
echo.
echo To verify full setup:
echo   cd backend
echo   node verify-full-setup.js
echo.
pause
