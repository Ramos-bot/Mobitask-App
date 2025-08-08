#!/bin/bash

# Script de inicialização para Replit - Mobitask App
echo "🚀 Starting Mobitask App..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if this is for deployment (production)
if [ "$NODE_ENV" = "production" ]; then
    echo "🏗️ Building for production..."
    npm run build:web
    echo "🌐 Serving production build on port 5000..."
    npx serve -s web-build -p 5000 --host 0.0.0.0
else
    echo "🔧 Starting development server..."
    npm run replit
fi
