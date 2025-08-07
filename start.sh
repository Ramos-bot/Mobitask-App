#!/bin/bash

# Replit startup script for Mobitask App
echo "🚀 Starting Mobitask App on Replit..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the Expo development server
echo "🌐 Starting Expo development server..."
echo "📱 Your app will be available at the web preview"
echo "🔗 For mobile testing, use the Expo Go app with the QR code"

# Start Expo with web support
npx expo start --web --hostname 0.0.0.0
