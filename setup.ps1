# 🌍 AI Civilization Simulation - Windows Setup Script
# Run this script in PowerShell: .\setup.ps1

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🌍 AI Civilization Simulation Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Functions for colored output
function Print-Success {
    param($message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Print-Error {
    param($message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Print-Info {
    param($message)
    Write-Host "➜ $message" -ForegroundColor Yellow
}

# Check if Docker is installed
function Check-Docker {
    Print-Info "Checking for Docker..."
    try {
        $dockerVersion = docker --version
        Print-Success "Docker is installed"
        Write-Host $dockerVersion
        return $true
    }
    catch {
        Print-Error "Docker is not installed"
        Write-Host "Please install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/"
        return $false
    }
}

# Check if Docker Compose is installed
function Check-DockerCompose {
    Print-Info "Checking for Docker Compose..."
    try {
        $composeVersion = docker-compose --version
        Print-Success "Docker Compose is installed"
        Write-Host $composeVersion
        return $true
    }
    catch {
        Print-Error "Docker Compose is not installed"
        Write-Host "Please install Docker Desktop (includes Docker Compose)"
        return $false
    }
}

# Setup environment file
function Setup-Env {
    Print-Info "Setting up environment file..."

    if (Test-Path ".env") {
        Print-Info ".env file already exists"
        $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
        if ($overwrite -ne "y" -and $overwrite -ne "Y") {
            Print-Info "Keeping existing .env file"
            return $true
        }
    }

    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Print-Success "Created .env file from .env.example"

        # Prompt for API keys
        Write-Host ""
        Write-Host "Optional: Add LLM API keys for richer narratives"
        Write-Host "(Press Enter to skip)"
        Write-Host ""

        $openaiKey = Read-Host "OpenAI API Key (optional)"
        if ($openaiKey) {
            (Get-Content ".env") -replace "OPENAI_API_KEY=.*", "OPENAI_API_KEY=$openaiKey" | Set-Content ".env"
            Print-Success "Added OpenAI API key"
        }

        $anthropicKey = Read-Host "Anthropic API Key (optional)"
        if ($anthropicKey) {
            (Get-Content ".env") -replace "ANTHROPIC_API_KEY=.*", "ANTHROPIC_API_KEY=$anthropicKey" | Set-Content ".env"
            Print-Success "Added Anthropic API key"
        }

        return $true
    }
    else {
        Print-Error ".env.example not found!"
        return $false
    }
}

# Docker setup
function Setup-Docker {
    Print-Info "Setting up with Docker..."
    Write-Host ""

    # Check prerequisites
    if (-not (Check-Docker)) { return $false }
    if (-not (Check-DockerCompose)) { return $false }

    Write-Host ""
    if (-not (Setup-Env)) { return $false }

    Write-Host ""
    Print-Info "Building and starting containers..."
    Print-Info "This may take 2-3 minutes on first run..."
    Write-Host ""

    try {
        docker-compose up -d --build

        Print-Success "Containers started successfully!"
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host "✨ Setup Complete!" -ForegroundColor Cyan
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Green
        Write-Host "Backend:   http://localhost:8000" -ForegroundColor Green
        Write-Host "API Docs:  http://localhost:8000/docs" -ForegroundColor Green
        Write-Host ""
        Write-Host "To view logs:"
        Write-Host "  docker-compose logs -f"
        Write-Host ""
        Write-Host "To stop:"
        Write-Host "  docker-compose stop"
        Write-Host ""
        Write-Host "To stop and remove:"
        Write-Host "  docker-compose down"
        Write-Host ""
        Print-Info "Opening browser in 5 seconds..."
        Start-Sleep -Seconds 5

        # Open browser
        Start-Process "http://localhost:3000"

        return $true
    }
    catch {
        Print-Error "Failed to start containers"
        Write-Host "Check logs with: docker-compose logs"
        return $false
    }
}

# Manual setup
function Setup-Manual {
    Print-Info "Setting up manually (without Docker)..."
    Write-Host ""

    # Check Python
    Print-Info "Checking for Python 3.11+..."
    try {
        $pythonVersion = python --version
        if ($pythonVersion -match "Python 3\.1[1-9]") {
            Print-Success "Python $pythonVersion found"
            $pythonCmd = "python"
        }
        else {
            Print-Error "Python 3.11+ required (found $pythonVersion)"
            return $false
        }
    }
    catch {
        Print-Error "Python not found"
        Write-Host "Please install Python 3.11+ from: https://www.python.org/downloads/"
        return $false
    }

    # Check Node.js
    Print-Info "Checking for Node.js 18+..."
    try {
        $nodeVersion = node --version
        if ($nodeVersion -match "v1[8-9]" -or $nodeVersion -match "v[2-9][0-9]") {
            Print-Success "Node.js $nodeVersion found"
        }
        else {
            Print-Error "Node.js 18+ required (found $nodeVersion)"
            return $false
        }
    }
    catch {
        Print-Error "Node.js not found"
        Write-Host "Please install Node.js 18+ from: https://nodejs.org/"
        return $false
    }

    Write-Host ""
    Print-Info "Setting up backend..."

    # Backend setup
    Push-Location backend

    Print-Info "Creating virtual environment..."
    & $pythonCmd -m venv venv

    Print-Info "Activating virtual environment..."
    & .\venv\Scripts\Activate.ps1

    Print-Info "Installing Python dependencies..."
    & $pythonCmd -m pip install --upgrade pip
    & $pythonCmd -m pip install -r requirements.txt

    if (-not (Test-Path ".env")) {
        Copy-Item ".env.example" ".env"
        Print-Success "Created .env file"
    }

    Pop-Location

    Write-Host ""
    Print-Info "Setting up frontend..."

    # Frontend setup
    Push-Location frontend

    Print-Info "Installing Node.js dependencies..."
    npm install

    if (-not (Test-Path ".env.local")) {
        Copy-Item ".env.example" ".env.local"
        Print-Success "Created .env.local file"
    }

    Pop-Location

    Write-Host ""
    Print-Success "Manual setup complete!"
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "📝 Next Steps:" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Install and start PostgreSQL and Redis"
    Write-Host "   - PostgreSQL: https://www.postgresql.org/download/windows/"
    Write-Host "   - Redis: https://redis.io/docs/getting-started/installation/install-redis-on-windows/"
    Write-Host ""
    Write-Host "2. Create database:"
    Write-Host "   createdb civilizationx"
    Write-Host ""
    Write-Host "3. Start backend (Terminal 1):"
    Write-Host "   cd backend"
    Write-Host "   .\venv\Scripts\Activate.ps1"
    Write-Host "   uvicorn src.main:app --reload"
    Write-Host ""
    Write-Host "4. Start frontend (Terminal 2):"
    Write-Host "   cd frontend"
    Write-Host "   npm start"
    Write-Host ""
    Write-Host "5. Open http://localhost:3000"
    Write-Host ""

    return $true
}

# Main menu
function Main {
    Write-Host "Choose setup method:"
    Write-Host ""
    Write-Host "1) Docker (Recommended - Easiest)"
    Write-Host "2) Manual Setup (Development)"
    Write-Host "3) Exit"
    Write-Host ""
    $choice = Read-Host "Enter choice [1-3]"

    switch ($choice) {
        "1" {
            Setup-Docker
        }
        "2" {
            Setup-Manual
        }
        "3" {
            Write-Host "Exiting..."
            exit 0
        }
        default {
            Print-Error "Invalid choice"
            exit 1
        }
    }
}

# Run main
Main
