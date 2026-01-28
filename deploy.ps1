# Build and Deploy to OneDrive - PowerShell Script

Write-Host "Building roadmap dashboard..." -ForegroundColor Cyan

# Build
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green
Write-Host ""

# Deploy to OneDrive
Write-Host "Deploying to OneDrive..." -ForegroundColor Cyan

$dest = "D:\Users\bclark\OneDrive - Minor International PCL\All Things Payments\Payment Dashboard"

# Create destination if doesn't exist
if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    Write-Host "Created directory: $dest" -ForegroundColor Yellow
}

# Copy files
Copy-Item -Path "dist\*" -Destination $dest -Recurse -Force

Write-Host "Deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Dashboard location:" -ForegroundColor Cyan
Write-Host $dest -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open File Explorer to: $dest" -ForegroundColor White
Write-Host "2. Right-click index.html -> Share" -ForegroundColor White
Write-Host "3. Set permissions and share link with your boss" -ForegroundColor White
