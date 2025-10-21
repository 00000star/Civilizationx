#!/bin/bash

# 🌍 AI Civilization Simulation - Setup Script
# This script automates the setup process for Linux/macOS

set -e  # Exit on error

echo "=========================================="
echo "🌍 AI Civilization Simulation Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    print_info "Checking for Docker..."
    if command -v docker &> /dev/null; then
        print_success "Docker is installed"
        docker --version
        return 0
    else
        print_error "Docker is not installed"
        echo "Please install Docker from: https://docs.docker.com/get-docker/"
        return 1
    fi
}

# Check if Docker Compose is installed
check_docker_compose() {
    print_info "Checking for Docker Compose..."
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is installed"
        docker-compose --version
        return 0
    else
        print_error "Docker Compose is not installed"
        echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
        return 1
    fi
}

# Setup environment file
setup_env() {
    print_info "Setting up environment file..."

    if [ -f ".env" ]; then
        print_info ".env file already exists"
        read -p "Do you want to overwrite it? (y/N): " overwrite
        if [[ $overwrite != "y" && $overwrite != "Y" ]]; then
            print_info "Keeping existing .env file"
            return 0
        fi
    fi

    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"

        # Prompt for API keys
        echo ""
        echo "Optional: Add LLM API keys for richer narratives"
        echo "(Press Enter to skip)"
        echo ""

        read -p "OpenAI API Key (optional): " openai_key
        if [ ! -z "$openai_key" ]; then
            sed -i.bak "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$openai_key/" .env
            print_success "Added OpenAI API key"
        fi

        read -p "Anthropic API Key (optional): " anthropic_key
        if [ ! -z "$anthropic_key" ]; then
            sed -i.bak "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$anthropic_key/" .env
            print_success "Added Anthropic API key"
        fi

        # Clean up backup files
        rm -f .env.bak
    else
        print_error ".env.example not found!"
        return 1
    fi
}

# Docker setup
setup_docker() {
    print_info "Setting up with Docker..."
    echo ""

    # Check prerequisites
    check_docker || return 1
    check_docker_compose || return 1

    echo ""
    setup_env || return 1

    echo ""
    print_info "Building and starting containers..."
    print_info "This may take 2-3 minutes on first run..."
    echo ""

    docker-compose up -d --build

    if [ $? -eq 0 ]; then
        print_success "Containers started successfully!"
        echo ""
        echo "=========================================="
        echo "✨ Setup Complete!"
        echo "=========================================="
        echo ""
        echo "Frontend:  http://localhost:3000"
        echo "Backend:   http://localhost:8000"
        echo "API Docs:  http://localhost:8000/docs"
        echo ""
        echo "To view logs:"
        echo "  docker-compose logs -f"
        echo ""
        echo "To stop:"
        echo "  docker-compose stop"
        echo ""
        echo "To stop and remove:"
        echo "  docker-compose down"
        echo ""
        print_info "Opening browser in 5 seconds..."
        sleep 5

        # Try to open browser
        if command -v xdg-open &> /dev/null; then
            xdg-open http://localhost:3000
        elif command -v open &> /dev/null; then
            open http://localhost:3000
        else
            echo "Please open http://localhost:3000 in your browser"
        fi
    else
        print_error "Failed to start containers"
        echo "Check logs with: docker-compose logs"
        return 1
    fi
}

# Manual setup
setup_manual() {
    print_info "Setting up manually (without Docker)..."
    echo ""

    # Check Python
    print_info "Checking for Python 3.11+..."
    if command -v python3.11 &> /dev/null; then
        print_success "Python 3.11 found"
        python3.11 --version
        PYTHON_CMD="python3.11"
    elif command -v python3 &> /dev/null; then
        version=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        if (( $(echo "$version >= 3.11" | bc -l) )); then
            print_success "Python $version found"
            PYTHON_CMD="python3"
        else
            print_error "Python 3.11+ required (found $version)"
            return 1
        fi
    else
        print_error "Python not found"
        return 1
    fi

    # Check Node.js
    print_info "Checking for Node.js 18+..."
    if command -v node &> /dev/null; then
        node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ $node_version -ge 18 ]; then
            print_success "Node.js $(node --version) found"
        else
            print_error "Node.js 18+ required (found v$node_version)"
            return 1
        fi
    else
        print_error "Node.js not found"
        return 1
    fi

    echo ""
    print_info "Setting up backend..."

    # Backend setup
    cd backend

    print_info "Creating virtual environment..."
    $PYTHON_CMD -m venv venv

    print_info "Activating virtual environment..."
    source venv/bin/activate

    print_info "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt

    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "Created .env file"
    fi

    cd ..

    echo ""
    print_info "Setting up frontend..."

    # Frontend setup
    cd frontend

    print_info "Installing Node.js dependencies..."
    npm install

    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        print_success "Created .env.local file"
    fi

    cd ..

    echo ""
    print_success "Manual setup complete!"
    echo ""
    echo "=========================================="
    echo "📝 Next Steps:"
    echo "=========================================="
    echo ""
    echo "1. Start PostgreSQL and Redis:"
    echo "   sudo systemctl start postgresql redis  # Linux"
    echo "   brew services start postgresql redis  # macOS"
    echo ""
    echo "2. Create database:"
    echo "   createdb civilizationx"
    echo ""
    echo "3. Start backend (Terminal 1):"
    echo "   cd backend"
    echo "   source venv/bin/activate"
    echo "   uvicorn src.main:app --reload"
    echo ""
    echo "4. Start frontend (Terminal 2):"
    echo "   cd frontend"
    echo "   npm start"
    echo ""
    echo "5. Open http://localhost:3000"
    echo ""
}

# Main menu
main() {
    echo "Choose setup method:"
    echo ""
    echo "1) Docker (Recommended - Easiest)"
    echo "2) Manual Setup (Development)"
    echo "3) Exit"
    echo ""
    read -p "Enter choice [1-3]: " choice

    case $choice in
        1)
            setup_docker
            ;;
        2)
            setup_manual
            ;;
        3)
            echo "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Run main
main
