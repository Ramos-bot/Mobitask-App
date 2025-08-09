# Replit-specific configuration
# This file ensures optimal performance on Replit platform

# Environment variables for Replit
export NODE_ENV=production
export PORT=5000

# Build and serve for Replit
echo "🚀 Starting MobiTask deployment on Replit..."
echo "📦 Building web application..."

# Build with optimizations
npx expo export --platform web --output-dir dist

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🌐 Starting server on port 5000..."
    node server.js
else
    echo "❌ Build failed!"
    exit 1
fi
