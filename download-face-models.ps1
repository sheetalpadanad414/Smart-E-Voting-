Write-Host "Downloading face-api.js models..." -ForegroundColor Cyan

$modelsDir = "frontend/public/models"
New-Item -ItemType Directory -Force -Path $modelsDir | Out-Null

$baseUrl = "https://github.com/justadudewhohacks/face-api.js/raw/master/weights"

$files = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
)

$downloaded = 0
$total = $files.Count

foreach ($file in $files) {
    $url = "$baseUrl/$file"
    $output = "$modelsDir/$file"
    
    Write-Host "[$($downloaded + 1)/$total] Downloading $file..." -NoNewline
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -ErrorAction Stop
        Write-Host " Done" -ForegroundColor Green
        $downloaded++
    }
    catch {
        Write-Host " Failed" -ForegroundColor Red
    }
}

Write-Host ""
if ($downloaded -eq $total) {
    Write-Host "All $total models downloaded successfully!" -ForegroundColor Green
}
else {
    Write-Host "Downloaded $downloaded out of $total models" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Add routes to App.jsx"
Write-Host "2. Update OTP verification"
Write-Host "3. Restart frontend"
