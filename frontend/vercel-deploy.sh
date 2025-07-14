#!/bin/bash

echo "🚀 BlueFox Vercel Production Deployment"
echo "======================================="
echo ""

# Clean and rebuild
echo "🧹 Cleaning old build..."
rm -rf dist

echo "🔨 Building application..."
npm run build

echo ""
echo "🚀 Deploying to Vercel..."
npx vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your app should now be live at your Vercel URL"
echo ""
echo "Remember to set CONVERTKIT_API_KEY in Vercel dashboard!"