#!/bin/bash

echo "=== Umbrel Repository Cleanup Script ==="
echo "Run this script on your Umbrel node to fix the 'Repository already exists' error"
echo ""

echo "1. Remove existing repository (if it exists):"
echo "sudo ~/umbrel/scripts/app remove-repo https://github.com/crowh/OrdInscriber"
echo ""

echo "2. Clear any cached data:"
echo "sudo rm -rf ~/umbrel/app-data/community-app-store-cache/*"
echo ""

echo "3. Restart Umbrel services:"
echo "sudo ~/umbrel/scripts/stop"
echo "sudo ~/umbrel/scripts/start"
echo ""

echo "4. Wait for services to fully start (about 2-3 minutes), then re-add the repository:"
echo "sudo ~/umbrel/scripts/app add-repo https://github.com/crowh/OrdInscriber"
echo ""

echo "5. Install the app:"
echo "sudo ~/umbrel/scripts/app install ordinals-inscriber"
echo ""

echo "=== Alternative: Manual Installation ==="
echo "If the above doesn't work, you can manually install:"
echo ""
echo "1. Clone the repository:"
echo "cd ~/umbrel/apps"
echo "sudo git clone https://github.com/crowh/OrdInscriber ordinals-inscriber"
echo ""
echo "2. Install the app:"
echo "sudo ~/umbrel/scripts/app install ordinals-inscriber"
