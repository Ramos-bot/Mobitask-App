#!/bin/bash

# Replit startup script for Mobitask App
echo "🚀 Starting Mobitask App on Replit..."

# Check if we're in a Replit environment
if [ -n "$REPL_SLUG" ]; then
    echo "📦 Detected Replit environment: $REPL_SLUG"
    export REPLIT=true
fi

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "expo" || true
pkill -f "metro" || true

# Install dependencies if node_modules doesn't exist or is incomplete
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Installing dependencies..."
    npm ci || npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if Expo CLI is available
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Clear Expo cache if needed
if [ "$CLEAR_CACHE" = "true" ]; then
    echo "🗑️ Clearing Expo cache..."
    npx expo start --clear
fi

# Set up environment variables for Replit
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0
export NODE_OPTIONS="--max-old-space-size=4096"

# Start the Expo development server
echo "🌐 Starting Expo development server..."
echo "📱 Your app will be available at the web preview"
echo "🔗 For mobile testing, use the Expo Go app with the QR code"

# Start Expo with web support and proper hostname
npx expo start --web --hostname 0.0.0.0 --port ${PORT:-3000}
