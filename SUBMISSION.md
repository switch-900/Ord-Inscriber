# Umbrel App Store Submission Checklist

## ✅ Pre-Submission Requirements

### 📦 Docker Image
- [ ] Build image locally: `./build.sh`
- [ ] Test image runs successfully
- [ ] Push to Docker Hub with proper tags (latest + v1.0.0)
- [ ] Update `docker-compose.yml` with correct image reference

### 🎨 Gallery Assets  
- [ ] Create app icon (`gallery/icon.svg`)
- [ ] Take app screenshots (`gallery/gallery-1.jpg`, etc.)
- [ ] Verify images meet size/quality requirements
- [ ] Test icon displays correctly at small sizes

### 📋 App Configuration
- [ ] Verify `umbrel-app.yml` has correct:
  - [ ] Docker image URL
  - [ ] Version number
  - [ ] Dependencies (bitcoin)
  - [ ] Port configuration
  - [ ] Description and metadata
- [ ] Test `docker-compose.yml` works with Umbrel

### 🧪 Testing
- [ ] App builds without errors
- [ ] Container starts successfully  
- [ ] File upload works
- [ ] WebSocket connection established
- [ ] ord binary integration (if available)
- [ ] Bitcoin Core connection (mock/test)

### 📝 Documentation
- [ ] README.md updated with deployment instructions
- [ ] Clear installation steps
- [ ] Feature list complete
- [ ] Screenshots in documentation

## 🚀 Submission Process

### 1. Prepare Repository
```bash
# Fork the community app store
git clone https://github.com/yourusername/umbrel-community-app-store
cd umbrel-community-app-store

# Create app directory
mkdir ordinals-inscriber
```

### 2. Copy Files
```bash
# Copy manifest
cp ../OrdInscriber/umbrel-app.yml ordinals-inscriber/

# Copy gallery
cp -r ../OrdInscriber/gallery ordinals-inscriber/
```

### 3. Update Image Reference
Edit `ordinals-inscriber/umbrel-app.yml`:
```yaml
version: "3.7"
services:
  web:
    image: yourusername/ordinals-inscriber:v1.0.0  # Update this
```

### 4. Submit Pull Request
- [ ] Create feature branch: `git checkout -b add-ordinals-inscriber`
- [ ] Commit changes: `git commit -m "Add Ordinals Inscriber app"`
- [ ] Push branch: `git push origin add-ordinals-inscriber`
- [ ] Open pull request on GitHub
- [ ] Include clear description of app functionality
- [ ] Wait for community review

## 📞 Next Steps After Submission

1. **Respond to Review Feedback**: Address any requested changes
2. **Monitor for Approval**: PR will be reviewed by Umbrel team
3. **Celebrate**: Your app will be available in the Umbrel App Store!

## 🔧 Common Issues & Solutions

### Docker Image Issues
- Ensure image is public on Docker Hub
- Verify tags match umbrel-app.yml
- Test image can be pulled: `docker pull yourusername/ordinals-inscriber:v1.0.0`

### Ord Binary Not Found
- Document requirement for users to install ord
- Provide installation instructions in app description
- Consider bundling ord binary in future versions

### Bitcoin Connection Issues  
- Verify environment variables are correct
- Test with Bitcoin Core testnet first
- Check network connectivity between containers
