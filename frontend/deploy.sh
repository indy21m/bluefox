#!/bin/bash

echo "🚀 BlueFox Vercel Deployment Script"
echo "==================================="
echo ""
echo "This script will help you deploy BlueFox to Vercel."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
else
    echo "✅ Vercel CLI is installed"
fi

echo ""
echo "📝 Before deployment, make sure you have:"
echo "   1. A Vercel account (sign up at vercel.com)"
echo "   2. Your ConvertKit API key ready"
echo ""
echo "Press Enter to continue..."
read

# Login to Vercel
echo ""
echo "🔐 Logging in to Vercel..."
echo "   Choose your preferred login method:"
vercel login

# Deploy
echo ""
echo "🚀 Starting deployment..."
echo "   When prompted:"
echo "   - Set up and deploy? Yes"
echo "   - Which scope? Choose your account"
echo "   - Link to existing project? No (first time)"
echo "   - Project name? bluefox (or your choice)"
echo "   - Directory? ./ (current directory)"
echo "   - Override settings? No"
echo ""
vercel

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Navigate to your project settings"
echo "3. Add environment variable:"
echo "   CONVERTKIT_API_KEY = your_api_key_here"
echo ""
echo "🎉 Your app is now live on Vercel!"