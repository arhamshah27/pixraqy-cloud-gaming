# Pixray Gaming Instance Bootstrap Script
# Idempotent script to install and configure Sunshine on Windows Server 2022/2025
# This script can be safely re-run multiple times

param(
    [string]$SessionId = $env:PIXRAY_SESSION_ID,
    [string]$ControlPlaneUrl = $env:PIXRAY_CONTROL_PLANE,
    [string]$AgentSecret = $env:PIXRAY_AGENT_SECRET
)

$ErrorActionPreference = "Stop"
$LogFile = "C:\pixray\bootstrap.log"
$InstallDir = "C:\pixray"
$SunshineVersion = "0.23.1" # Update to latest stable version
$SunshineInstallerUrl = "https://github.com/LizardByte/Sunshine/releases/download/v$SunshineVersion/sunshine-windows-installer.exe"

# Create directories
function Initialize-Directories {
    Write-Log "Creating installation directories"

    @("C:\pixray", "C:\pixray\logs", "C:\pixray\downloads") | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Force -Path $_ | Out-Null
            Write-Log "Created directory: $_"
        }
    }
}

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"

    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

# Check if running as Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Install Chocolatey if not present
function Install-Chocolatey {
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Log "Installing Chocolatey package manager"

        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

        Write-Log "Chocolatey installed successfully"
    } else {
        Write-Log "Chocolatey already installed"
    }
}

# Install NVIDIA drivers if not present
function Install-NvidiaDrivers {
    Write-Log "Checking NVIDIA drivers"

    try {
        $nvidiaDriver = Get-WmiObject Win32_VideoController | Where-Object { $_.Name -like "*NVIDIA*" }

        if ($nvidiaDriver) {
            $driverVersion = $nvidiaDriver.DriverVersion
            Write-Log "NVIDIA drivers found: $driverVersion"

            # Check if NVENC is available (driver version should be recent)
            $versionParts = $driverVersion -split '\.'
            if ([int]$versionParts[-1] -lt 30000) {
                Write-Log "NVIDIA driver version may be outdated, consider updating" "WARN"
            }
        } else {
            Write-Log "No NVIDIA GPU detected" "WARN"
        }
    } catch {
        Write-Log "Error checking NVIDIA drivers: $_" "ERROR"
    }
}

# Download file with retry
function Download-File {
    param(
        [string]$Url,
        [string]$OutputPath,
        [int]$MaxRetries = 3
    )

    $attempt = 0
    while ($attempt -lt $MaxRetries) {
        try {
            Write-Log "Downloading $Url (attempt $($attempt + 1)/$MaxRetries)"

            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            Invoke-WebRequest -Uri $Url -OutFile $OutputPath -UseBasicParsing

            Write-Log "Download completed successfully"
            return $true
        } catch {
            $attempt++
            Write-Log "Download failed: $_" "ERROR"

            if ($attempt -lt $MaxRetries) {
                Write-Log "Retrying in 5 seconds..."
                Start-Sleep -Seconds 5
            }
        }
    }

    return $false
}

# Install Sunshine
function Install-Sunshine {
    Write-Log "Checking Sunshine installation"

    $sunshineExe = "C:\Program Files\Sunshine\sunshine.exe"
    $sunshineService = Get-Service -Name "SunshineService" -ErrorAction SilentlyContinue

    if (Test-Path $sunshineExe) {
        Write-Log "Sunshine already installed at: $sunshineExe"

        # Check service status
        if ($sunshineService) {
            Write-Log "Sunshine service found, status: $($sunshineService.Status)"
        } else {
            Write-Log "Sunshine service not found, will install" "WARN"
        }

        # Skip installation if service is already running
        if ($sunshineService -and $sunshineService.Status -eq "Running") {
            Write-Log "Sunshine service already running, skipping installation"
            return $true
        }
    }

    # Download Sunshine installer
    $installerPath = "$InstallDir\downloads\sunshine-installer.exe"
    Write-Log "Downloading Sunshine installer"

    $downloaded = Download-File -Url $SunshineInstallerUrl -OutputPath $installerPath

    if (-not $downloaded) {
        Write-Log "Failed to download Sunshine installer" "ERROR"
        return $false
    }

    # Install Sunshine silently
    Write-Log "Installing Sunshine"

    try {
        $installArgs = "/S"
        Start-Process -FilePath $installerPath -ArgumentList $installArgs -Wait -NoNewWindow
        Write-Log "Sunshine installation completed"

        # Wait for service to be registered
        Start-Sleep -Seconds 5

        return $true
    } catch {
        Write-Log "Error installing Sunshine: $_" "ERROR"
        return $false
    }
}

# Configure Sunshine
function Configure-Sunshine {
    Write-Log "Configuring Sunshine"

    $configDir = "$env:APPDATA\Sunshine\config"
    $configFile = "$configDir\sunshine.conf"

    # Create config directory if not exists
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Force -Path $configDir | Out-Null
    }

    # Basic Sunshine configuration
    $config = @"
# Pixray Cloud Gaming - Sunshine Configuration
# Session ID: $SessionId

