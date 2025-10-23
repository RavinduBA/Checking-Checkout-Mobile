# Quick Start: Build APK

## 🚀 Fastest Method - EAS Build (Cloud)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
*If you don't have an account, create one at https://expo.dev/signup*

### Step 3: Build APK
```bash
eas build --platform android --profile preview
```

### Step 4: Wait and Download
- Build takes ~10-20 minutes
- You'll get a download link when complete
- Download the APK file

### Step 5: Install on Android Phone
1. Transfer APK to your phone (USB, email, or cloud)
2. Enable "Install from Unknown Sources" in Settings
3. Tap the APK file to install
4. Done! ✅

---

## 📱 What You'll Get

After running `eas build`:
- ✅ A standalone APK file
- ✅ Works on any Android phone (no Expo Go needed)
- ✅ Can be shared with anyone
- ✅ Full access to all app features

---

## 🔧 Troubleshooting

### "Command 'eas' not found"
```bash
npm install -g eas-cli
```

### "Not logged in"
```bash
eas login
```

### "Build failed"
- Check your internet connection
- View build logs: `eas build:list`
- Ensure all dependencies are installed

### "Can't install APK on phone"
- Enable "Unknown Sources" in Android Settings → Security
- Ensure Android version is 8.0 or higher

---

## 📋 Build Commands Reference

| Command | Purpose |
|---------|---------|
| `eas build --platform android --profile preview` | Build APK for testing |
| `eas build --platform android --profile production` | Build for production (AAB) |
| `eas build:list` | View all builds |
| `eas build:cancel` | Cancel current build |

---

## 🎯 Next Steps After First Build

1. **Test thoroughly** on your phone
2. **Share APK** with team members
3. **Get feedback** from testers
4. **Fix bugs** and rebuild
5. **Prepare for Google Play Store** release

---

## ⚡ Quick Commands

```bash
# One-line build command
eas build -p android --profile preview

# Check build status
eas build:list

# View build logs
eas build:view

# Cancel build
eas build:cancel
```

---

## 📚 Full Guide

For detailed instructions, see [BUILD_APK_GUIDE.md](./BUILD_APK_GUIDE.md)

---

## 💡 Tips

- First build takes longer (~20 min)
- Subsequent builds are faster (~10 min)
- You can close terminal after build starts
- Download link is sent to your email
- APK is valid for 30 days on EAS servers
