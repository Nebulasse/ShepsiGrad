# PowerShell script for minimal backend deployment

# Colors for output
$Green = 'Green'
$Yellow = 'Yellow'
$Red = 'Red'

Write-Host 'Starting minimal backend deployment...' -ForegroundColor $Yellow

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host 'Node.js version: '$nodeVersion -ForegroundColor $Green
}
catch {
    Write-Host 'Node.js is not installed. Please install Node.js and try again.' -ForegroundColor $Red
    exit 1
}

# Start the server
Write-Host 'Starting minimal server...' -ForegroundColor $Yellow

# Start server in background
Start-Process -FilePath 'node' -ArgumentList 'src/server-minimal.js' -NoNewWindow

# Check if server started
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host 'Server started successfully!' -ForegroundColor $Green
        Write-Host 'Available at: http://localhost:3000' -ForegroundColor $Green
        
        # Show available endpoints
        Write-Host '
Available endpoints:' -ForegroundColor $Yellow
        Write-Host '  GET  /api/health - health check' -ForegroundColor $Green
        Write-Host '  GET  /api/users - list users' -ForegroundColor $Green
        Write-Host '  POST /api/auth/login - login' -ForegroundColor $Green
        Write-Host '  POST /api/auth/register - register' -ForegroundColor $Green
    }
    else {
        Write-Host 'Server started but returns unexpected status: '$response.StatusCode -ForegroundColor $Yellow
    }
}
catch {
    Write-Host 'Failed to connect to server: '$_ -ForegroundColor $Red
    exit 1
}

Write-Host '
Minimal backend deployment completed successfully!' -ForegroundColor $Green
