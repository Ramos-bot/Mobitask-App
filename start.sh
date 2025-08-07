#!/bin/bash

# Simplified Replit startup for Mobitask App
echo "🚀 Starting Mobitask App..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start the app with minimal configuration
echo "🌐 Starting development server..."
npx expo start --web --hostname 0.0.0.0
