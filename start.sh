#!/bin/bash

# SQL4Data MVP Deployment Script
# This script sets up and runs the complete stack

set -e  # Exit on error

echo "🚀 SQL4Data MVP Deployment"
echo "================================"

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
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi
print_success "Docker is installed"

# Check if docker compose is installed (V2 or V1)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    print_success "Docker Compose V1 is installed"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    print_success "Docker Compose V2 is installed"
else
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    print_info "Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    print_success "backend/.env created"
    print_info "⚠️  Please edit backend/.env and add your OPENAI_API_KEY if you want AI explanations"
    read -p "Press Enter to continue..."
fi

# Stop any existing containers
print_info "Stopping existing containers..."
$DOCKER_COMPOSE down 2>/dev/null || true
print_success "Existing containers stopped"

# Build and start services
print_info "Building Docker containers..."
$DOCKER_COMPOSE build

print_success "Containers built successfully"

print_info "Starting services..."
$DOCKER_COMPOSE up -d

print_success "Services started"

# Wait for PostgreSQL to be ready
print_info "Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if $DOCKER_COMPOSE exec -T postgres pg_isready -U sql4data_user -d sql4data_db &> /dev/null; then
        print_success "PostgreSQL is ready"
        break
    fi
    
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        print_error "PostgreSQL failed to start after $max_attempts attempts"
        docker-compose logs postgres
        exit 1
    fi
    
    echo -n "."
    sleep 1
done

# Wait for backend to be ready
print_info "Waiting for backend API to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8000/health &> /dev/null; then
        print_success "Backend API is ready"
        break
    fi
    
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        print_error "Backend API failed to start after $max_attempts attempts"
        docker-compose logs backend
        exit 1
    fi
    
    echo -n "."
    sleep 1
done

echo ""
echo "================================"
print_success "SQL4Data MVP is running!"
echo "================================"
echo ""
echo "📊 Services:"
echo "  - PostgreSQL:  http://localhost:5432"
echo "  - Backend API: http://localhost:8000"
echo "  - API Docs:    http://localhost:8000/docs"
echo ""
echo "🧪 Quick Test:"
echo "  curl http://localhost:8000/health"
echo ""
echo "📝 View Logs:"
echo "  docker-compose logs -f"
echo ""
echo "🛑 Stop Services:"
echo "  docker-compose down"
echo ""
echo "💡 Next Steps:"
echo "  1. Test the API: curl http://localhost:8000/api/tasks"
echo "  2. Open API docs: http://localhost:8000/docs"
echo "  3. Connect your frontend to http://localhost:8000"
echo ""
print_info "Press Ctrl+C to exit log stream, or run 'docker-compose logs -f' to view logs"
echo ""

# Follow logs
docker-compose logs -f
