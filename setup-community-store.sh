#!/bin/bash
# Community App Store Setup Script for OrdInscriber
# This script helps prepare your OrdInscriber for community app store distribution

set -e

echo "🏪 OrdInscriber Community App Store Setup"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "umbrel-app-store.yml" ]; then
    echo "❌ Error: umbrel-app-store.yml not found. Please run this script from the root directory."
    exit 1
fi

echo "✅ Found umbrel-app-store.yml"

# Check if app directory exists
if [ ! -d "ordinalscriber-ordinals-inscriber" ]; then
    echo "❌ Error: App directory 'ordinalscriber-ordinals-inscriber' not found."
    exit 1
fi

echo "✅ Found app directory"

# Check required files in app directory
APP_DIR="ordinalscriber-ordinals-inscriber"

if [ ! -f "$APP_DIR/umbrel-app.yml" ]; then
    echo "❌ Error: $APP_DIR/umbrel-app.yml not found."
    exit 1
fi

if [ ! -f "$APP_DIR/docker-compose.yml" ]; then
    echo "❌ Error: $APP_DIR/docker-compose.yml not found."
    exit 1
fi

if [ ! -d "$APP_DIR/gallery" ]; then
    echo "❌ Error: $APP_DIR/gallery directory not found."
    exit 1
fi

echo "✅ All required app files found"

# Check gallery screenshots
GALLERY_DIR="$APP_DIR/gallery"
for i in 1 2 3; do
    if [ ! -f "$GALLERY_DIR/$i.png" ]; then
        echo "❌ Error: Gallery screenshot $i.png not found."
        exit 1
    fi
done

echo "✅ All gallery screenshots found"

# Validate umbrel-app.yml
echo ""
echo "📋 App Configuration:"
echo "ID: $(grep '^id:' $APP_DIR/umbrel-app.yml | cut -d' ' -f2)"
echo "Name: $(grep '^name:' $APP_DIR/umbrel-app.yml | cut -d' ' -f2-)"
echo "Version: $(grep '^version:' $APP_DIR/umbrel-app.yml | cut -d' ' -f2)"

# Check if Docker image exists
DOCKER_IMAGE=$(grep 'image:' $APP_DIR/docker-compose.yml | grep -v nginx | awk '{print $2}')
echo "Docker Image: $DOCKER_IMAGE"

echo ""
echo "🐳 Checking Docker image availability..."
if docker pull $DOCKER_IMAGE > /dev/null 2>&1; then
    echo "✅ Docker image is available"
else
    echo "⚠️  Warning: Docker image may not be available on Docker Hub"
    echo "   Make sure to push your image: docker push $DOCKER_IMAGE"
fi

echo ""
echo "📁 Community App Store Structure:"
echo "├── umbrel-app-store.yml (store configuration)"
echo "├── ordinalscriber-ordinals-inscriber/ (app directory)"
echo "│   ├── umbrel-app.yml"
echo "│   ├── docker-compose.yml"
echo "│   └── gallery/"
echo "│       ├── 1.png"
echo "│       ├── 2.png"
echo "│       └── 3.png"

echo ""
echo "🚀 Next Steps:"
echo "1. Push this repository to GitHub"
echo "2. Ensure your Docker image is available on Docker Hub"
echo "3. Test the app store by adding it to an Umbrel node:"
echo "   Repository URL: https://github.com/yourusername/OrdInscriber-Community-Store"
echo ""
echo "✅ Community App Store is ready for distribution!"
