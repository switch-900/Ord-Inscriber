#!/bin/bash

# Build script for Ordinals Inscriber - Umbrel App Store Submission
set -e

echo "🔨 Building Ordinals Inscriber for Umbrel App Store..."

# Set default Docker Hub username if not provided
DOCKER_HUB_USER=${DOCKER_HUB_USER:-"switch900"}

echo "📋 Building for Docker Hub user: $DOCKER_HUB_USER"

# Build the image
echo "🐳 Building Docker image..."
docker build -t ordinals-inscriber:latest .

# Tag for Docker Hub
echo "🏷️  Tagging images..."
docker tag ordinals-inscriber:latest $DOCKER_HUB_USER/ordinals-inscriber:latest
docker tag ordinals-inscriber:latest $DOCKER_HUB_USER/ordinals-inscriber:v1.0.0

echo "✅ Build complete!"
echo "📦 Images created:"
echo "  - ordinals-inscriber:latest"
echo "  - $DOCKER_HUB_USER/ordinals-inscriber:latest" 
echo "  - $DOCKER_HUB_USER/ordinals-inscriber:v1.0.0"
echo ""
echo "🚀 Next steps for App Store submission:"
echo "  1. Push images: docker push $DOCKER_HUB_USER/ordinals-inscriber:latest"
echo "  2. Push version: docker push $DOCKER_HUB_USER/ordinals-inscriber:v1.0.0"
echo "  3. Update docker-compose.yml with: $DOCKER_HUB_USER/ordinals-inscriber:v1.0.0"
echo "  4. Take app screenshots for gallery/"
echo "  5. Submit to umbrel-community-app-store"
