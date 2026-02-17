@echo off
echo Starting MySQL Server...
net start MYSQL80
if %errorlevel% == 0 (
    echo MySQL started successfully!
    echo You can now run: npm run dev in the backend folder
) else (
    echo Failed to start MySQL. Please run this file as Administrator.
    echo Right-click on start-mysql.bat and select "Run as administrator"
)
pause