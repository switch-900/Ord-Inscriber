#!/bin/bash

# Build script for Ordinals Inscriber
set -e

echo "🔨 Building Ordinals Inscriber Docker image..."

# Build the image
docker build -t ordinals-inscriber:latest .

# Tag for Docker Hub (replace 'yourusername' with your actual Docker Hub username)
DOCKER_HUB_USER=${DOCKER_HUB_USER:-"yourusername"}
docker tag ordinals-inscriber:latest $DOCKER_HUB_USER/ordinals-inscriber:latest
docker tag ordinals-inscriber:latest $DOCKER_HUB_USER/ordinals-inscriber:v1.0.0

echo "✅ Build complete!"
echo "📦 Images created:"
echo "  - ordinals-inscriber:latest"
echo "  - $DOCKER_HUB_USER/ordinals-inscriber:latest" 
echo "  - $DOCKER_HUB_USER/ordinals-inscriber:v1.0.0"
echo ""
echo "🚀 To push to Docker Hub:"
echo "  docker push $DOCKER_HUB_USER/ordinals-inscriber:latest"
echo "  docker push $DOCKER_HUB_USER/ordinals-inscriber:v1.0.0"
