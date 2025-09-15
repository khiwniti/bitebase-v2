#!/bin/bash

# Production Deployment Script for BiteBase Intelligence
# Backend: Cloudflare Workers (api-beta.bitebase.app)
# Frontend: Vercel (beta.bitebase.app)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "🚀 Starting BiteBase Intelligence Production Deployment"
echo "Backend: Cloudflare Workers (api-beta.bitebase.app)"
echo "Frontend: Vercel (beta.bitebase.app)"
echo ""

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if wrangler is installed
    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI is not installed. Please install it first."
        echo "Run: npm install -g wrangler"
        exit 1
    fi
    
    # Check if vercel is installed
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI is not installed. Installing..."
        npm install -g vercel
    fi
    
    log_success "Prerequisites check completed"
}

# Set Cloudflare Workers secrets
setup_workers_secrets() {
    log_info "Setting up Cloudflare Workers secrets..."
    
    # Set API keys as secrets
    echo "your_openai_api_key_here" | wrangler secret put OPENAI_API_KEY
    echo "your_github_token_here" | wrangler secret put GITHUB_TOKEN
    echo "bitebase-production-secret-$(date +%s)" | wrangler secret put SESSION_SECRET
    
    log_success "Workers secrets configured"
}

# Deploy backend to Cloudflare Workers
deploy_backend() {
    log_info "Deploying backend to Cloudflare Workers..."
    
    # Build workers (currently just echo, since we're using raw JS)
    npm run build:workers
    
    # Deploy to production
    wrangler deploy --env production
    
    # Test the deployment
    log_info "Testing backend deployment..."
    if curl -s https://api-beta.bitebase.app/health > /dev/null; then
        log_success "Backend deployed successfully: https://api-beta.bitebase.app"
    else
        log_error "Backend deployment verification failed"
        exit 1
    fi
}

# Deploy frontend to Vercel
deploy_frontend() {
    log_info "Deploying frontend to Vercel..."
    
    # Build the frontend
    npm run build
    
    # Deploy to Vercel (assuming vercel.json is configured)
    vercel --prod --confirm
    
    # Test the deployment
    log_info "Testing frontend deployment..."
    if curl -s https://beta.bitebase.app > /dev/null; then
        log_success "Frontend deployed successfully: https://beta.bitebase.app"
    else
        log_error "Frontend deployment verification failed"
        exit 1
    fi
}

# Health check
perform_health_check() {
    log_info "Performing end-to-end health checks..."
    
    # Check backend
    backend_status=$(curl -s https://api-beta.bitebase.app/health | jq -r '.status' 2>/dev/null || echo "error")
    if [ "$backend_status" = "healthy" ]; then
        log_success "Backend health check passed"
    else
        log_warning "Backend health check failed or returned unexpected status"
    fi
    
    # Check frontend
    if curl -s https://beta.bitebase.app > /dev/null; then
        log_success "Frontend health check passed"
    else
        log_warning "Frontend health check failed"
    fi
    
    # Check API integration
    copilot_status=$(curl -s https://api-beta.bitebase.app/api/copilotkit | jq -r '.status' 2>/dev/null || echo "error")
    if [ "$copilot_status" = "operational" ]; then
        log_success "CopilotKit API integration working"
    else
        log_warning "CopilotKit API integration check failed"
    fi
}

# Main execution
main() {
    log_info "Starting deployment process..."
    
    check_prerequisites
    
    # Deploy backend first
    setup_workers_secrets
    deploy_backend
    
    # Wait a moment for backend to be fully available
    sleep 5
    
    # Deploy frontend
    deploy_frontend
    
    # Wait for everything to settle
    sleep 10
    
    # Run health checks
    perform_health_check
    
    echo ""
    log_success "🎉 BiteBase Intelligence deployment complete!"
    echo ""
    echo "🌐 Production URLs:"
    echo "   Frontend: https://beta.bitebase.app"
    echo "   Backend:  https://api-beta.bitebase.app"
    echo ""
    echo "🔗 Key Endpoints:"
    echo "   Health:    https://api-beta.bitebase.app/health"
    echo "   CopilotKit: https://api-beta.bitebase.app/api/copilotkit"
    echo "   Chat:      https://beta.bitebase.app/chat"
    echo ""
    echo "🎯 Test the deployment:"
    echo "   1. Visit https://beta.bitebase.app"
    echo "   2. Create a new chat session"
    echo "   3. Test the map interactive features"
    echo "   4. Verify AI agent responses"
    echo ""
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT

# Run main function
main "$@"