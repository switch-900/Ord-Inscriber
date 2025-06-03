# Umbrel Deployment Troubleshooting Guide

## Issue: "Repository already exists" Error

### Quick Solutions (Try in order):

## Solution 1: Remove and Re-add Repository
```bash
# SSH into your Umbrel node and run:
sudo ~/umbrel/scripts/app remove-repo https://github.com/crowh/OrdInscriber
sudo ~/umbrel/scripts/app add-repo https://github.com/crowh/OrdInscriber
```

## Solution 2: Clear Cache and Restart
```bash
# Clear community app store cache
sudo rm -rf ~/umbrel/app-data/community-app-store-cache/*

# Restart Umbrel
sudo ~/umbrel/scripts/stop
sudo ~/umbrel/scripts/start

# Wait 2-3 minutes, then try again
sudo ~/umbrel/scripts/app add-repo https://github.com/crowh/OrdInscriber
```

## Solution 3: Manual Installation
```bash
# Clone directly to apps directory
cd ~/umbrel/apps
sudo git clone https://github.com/crowh/OrdInscriber ordinals-inscriber

# Install manually
sudo ~/umbrel/scripts/app install ordinals-inscriber
```

## Solution 4: Check Repository Structure
Make sure your GitHub repository has:
- ✅ umbrel-app.yml (at root)
- ✅ docker-compose.yml (at root)  
- ✅ Dockerfile (at root)
- ✅ gallery/ directory with images
- ✅ All application files

## Solution 5: Alternative Repository URL
If the main repo doesn't work, try using the raw GitHub URL:
```bash
sudo ~/umbrel/scripts/app add-repo https://raw.githubusercontent.com/crowh/OrdInscriber/main/
```

## Verification Steps:

1. **Check if app is actually installed:**
   ```bash
   sudo ~/umbrel/scripts/app list
   ```

2. **Check app status:**
   ```bash
   sudo ~/umbrel/scripts/app status ordinals-inscriber
   ```

3. **View app logs:**
   ```bash
   sudo docker logs ordinals-inscriber_web_1
   ```

4. **Access the app:**
   - Go to http://your-umbrel-ip:3333
   - Or check Umbrel dashboard for the app icon

## Common Issues:

- **Port conflicts**: App uses port 3333, make sure it's not in use
- **Dependencies**: Requires Bitcoin Core to be running
- **Ord binary**: Make sure ord is installed on your Umbrel node
- **Permissions**: Check that Docker has proper permissions

## Still Having Issues?

1. Check Umbrel logs: `sudo docker logs umbrel_manager_1`
2. Verify GitHub repo is public and accessible
3. Try using a different repository name/URL
4. Contact Umbrel community support

## Testing Your App Locally:
```bash
# Test the Docker container locally first
git clone https://github.com/crowh/OrdInscriber
cd OrdInscriber
docker build -t ordinals-inscriber .
docker run -p 3333:3333 ordinals-inscriber
```

Visit http://localhost:3333 to test before deploying to Umbrel.
