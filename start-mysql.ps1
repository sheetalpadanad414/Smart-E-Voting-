# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires administrator privileges." -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting MySQL Server..." -ForegroundColor Green

try {
    Start-Service -Name "MYSQL80"
    Write-Host "✓ MySQL started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to backend folder: cd backend" -ForegroundColor White
    Write-Host "2. Start backend server: npm run dev" -ForegroundColor White
    Write-Host "3. Your login should now work!" -ForegroundColor White
} catch {
    Write-Host "✗ Failed to start MySQL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try these alternatives:" -ForegroundColor Yellow
    Write-Host "1. Open Services (services.msc) and start MYSQL80 manually" -ForegroundColor White
    Write-Host "2. Check if MySQL is installed correctly" -ForegroundColor White
    Write-Host "3. Restart your computer and try again" -ForegroundColor White
}

Read-Host "Press Enter to continue"