# Network settings
address_family = both
port = 47984
pkey = /assets/privatekey.pem
cert = /assets/certificate.pem

# Encoding settings
encoder = nvenc
sw_preset = balanced
nvenc_preset = p1
nvenc_rc = cbr

# Video settings
fps = 60
resolutions = [
    1920x1080,
    2560x1440,
    3840x2160
]

# Audio settings
audio_sink = [Default Audio Device]

# Performance
channels = 2
"@

    # Write config file (only if doesn't exist or is different)
    if (-not (Test-Path $configFile) -or ((Get-Content $configFile -Raw) -ne $config)) {
        Write-Log "Writing Sunshine configuration"
        Set-Content -Path $configFile -Value $config
    } else {
        Write-Log "Sunshine configuration already up to date"
    }
}

# Configure Windows Firewall
function Configure-Firewall {
    Write-Log "Configuring Windows Firewall for Sunshine"

    $firewallRules = @(
        @{Name="Pixray-Sunshine-TCP"; Protocol="TCP"; Port=47984},
        @{Name="Pixray-Sunshine-UDP"; Protocol="UDP"; Port=47998-48010},
        @{Name="Pixray-Sunshine-HTTPS"; Protocol="TCP"; Port=47990}
    )

    foreach ($rule in $firewallRules) {
        $existingRule = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue

        if (-not $existingRule) {
            Write-Log "Creating firewall rule: $($rule.Name)"

            New-NetFirewallRule `
                -DisplayName $rule.Name `
                -Direction Inbound `
                -Protocol $rule.Protocol `
                -LocalPort $rule.Port `
                -Action Allow `
                -Profile Any | Out-Null
        } else {
            Write-Log "Firewall rule already exists: $($rule.Name)"
        }
    }
}

# Start Sunshine service
function Start-SunshineService {
    Write-Log "Starting Sunshine service"

    $service = Get-Service -Name "SunshineService" -ErrorAction SilentlyContinue

    if ($service) {
        if ($service.Status -ne "Running") {
            Write-Log "Starting Sunshine service"
            Start-Service -Name "SunshineService"

            Start-Sleep -Seconds 3

            $service = Get-Service -Name "SunshineService"
            Write-Log "Sunshine service status: $($service.Status)"
        } else {
            Write-Log "Sunshine service already running"
        }

        # Set service to auto-start
        Set-Service -Name "SunshineService" -StartupType Automatic

        return $true
    } else {
        Write-Log "Sunshine service not found" "ERROR"
        return $false
    }
}

# Install and configure host-agent
function Install-HostAgent {
    Write-Log "Installing Pixray Host Agent"

    # Check if Node.js is installed
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Log "Installing Node.js via Chocolatey"
        choco install nodejs-lts -y

        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    }

    $agentDir = "$InstallDir\host-agent"

    if (-not (Test-Path $agentDir)) {
        New-Item -ItemType Directory -Force -Path $agentDir | Out-Null
    }

    # Download host-agent from control plane or S3
    # For now, create a placeholder
    Write-Log "Host agent installation placeholder - would download from: $ControlPlaneUrl"

    # Set environment variables for host-agent
    [System.Environment]::SetEnvironmentVariable("PIXRAY_CONTROL_PLANE", $ControlPlaneUrl, "Machine")
    [System.Environment]::SetEnvironmentVariable("PIXRAY_AGENT_SECRET", $AgentSecret, "Machine")
    [System.Environment]::SetEnvironmentVariable("PIXRAY_SESSION_ID", $SessionId, "Machine")

    Write-Log "Host agent environment variables configured"
}

# Main execution
function Main {
    Write-Log "========================================"
    Write-Log "Pixray Gaming Instance Bootstrap"
    Write-Log "Session ID: $SessionId"
    Write-Log "========================================"

    # Check administrator privileges
    if (-not (Test-Administrator)) {
        Write-Log "Script must be run as Administrator" "ERROR"
        exit 1
    }

    Initialize-Directories

    # Install prerequisites
    Install-Chocolatey
    Install-NvidiaDrivers

    # Install and configure Sunshine
    $sunshineInstalled = Install-Sunshine

    if ($sunshineInstalled) {
        Configure-Sunshine
        Configure-Firewall
        $sunshineStarted = Start-SunshineService

        if ($sunshineStarted) {
            Write-Log "Sunshine is running successfully"
        } else {
            Write-Log "Failed to start Sunshine service" "ERROR"
            exit 1
        }
    } else {
        Write-Log "Failed to install Sunshine" "ERROR"
        exit 1
    }

    # Install host-agent
    Install-HostAgent

    # Create completion marker
    $completionMarker = "$InstallDir\bootstrap_complete.txt"
    Set-Content -Path $completionMarker -Value (Get-Date -Format "yyyy-MM-dd HH:mm:ss")

    Write-Log "========================================"
    Write-Log "Bootstrap completed successfully!"
    Write-Log "========================================"
}

# Run main function
try {
    Main
} catch {
    Write-Log "FATAL ERROR: $_" "ERROR"
    Write-Log $_.ScriptStackTrace "ERROR"
    exit 1
}
