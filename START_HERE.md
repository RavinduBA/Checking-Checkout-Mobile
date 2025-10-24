# 🚀 Build Your APK - Start Here!

## ✅ Setup Complete!

Your app is now configured to build APK files. EAS CLI version 16.24.1 is installed.

---

## 📱 Build APK in 3 Steps

### Step 1: Login to Expo

```bash
eas login
```

**First time?** Create an account at https://expo.dev/signup

### Step 2: Build APK

```bash
eas build --platform android --profile preview
```

This will:

- Upload your code to Expo servers
- Build APK in the cloud (~10-20 minutes)
- Give you a download link

### Step 3: Install on Phone

1. Download the APK from the link
2. Transfer to your Android phone
3. Enable "Unknown Sources" in Settings
4. Tap APK to install

---

## 🎯 What Happens During Build?

```
1. Uploading code... ⬆️
   └─ Your app files are uploaded to Expo

2. Building APK... 🔨
   ├─ Installing dependencies
   ├─ Compiling native code
   ├─ Bundling JavaScript
   └─ Creating APK file

3. Ready to download! ✅
   └─ APK link sent to your email
```

---

## 📋 Build Commands

| Command                                  | What It Does          |
| ---------------------------------------- | --------------------- |
| `eas build -p android --profile preview` | Build APK for testing |
| `eas build:list`                         | See all your builds   |
| `eas build:cancel`                       | Cancel current build  |

---

## 🔍 Check Build Status

While building, you can:

- View progress at https://expo.dev
- Close terminal (build continues in cloud)
- Check status: `eas build:list`

---

## 💡 Important Notes

### App Configuration

- **App Name:** CheckingCheckout Mobile
- **Package:** com.checkingcheckout.mobile
- **Version:** 1.0.0

### Permissions Included

- ✅ CAMERA (for document upload)
- ✅ READ_EXTERNAL_STORAGE (for images)
- ✅ WRITE_EXTERNAL_STORAGE (for saving)
- ✅ READ_MEDIA_IMAGES (for gallery access)

### Build Profiles

- **preview:** APK file (for testing/sharing)
- **production:** AAB file (for Google Play Store)
- **development:** Debug build (for development)

---

## 🐛 Troubleshooting

### Error: "Not logged in"

```bash
eas login
```

### Error: "Build failed"

1. Check internet connection
2. View logs: `eas build:list`
3. Try again: `eas build -p android --profile preview`

### Can't Install APK

1. Go to Settings → Security
2. Enable "Install from Unknown Sources"
3. Try installing again

---

## 📦 What's Next?

After your first successful build:

1. **Test the app** on your phone
2. **Check all features** work correctly
3. **Fix any bugs** if needed
4. **Rebuild** with: `eas build -p android --profile preview`
5. **Share APK** with team members

---

## 🎓 Learn More

- **Full Guide:** See [BUILD_APK_GUIDE.md](./BUILD_APK_GUIDE.md)
- **EAS Docs:** https://docs.expo.dev/build/introduction/
- **Expo Dashboard:** https://expo.dev

---

## ⚡ Quick Reference

```bash
# Login (first time only)
eas login

# Build APK
eas build -p android --profile preview

# Check builds
eas build:list

# View specific build
eas build:view [BUILD_ID]

# Cancel build
eas build:cancel
```

---

## 🎉 Ready to Build!

Run this command now:

```bash
eas login
```

Then start your build:

```bash
eas build --platform android --profile preview
```

Good luck! 🚀
