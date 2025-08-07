# Mobitask App - Replit Setup

## 🚀 Quick Start on Replit

This project is configured to run seamlessly on Replit with Expo and React Native Web support.

### 📋 Prerequisites

- Replit account
- Expo Go app (for mobile testing)

### 🏃‍♂️ Running the App

1. **Clone/Import to Replit**:
   - Import from GitHub: `https://github.com/Ramos-bot/Mobitask-App`
   - Or clone this repository to your Replit workspace

2. **Start the Development Server**:
   ```bash
   npm run start
   ```
   Or use the Replit Run button

3. **Access Your App**:
   - **Web**: Click the preview window in Replit
   - **Mobile**: Scan the QR code with Expo Go app

### 🌐 Web Development

The app runs on React Native Web, allowing you to:
- Test most functionality directly in the browser
- Debug with Chrome DevTools
- Preview responsive design

### 📱 Mobile Testing

For full mobile experience:
1. Install [Expo Go](https://expo.dev/client) on your phone
2. Scan the QR code displayed in the terminal
3. Test native features like notifications and camera

### 🔧 Configuration Files

- **`.replit`**: Main Replit configuration
- **`replit.nix`**: Environment and dependencies
- **`app.json`**: Expo configuration
- **`package.json`**: Node.js dependencies

### 🎯 Features Available on Replit

✅ **Fully Supported**:
- Complete UI/UX testing
- Navigation and state management
- Firebase integration (with config)
- Form handling and validation
- Data visualization

⚠️ **Limited Support**:
- Push notifications (web notifications available)
- Camera/gallery access (file upload available)
- Device-specific features

### 🔥 Firebase Setup

1. Add your Firebase config to `firebaseConfig.js`
2. Enable required services in Firebase Console
3. Update security rules as needed

### 🚨 Troubleshooting

**Common Issues**:

1. **Dependencies not installing**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Expo not starting**:
   ```bash
   npx expo install --fix
   npx expo start --clear
   ```

3. **Port issues**:
   - Replit automatically handles ports
   - Check if the preview window loads correctly

### 📦 Package Scripts

```bash
npm start          # Start Expo development server
npm run web        # Start web-only development
npm run android    # Start with Android simulator (if available)
npm run ios        # Start with iOS simulator (if available)
```

### 🏗️ Project Structure

```
Mobitask-App/
├── App.js                    # Main application entry
├── src/
│   ├── mobitaskBase/        # Base module screens
│   ├── shared/              # Shared components and services
│   └── MobitaskMain.js     # Main navigation
├── assets/                  # Images and static files
└── [config files]          # Replit and Expo configuration
```

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on Replit
5. Submit a pull request

### 📞 Support

- GitHub Issues: [Create an issue](https://github.com/Ramos-bot/Mobitask-App/issues)
- Expo Documentation: [expo.dev](https://expo.dev)
- Replit Documentation: [docs.replit.com](https://docs.replit.com)

---

Happy coding! 🎉
