#!/bin/bash

# 🚀 SQL4Data - Free Deployment Script
# This script helps deploy to free hosting services

set -e

echo "🎯 SQL4Data Free Deployment Helper"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git repo is clean
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes. Commit them first!${NC}"
    echo ""
    git status -s
    echo ""
    read -p "Commit and push now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        git push origin main
        echo -e "${GREEN}✅ Changes pushed to GitHub${NC}"
    else
        echo -e "${YELLOW}⚠️  Please commit and push manually before deploying${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📦 Free Services Setup${NC}"
echo "======================="
echo ""
echo "1️⃣  Database: Neon PostgreSQL (FREE)"
echo "   → https://neon.tech"
echo "   → Create project → Copy connection string"
echo ""
echo "2️⃣  Backend: Render (FREE)"
echo "   → https://render.com"
echo "   → New Web Service → Connect GitHub → Deploy"
echo ""
echo "3️⃣  Frontend: Vercel (FREE)"
echo "   → Use: npx vercel --prod"
echo ""

read -p "Have you completed steps 1 & 2? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please complete database and backend setup first!${NC}"
    exit 1
fi

# Get backend URL
echo ""
read -p "Enter your Render backend URL (e.g., https://sql4data-backend.onrender.com): " backend_url

# Update .env.production
cat > .env.production << EOF
# Production API URL
VITE_API_URL=${backend_url}

# Stripe test keys (free mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
EOF

echo -e "${GREEN}✅ Updated .env.production with backend URL${NC}"

# Deploy to Vercel
echo ""
echo -e "${BLUE}🚀 Deploying Frontend to Vercel...${NC}"
echo ""

if command -v vercel &> /dev/null; then
    vercel --prod
else
    echo "Installing Vercel CLI..."
    npx vercel --prod
fi

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Update backend ALLOWED_ORIGINS with your Vercel URL"
echo "2. Update backend FRONTEND_URL with your Vercel URL"
echo "3. Test the application"
echo "4. Setup custom domain (optional)"
echo ""
echo -e "${GREEN}🎉 Your app is live for FREE!${NC}"
echo ""
