#!/bin/bash

echo "🔄 BlueFox Vercel Redeployment"
echo "=============================="
echo ""
echo "This will redeploy your app with the fixed configuration."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the frontend directory"
    echo "Please run this from the frontend folder"
    exit 1
fi

echo "🚀 Redeploying to Vercel..."
npx vercel --prod

echo ""
echo "✅ Redeployment complete!"
echo ""
echo "Your app should now be working at your Vercel URL."
echo ""
echo "If you still see issues:"
echo "1. Clear your browser cache"
echo "2. Check the Vercel dashboard for build logs"
echo "3. Make sure environment variables are set"