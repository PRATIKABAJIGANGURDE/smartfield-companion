param (
    [string]$Target = "pratik@pratik.local",
    [string]$RemotePath = "~/smartfield-companion"
)

Write-Host "Deploying to $Target..." -ForegroundColor Cyan

# Ensure target directory exists
ssh $Target "mkdir -p $RemotePath/backend"

# Copy backend files
# Exclude __pycache and local configs if needed, but for now copy all source
scp -r ./backend $Target:$RemotePath/

# Install dependencies if requirements changed (Optional, uncomment if needed)
# ssh $Target "pip3 install -r $RemotePath/backend/requirements.txt"

# Restart the service (Assuming systemd service named 'rover-backend')
# Write-Host "Restarting service..." -ForegroundColor Yellow
# ssh $Target "sudo systemctl restart rover-backend"

Write-Host "Deployment Complete!" -ForegroundColor Green
