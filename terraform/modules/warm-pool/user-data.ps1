<powershell>
# Warm Pool Instance Initialization
# This script runs on warm pool instances

$SessionId = "${session_id}"

Write-Host "Initializing warm pool instance"
Write-Host "Session ID: $SessionId"

# Download and run bootstrap script
$bootstrapUrl = "https://pixray.cloud/scripts/bootstrap-sunshine.ps1"
$bootstrapPath = "C:\pixray\bootstrap.ps1"

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $bootstrapUrl -OutFile $bootstrapPath -UseBasicParsing

    # Execute bootstrap
    & PowerShell.exe -ExecutionPolicy Bypass -File $bootstrapPath
} catch {
    Write-Host "ERROR: Failed to download or execute bootstrap script: $_"
    exit 1
}
</powershell>
<persist>true</persist>
