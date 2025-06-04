#!/bin/bash
# Setup script for OrdInscriber Community App Store

echo "🏪 OrdInscriber Community App Store Setup"
echo "========================================"

STORE_DIR="/mnt/c/Users/crowh/OrdInscriber-Community-Store"

echo "📁 Community App Store Directory: $STORE_DIR"
echo ""

# Check structure
echo "📦 Checking structure..."
if [ -f "$STORE_DIR/umbrel-app-store.yml" ]; then
    echo "  ✅ Store config found"
else
    echo "  ❌ Store config missing"
fi

if [ -d "$STORE_DIR/ordinalscriber-ordinals-inscriber" ]; then
    echo "  ✅ App directory found"
    
    if [ -f "$STORE_DIR/ordinalscriber-ordinals-inscriber/umbrel-app.yml" ]; then
        echo "  ✅ App manifest found"
    else
        echo "  ❌ App manifest missing"
    fi
    
    if [ -f "$STORE_DIR/ordinalscriber-ordinals-inscriber/docker-compose.yml" ]; then
        echo "  ✅ Docker compose found"
    else
        echo "  ❌ Docker compose missing"
    fi
    
    if [ -d "$STORE_DIR/ordinalscriber-ordinals-inscriber/gallery" ]; then
        SCREENSHOTS=$(ls $STORE_DIR/ordinalscriber-ordinals-inscriber/gallery/*.png 2>/dev/null | wc -l)
        echo "  ✅ Gallery found with $SCREENSHOTS screenshots"
    else
        echo "  ❌ Gallery missing"
    fi
else
    echo "  ❌ App directory missing"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. cd /mnt/c/Users/crowh/OrdInscriber-Community-Store"
echo "2. git init"
echo "3. git add ."
echo "4. git commit -m 'Initial community app store'"
echo "5. Create GitHub repo: OrdInscriber-Community-Store"
echo "6. git remote add origin https://github.com/yourusername/OrdInscriber-Community-Store.git"
echo "7. git push -u origin main"
echo ""
echo "8. Add to Umbrel using GitHub URL"
