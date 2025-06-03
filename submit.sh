#!/bin/bash
# Final submission helper for Ordinals Inscriber
# Run this after taking screenshots and logging into Docker Hub

set -e

echo "🎯 Ordinals Inscriber - Final Submission Helper"
echo "==============================================="

# Check if screenshots exist
echo "📸 Checking gallery screenshots..."
SCREENSHOTS_MISSING=0

# Check for screenshots in JPG or PNG format
if [ ! -f "gallery/1.jpg" ] && [ ! -f "gallery/1.png" ]; then
    echo "❌ Missing gallery/1.jpg or gallery/1.png (Main interface screenshot)"
    SCREENSHOTS_MISSING=1
else
    echo "✅ Screenshot 1 found"
fi

if [ ! -f "gallery/2.jpg" ] && [ ! -f "gallery/2.png" ]; then
    echo "❌ Missing gallery/2.jpg or gallery/2.png (Manage tab screenshot)" 
    SCREENSHOTS_MISSING=1
else
    echo "✅ Screenshot 2 found"
fi

if [ ! -f "gallery/3.jpg" ] && [ ! -f "gallery/3.png" ]; then
    echo "❌ Missing gallery/3.jpg or gallery/3.png (Send/Wallet screenshot)"
    SCREENSHOTS_MISSING=1
else
    echo "✅ Screenshot 3 found"
fi

if [ $SCREENSHOTS_MISSING -eq 1 ]; then
    echo ""
    echo "⚠️  Please capture the missing screenshots first:"
    echo "   1. Open http://localhost:3333 in browser"
    echo "   2. Set browser window to 1200x800px (F12 -> Device toolbar)"
    echo "   3. Take screenshots of each tab"
    echo "   4. Save as gallery/1.jpg, gallery/2.jpg, gallery/3.jpg"
    echo ""
    exit 1
fi

echo "✅ All screenshots present"

# Build and tag Docker images
echo ""
echo "🐳 Building Docker images..."
docker build -t switch900/ordinals-inscriber:latest -t switch900/ordinals-inscriber:v1.0.0 .

echo ""
echo "📤 Ready to push to Docker Hub..."
echo "   Run: docker login"
echo "   Then: docker push switch900/ordinals-inscriber:v1.0.0"
echo "   And: docker push switch900/ordinals-inscriber:latest"

echo ""
echo "🏪 App Store submission checklist:"
echo "   ✅ Screenshots captured"
echo "   ✅ Docker image built"
echo "   ⏳ Push to Docker Hub"
echo "   ⏳ Fork umbrel-community-app-store"
echo "   ⏳ Create pull request"

echo ""
echo "🚀 Project is ready for Umbrel App Store!"
echo "   See FINAL_STATUS.md for complete status overview"
