#!/bin/bash

# Simple test script to verify our configuration
echo "🧪 Testing Ordinals Inscriber Configuration"
echo "==========================================="

# Test 1: Check if all required files exist
echo "📁 Checking required files..."

files=(
    "package.json"
    "server.js" 
    "Dockerfile"
    "docker-compose.yml"
    "umbrel-app.yml"
    "public/index.html"
    "public/script.js"
    "public/style.css"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
    fi
done

# Test 2: Check syntax of configuration files
echo ""
echo "🔍 Checking configuration syntax..."

# Check package.json
if node -e "JSON.parse(require('fs').readFileSync('package.json'))" 2>/dev/null; then
    echo "  ✅ package.json syntax valid"
else
    echo "  ❌ package.json syntax invalid"
fi

# Check docker-compose.yml (if docker-compose available)
if command -v docker-compose >/dev/null 2>&1; then
    # Check if docker-compose config runs without syntax errors (ignore env var warnings)
    if docker-compose config >/dev/null 2>&1; then
        echo "  ✅ docker-compose.yml syntax valid"
    else
        # Check if it's just env var warnings vs real syntax errors
        if docker-compose config 2>&1 | grep -q "variable is not set" && ! docker-compose config 2>&1 | grep -q "ScannerError\|ParserError"; then
            echo "  ✅ docker-compose.yml syntax valid (env vars missing - expected)"
        else
            echo "  ❌ docker-compose.yml syntax invalid"
        fi
    fi
else
    echo "  ⚠️  docker-compose not available"
fi

# Test 3: Check port configuration
echo ""
echo "🔌 Checking port configuration..."

# Check server.js for correct ports
if grep -q "process.env.PORT || 3333" server.js; then
    echo "  ✅ Server configured for port 3333"
else
    echo "  ❌ Server port not configured correctly"
fi

if grep -q "process.env.WS_PORT || 3334" server.js; then
    echo "  ✅ WebSocket configured for port 3334"
else
    echo "  ❌ WebSocket port not configured correctly"
fi

# Check frontend WebSocket connection
if grep -q ":3334" public/script.js; then
    echo "  ✅ Frontend WebSocket configured for port 3334"
else
    echo "  ❌ Frontend WebSocket port not configured correctly"
fi

echo ""
echo "✨ Configuration test complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Run 'npm install' to install dependencies"
echo "  2. Run 'npm start' to start the server"
echo "  3. Visit http://localhost:3333 to test the interface"
echo "  4. Run './build.sh' to build Docker image for deployment"
