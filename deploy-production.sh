#!/bin/bash

# Production deployment script for BiteBase Intelligence with copilot-api integration
# This script sets up and runs the copilot-api backend server for production

set -e  # Exit on any error

echo "🚀 Starting BiteBase Intelligence Production Deployment"

# Configuration
GITHUB_TOKEN="${GITHUB_TOKEN:-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}"
COPILOT_API_PORT="${COPILOT_API_PORT:-4141}"
NEXT_APP_PORT="${NEXT_APP_PORT:-3001}"
NODE_ENV="${NODE_ENV:-production}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

log_success() {
    echo -e "${GREEN}✅ ${1}${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  ${1}${NC}"
}

log_error() {
    echo -e "${RED}❌ ${1}${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if bun is installed
    if ! command -v bun &> /dev/null; then
        log_error "Bun is not installed. Installing..."
        curl -fsSL https://bun.sh/install | bash
        export PATH="$HOME/.bun/bin:$PATH"
    fi
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    log_success "Prerequisites check completed"
}

# Setup environment
setup_environment() {
    log_info "Setting up environment..."
    
    # Create .env.local file with production configuration
    cat > .env.local << EOF
# BiteBase Intelligence Production Configuration
GITHUB_TOKEN=${GITHUB_TOKEN}
COPILOT_API_URL=http://localhost:${COPILOT_API_PORT}
NEXT_PUBLIC_APP_URL=http://localhost:${NEXT_APP_PORT}
NODE_ENV=${NODE_ENV}
DATABASE_URL=file:./data/database.db
SESSION_SECRET=bitebase_production_secret_$(date +%s)
ENABLE_COPILOT_API=true
ENABLE_ANALYTICS=true
ENABLE_MARKET_RESEARCH=true
EOF
    
    log_success "Environment configuration created"
}

# Start copilot-api server
start_copilot_api() {
    log_info "Starting copilot-api server on port ${COPILOT_API_PORT}..."
    
    # Set environment variables for copilot-api
    export GITHUB_TOKEN="${GITHUB_TOKEN}"
    export PATH="$HOME/.bun/bin:$PATH"
    
    # Start copilot-api server in background
    npx copilot-api@latest start --port ${COPILOT_API_PORT} --token ${GITHUB_TOKEN} > copilot-api.log 2>&1 &
    COPILOT_API_PID=$!
    
    # Wait for server to start
    log_info "Waiting for copilot-api server to start..."
    sleep 5
    
    # Check if server is running
    if curl -s http://localhost:${COPILOT_API_PORT}/health > /dev/null; then
        log_success "Copilot-api server started successfully (PID: ${COPILOT_API_PID})"
        echo ${COPILOT_API_PID} > copilot-api.pid
    else
        log_error "Failed to start copilot-api server"
        exit 1
    fi
}

# Build and start Next.js application
start_nextjs_app() {
    log_info "Building Next.js application..."
    
    # Install dependencies
    npm install
    
    # Build the application
    npm run build
    
    log_info "Starting Next.js application on port ${NEXT_APP_PORT}..."
    
    # Start Next.js application
    npm start &
    NEXTJS_PID=$!
    echo ${NEXTJS_PID} > nextjs.pid
    
    # Wait for app to start
    sleep 10
    
    # Check if app is running
    if curl -s http://localhost:${NEXT_APP_PORT} > /dev/null; then
        log_success "Next.js application started successfully (PID: ${NEXTJS_PID})"
    else
        log_error "Failed to start Next.js application"
        exit 1
    fi
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Check copilot-api
    if curl -s http://localhost:${COPILOT_API_PORT}/health > /dev/null; then
        log_success "Copilot-api server is healthy"
    else
        log_warning "Copilot-api server health check failed"
    fi
    
    # Check Next.js app
    if curl -s http://localhost:${NEXT_APP_PORT} > /dev/null; then
        log_success "Next.js application is healthy"
    else
        log_warning "Next.js application health check failed"
    fi
    
    # Check CopilotKit API endpoint
    if curl -s http://localhost:${NEXT_APP_PORT}/api/copilotkit > /dev/null; then
        log_success "CopilotKit API endpoint is healthy"
    else
        log_warning "CopilotKit API endpoint health check failed"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    if [ -f copilot-api.pid ]; then
        COPILOT_API_PID=$(cat copilot-api.pid)
        if kill -0 ${COPILOT_API_PID} 2>/dev/null; then
            kill ${COPILOT_API_PID}
            log_info "Stopped copilot-api server (PID: ${COPILOT_API_PID})"
        fi
        rm copilot-api.pid
    fi
    
    if [ -f nextjs.pid ]; then
        NEXTJS_PID=$(cat nextjs.pid)
        if kill -0 ${NEXTJS_PID} 2>/dev/null; then
            kill ${NEXTJS_PID}
            log_info "Stopped Next.js application (PID: ${NEXTJS_PID})"
        fi
        rm nextjs.pid
    fi
}

# Trap cleanup on script exit
trap cleanup EXIT

# Main execution
main() {
    log_info "BiteBase Intelligence Production Deployment Started"
    
    check_prerequisites
    setup_environment
    start_copilot_api
    start_nextjs_app
    health_check
    
    log_success "🎉 BiteBase Intelligence is running in production mode!"
    log_info "📊 Next.js App: http://localhost:${NEXT_APP_PORT}"
    log_info "🤖 Copilot-api Server: http://localhost:${COPILOT_API_PORT}"
    log_info "🔗 CopilotKit API: http://localhost:${NEXT_APP_PORT}/api/copilotkit"
    
    log_info "Press Ctrl+C to stop all services"
    
    # Keep script running
    while true; do
        sleep 30
        # Perform periodic health checks
        if ! curl -s http://localhost:${COPILOT_API_PORT}/health > /dev/null; then
            log_warning "Copilot-api server appears to be down. Attempting restart..."
            start_copilot_api
        fi
        
        if ! curl -s http://localhost:${NEXT_APP_PORT} > /dev/null; then
            log_warning "Next.js application appears to be down. Check logs."
        fi
    done
}

# Run main function
main "$@"