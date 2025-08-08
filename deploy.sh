#!/bin/bash

# Replit Production Deploy Script
echo "🚀 Mobitask App - Production Deploy"

# Set production environment
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the web application
echo "🏗️ Building web application..."
npm run build:web

# Check if build was successful
if [ ! -d "web-build" ]; then
    echo "❌ Build failed - web-build directory not found"
    exit 1
fi

echo "✅ Build successful!"

# Start production server
echo "🌐 Starting production server on port 5000..."
npx serve -s web-build -p 5000 --host 0.0.0.0

# Keep server running
echo "🎉 Server is running at http://0.0.0.0:5000"
while true; do sleep 1000; done
