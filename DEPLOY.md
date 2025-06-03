# 🚀 Deployment Checklist for Ordinals Inscriber

## Phase 1: Local Testing ✅
- [x] Project structure complete
- [x] Docker configuration ready
- [x] Umbrel manifest created
- [x] Build scripts prepared
- [ ] Docker image builds successfully
- [ ] Local testing with `npm run test:dev`
- [ ] Container runs without errors

## Phase 2: Docker Hub Setup 📦
- [ ] Create Docker Hub account (if needed)
- [ ] Create repository: `ordinals-inscriber`
- [ ] Update build script with your username:
  ```bash
  export DOCKER_HUB_USER=your-dockerhub-username
  ./build.sh
  ```
- [ ] Push images:
  ```bash
  docker push $DOCKER_HUB_USER/ordinals-inscriber:latest
  docker push $DOCKER_HUB_USER/ordinals-inscriber:v1.0.0
  ```

## Phase 3: Gallery Assets 🎨
- [x] Icon created (`gallery/icon.svg`)
- [ ] Take app screenshots:
  - [ ] Main interface (1200x800px)
  - [ ] File upload screen
  - [ ] Inscription progress view
- [ ] Optimize images for web
- [ ] Verify icon displays well at small sizes

## Phase 4: Update Configuration 📝
- [ ] Update `docker-compose.yml` image reference:
  ```yaml
  image: your-dockerhub-username/ordinals-inscriber:v1.0.0
  ```
- [ ] Update `umbrel-app.yml` if needed
- [ ] Test final configuration locally

## Phase 5: Umbrel Community Submission 🌟
- [ ] Fork: https://github.com/getumbrel/umbrel-community-app-store
- [ ] Create app directory: `ordinals-inscriber/`
- [ ] Copy files:
  - [ ] `umbrel-app.yml`
  - [ ] `gallery/` folder with all images
- [ ] Create pull request with description:
  ```
  Add Ordinals Inscriber - Bitcoin Ordinals inscription web interface
  
  Features:
  - Simple drag-and-drop file upload
  - Real-time inscription progress
  - Fee estimation and management
  - Mobile-friendly interface
  - Secure file handling
  
  Requirements:
  - Bitcoin Core (provided by Umbrel)
  - ord binary (user must install)
  ```

## Phase 6: Post-Submission 📬
- [ ] Monitor PR for feedback
- [ ] Address any requested changes
- [ ] Update documentation based on review
- [ ] Celebrate when merged! 🎉

## Quick Commands Reference 💻

```bash
# Build and test locally
npm run test:dev

# Build Docker image
./build.sh

# Test Docker container
docker run -p 3000:3000 ordinals-inscriber:latest

# Push to Docker Hub
docker push yourusername/ordinals-inscriber:latest
docker push yourusername/ordinals-inscriber:v1.0.0
```

## Common Issues & Solutions 🔧

### Docker Build Fails
- Check Dockerfile syntax
- Ensure all dependencies in package.json
- Try: `docker system prune` to clean up

### Image Push Fails  
- Login: `docker login`
- Check repository exists on Docker Hub
- Verify image is tagged correctly

### App Doesn't Start on Umbrel
- Check ord binary availability: `/usr/local/bin/ord`
- Verify Bitcoin Core is running
- Check container logs for errors

---
**Next Step**: Start with Phase 1 testing, then proceed through each phase systematically.
