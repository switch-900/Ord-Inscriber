#!/bin/bash

# Development and testing script for Ordinals Inscriber
set -e

echo "🧪 Ordinals Inscriber - Development Testing"
echo "=========================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js 18+."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install npm."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run setup check
echo "🔍 Running setup verification..."
node check-setup.js

# Start the application in development mode
echo "🚀 Starting development server..."
echo "App will be available at: http://localhost:3333"
echo "Press Ctrl+C to stop"
echo ""

# Start with environment variables for local testing
export PORT=3333
export WS_PORT=3334
export NODE_ENV=development
export BITCOIN_RPC_HOST=localhost
export BITCOIN_RPC_PORT=8332
export BITCOIN_RPC_USER=test
export BITCOIN_RPC_PASS=test
export ORD_DATADIR=./wallets

npm start
