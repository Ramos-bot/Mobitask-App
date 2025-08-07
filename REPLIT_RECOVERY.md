# Replit Configuration Guide

## If your Repl is in recovery mode, follow these steps:

### 1. **Clear and Reinstall Dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. **Install Required Packages**
```bash
npx expo install --fix
npm install expo@~53.0.0 react@18.3.1 react-dom@18.3.1 react-native-web@~0.19.13
```

### 3. **Clear Expo Cache**
```bash
npx expo start --clear
```

### 4. **Start Development Server**
```bash
npm run replit
```

## Common Recovery Solutions:

### Problem: "Module not found" errors
**Solution:**
```bash
npm install
npx expo install --fix
```

### Problem: Port conflicts
**Solution:**
```bash
pkill -f expo
npm run replit
```

### Problem: Metro bundler issues
**Solution:**
```bash
npx expo start --clear --reset-cache
```

### Problem: Node version conflicts
**Solution:**
- Ensure you're using Node.js 22 (configured in replit.nix)
- Restart the Repl

## Environment Variables for Replit:
```bash
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0
export NODE_OPTIONS=--max-old-space-size=4096
```

## Manual Recovery Commands:
```bash
# 1. Kill all processes
pkill -f expo
pkill -f metro

# 2. Clean install
rm -rf node_modules package-lock.json .expo
npm cache clean --force
npm install

# 3. Fix Expo dependencies
npx expo install --fix

# 4. Start fresh
npx expo start --web --clear --hostname 0.0.0.0
```
