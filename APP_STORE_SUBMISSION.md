# 🚀 Umbrel App Store Submission Guide

## Required Files for App Store Submission ✅

### Core Application Files
- ✅ `umbrel-app.yml` - App manifest (required)
- ✅ `docker-compose.yml` - Container orchestration (required)
- ✅ `Dockerfile` - Container build instructions (optional but recommended)

### Gallery Assets (REQUIRED)
- ✅ `gallery/icon.svg` - App icon (required)
- ⚠️ `gallery/1.jpg` - Screenshot 1 (required - need to add)
- ⚠️ `gallery/2.jpg` - Screenshot 2 (required - need to add)  
- ⚠️ `gallery/3.jpg` - Screenshot 3 (required - need to add)

### Docker Image (REQUIRED)
- ⚠️ Must be published to Docker Hub with proper tags

## 📝 Submission Checklist

### Phase 1: Prepare Docker Image
```bash
# Set your Docker Hub username
export DOCKER_HUB_USER=yourusername

# Build and tag images
./build.sh

# Push to Docker Hub (required for app store)
docker push $DOCKER_HUB_USER/ordinals-inscriber:latest
docker push $DOCKER_HUB_USER/ordinals-inscriber:v1.0.0
```

### Phase 2: Update Configuration
- [ ] Update `docker-compose.yml` image reference to your Docker Hub image
- [ ] Verify `umbrel-app.yml` has correct metadata
- [ ] Test the Docker image works with Umbrel environment

### Phase 3: Create Gallery Assets
- [ ] Take 3 high-quality screenshots (1200x800px recommended)
- [ ] Save as `gallery/1.jpg`, `gallery/2.jpg`, `gallery/3.jpg`
- [ ] Verify `gallery/icon.svg` displays correctly

### Phase 4: App Store Submission
1. **Fork the Repository**:
   ```bash
   # Fork: https://github.com/getumbrel/umbrel-community-app-store
   ```

2. **Create App Directory**:
   ```bash
   # In your fork, create: apps/ordinals-inscriber/
   # Copy: umbrel-app.yml and gallery/ folder
   ```

3. **Submit Pull Request**:
   - Title: "Add Ordinals Inscriber - Bitcoin Ordinals inscription interface"
   - Description: Include feature list and testing notes
   - Link to your Docker Hub repository

## 🔍 Pre-Submission Testing

### Test Locally with Docker
```bash
# Build and test the image
./build.sh
docker run -p 3333:3333 ordinals-inscriber:latest

# Visit http://localhost:3333 to test
```

### Test on Umbrel Node
```bash
# Add your repository to test
sudo ~/umbrel/scripts/app add-repo https://github.com/switch-900/OrdInscriber
sudo ~/umbrel/scripts/app install ordinals-inscriber
```

## 📋 App Store Requirements

### Technical Requirements
- ✅ Docker image published to Docker Hub
- ✅ Valid `umbrel-app.yml` manifest
- ✅ Proper dependency declarations
- ✅ Security best practices followed
- ✅ Resource usage optimized

### Content Requirements
- ✅ Clear app description and tagline
- ✅ Feature list and use cases
- ✅ Installation requirements noted
- ✅ Support/documentation links
- ✅ High-quality gallery images

### Review Criteria
- Functionality works as described
- No security vulnerabilities
- Follows Umbrel app guidelines
- Good user experience
- Proper resource management

## 🎯 Current Status

**Ready for submission:** ⚠️ **Almost - Need gallery screenshots**

**Completed:**
- ✅ Core application functional
- ✅ Docker configuration ready
- ✅ Umbrel manifest complete
- ✅ Documentation comprehensive
- ✅ Build scripts prepared

**TODO for submission:**
- [ ] Take app screenshots for gallery
- [ ] Push Docker image to Docker Hub
- [ ] Test final deployment
- [ ] Submit to app store
