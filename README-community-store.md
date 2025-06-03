# OrdInscriber Community App Store

🎯 **Ready for Testing on Umbrel Community App Store**

This repository is now properly configured as an Umbrel Community App Store containing the OrdInscriber application.

## 📁 Repository Structure

```
OrdInscriber/
├── umbrel-app-store.yml                    # Store configuration
├── ordinalscriber-ordinals-inscriber/      # App directory
│   ├── umbrel-app.yml                      # App manifest
│   ├── docker-compose.yml                 # Docker services
│   └── gallery/                           # Screenshots
│       ├── 1.png
│       ├── 2.png
│       └── 3.png
├── README-community-store.md               # This file
└── setup-community-store.sh               # Validation script
```

## 🚀 How to Use This Community App Store

### Step 1: Publish to GitHub
1. Create a new repository on GitHub (e.g., `OrdInscriber-Community-Store`)
2. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial community app store setup"
   git remote add origin https://github.com/yourusername/OrdInscriber-Community-Store.git
   git push -u origin main
   ```

### Step 2: Add to Umbrel
1. Open your Umbrel dashboard
2. Navigate to **App Store**
3. Click **Community App Stores** 
4. Click **Add Community App Store**
5. Enter your repository URL: `https://github.com/yourusername/OrdInscriber-Community-Store`
6. Click **Add**

### Step 3: Install OrdInscriber
1. The OrdInscriber app will appear in the **Community Apps** section
2. Click **Install** to add it to your Umbrel node
3. The app will be available at `http://umbrel.local:3333`

## ✅ Validation Checklist

- [x] Store ID: `ordinalscriber`
- [x] Store Name: "OrdinalScriber Community Store"
- [x] App ID: `ordinalscriber-ordinals-inscriber` (follows naming convention)
- [x] App directory structure is correct
- [x] Docker image is properly referenced: `switch900/ordinals-inscriber:v1.0.0`
- [x] Gallery screenshots are included (1.png, 2.png, 3.png)
- [x] All required dependencies are specified (bitcoin)

## 🔧 Technical Details

### App Configuration
- **ID**: `ordinalscriber-ordinals-inscriber`
- **Name**: Ordinals Inscriber
- **Category**: bitcoin
- **Port**: 3333
- **Dependencies**: bitcoin (Bitcoin Core)

### Docker Services
- **Main App**: `switch900/ordinals-inscriber:v1.0.0`
- **Proxy**: nginx:alpine for routing
- **Network**: Uses Umbrel main network with static IP

### Required Environment
- Umbrel node with Bitcoin Core enabled
- Docker environment
- Network access for Docker Hub pulls

## 🐳 Docker Image Requirements

Ensure your Docker image is available on Docker Hub:
```bash
docker build -t switch900/ordinals-inscriber:v1.0.0 .
docker push switch900/ordinals-inscriber:v1.0.0
docker push switch900/ordinals-inscriber:latest
```

## 📞 Support

- **Issues**: https://github.com/switch-900/OrdInscriber/issues
- **Documentation**: https://github.com/switch-900/OrdInscriber
- **Community**: Umbrel Community Forums

## 🎉 Ready for Distribution!

Your OrdInscriber app is now properly packaged as a Community App Store and ready for testing on Umbrel nodes. Users can add your store and install the app following the steps above.
