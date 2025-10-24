# Building APK for CheckingCheckout Mobile App

## Prerequisites

Before building an APK, ensure you have:

- ✅ Expo CLI installed globally: `npm install -g expo-cli`
- ✅ EAS CLI installed globally: `npm install -g eas-cli`
- ✅ An Expo account (create one at https://expo.dev/signup if you don't have one)

## Method 1: EAS Build (Recommended - Cloud Build)

This is the easiest method as Expo builds the APK in the cloud.

### Step 1: Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Configure EAS Build

```bash
eas build:configure
```

This will create an `eas.json` file in your project.

### Step 4: Update app.json

Add the following to your `app.json` under `"android"`:

```json
"android": {
  "package": "com.checkingcheckout.mobile",
  "versionCode": 1,
  "adaptiveIcon": {
    "backgroundColor": "#E6F4FE"
  },
  "edgeToEdgeEnabled": true,
  "predictiveBackGestureEnabled": false
}
```

### Step 5: Build APK for Development

```bash
eas build --platform android --profile preview
```

Or for production APK:

```bash
eas build --platform android --profile production
```

### Step 6: Download APK

- Once the build completes, you'll get a link to download the APK
- Download the APK and transfer it to your Android phone
- Install it by enabling "Install from Unknown Sources" in Android settings

---

## Method 2: Local Build with Expo

### Step 1: Install Android Studio

Download and install Android Studio from https://developer.android.com/studio

### Step 2: Set Up Android SDK

- Open Android Studio
- Go to Settings → Appearance & Behavior → System Settings → Android SDK
- Install Android SDK (API 34 or latest)
- Note the SDK location

### Step 3: Set Environment Variables

Add to your system environment variables:

**Windows (PowerShell):**

```powershell
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
$env:PATH += ";$env:ANDROID_HOME\tools"
```

**Windows (Permanent):**

- Add `ANDROID_HOME` to System Environment Variables
- Add to Path: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\tools`

### Step 4: Generate Keystore (for signing APK)

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Save these details securely:**

- Keystore password
- Key alias
- Key password

### Step 5: Prebuild Expo App

```bash
npx expo prebuild --platform android
```

This creates the `android` folder with native code.

### Step 6: Build APK

```bash
cd android
./gradlew assembleRelease
```

### Step 7: Find Your APK

The APK will be located at:

```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Method 3: Quick Development Build (Expo Go)

⚠️ **Note:** This only works if you're not using custom native modules.

### Step 1: Install Expo Go on your phone

- Download "Expo Go" app from Google Play Store

### Step 2: Start Development Server

```bash
npm start
# or
expo start
```

### Step 3: Scan QR Code

- Open Expo Go app on your phone
- Scan the QR code shown in terminal
- App will load directly in Expo Go

**Limitation:** This requires internet connection and doesn't work if you have custom native code.

---

## Recommended Workflow for Your App

Since you're using **Supabase** and **custom dependencies**, I recommend:

### Option A: EAS Build (Easiest)

1. **Update app.json:**

```json
{
  "expo": {
    "name": "CheckingCheckout Mobile",
    "slug": "checkingcheckout-mobile",
    "version": "1.0.0",
    "android": {
      "package": "com.checkingcheckout.mobile",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE"
      }
    }
  }
}
```

2. **Create eas.json:**

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

3. **Build APK:**

```bash
eas build --platform android --profile preview
```

4. **Wait for build** (usually 10-20 minutes)

5. **Download and install** APK from the provided link

---

## Environment Variables

Since your app uses Supabase, ensure you set environment variables:

### Option 1: Using .env file (Expo)

Create `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Option 2: EAS Secrets

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value your_supabase_url
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your_anon_key
```

---

## Troubleshooting

### Error: "No Android SDK found"

- Install Android Studio
- Set ANDROID_HOME environment variable

### Error: "Keystore not found"

- Generate keystore using keytool command above

### Error: "Build failed on EAS"

- Check build logs in Expo dashboard
- Ensure all dependencies are compatible with Expo

### APK won't install on phone

- Enable "Install from Unknown Sources" in Android settings
- Check if minimum Android version is supported (check `app.json`)

---

## Quick Start Commands

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build APK
eas build --platform android --profile preview

# Check build status
eas build:list
```

### Local Build

```bash
# Prebuild
npx expo prebuild --platform android

# Build
cd android && ./gradlew assembleRelease

# Find APK
# Location: android/app/build/outputs/apk/release/app-release.apk
```

---

## Next Steps After Building

1. **Transfer APK to phone** via USB, cloud storage, or email
2. **Enable Unknown Sources** in Android settings
3. **Install APK** by tapping on it
4. **Test all features** thoroughly
5. **Share APK** with other team members/testers

---

## Production Release Checklist

Before releasing to production:

- [ ] Update version in app.json
- [ ] Test all features thoroughly
- [ ] Check all API endpoints work
- [ ] Verify Supabase connection
- [ ] Test on different Android versions
- [ ] Optimize images and assets
- [ ] Remove console.logs
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Create privacy policy
- [ ] Prepare Google Play Store listing

---

## Resources

- Expo EAS Build: https://docs.expo.dev/build/introduction/
- Android App Bundle: https://docs.expo.dev/build-reference/apk/
- Expo Configuration: https://docs.expo.dev/workflow/configuration/
