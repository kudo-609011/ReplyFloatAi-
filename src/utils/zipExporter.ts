import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidSourceCode';

export async function exportAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root folder
  const root = zip.folder('ReplyFloatAI');

  if (!root) {
    throw new Error('Failed to create zip directory');
  }

  // Add all files
  for (const file of ANDROID_PROJECT_FILES) {
    root.file(file.path, file.content);
  }

  // Add Gradle wrapper properties and helper script
  root.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.11.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  root.file(
    'README.md',
    `# ReplyFloat AI - Complete Android Application

ReplyFloat AI is a background floating AI reply assistant for Android with:
- **WindowManager Transparent Overlay** with touch pass-through (\`FLAG_NOT_TOUCHABLE\`)
- **AccessibilityService Text Reader** (reads visible context node tree without screenshots)
- **Multi-Provider AI Architecture** (Google Gemini, OpenAI, Custom OpenAI-Compatible endpoints)
- **Whitelisted App Selection** (WhatsApp, Reddit, Discord, Chrome, Telegram, etc.)
- **Quick Settings Tile & Debounced Background Extraction**
- **Jetpack Compose + Material 3 Dark UI**

## How to Build the APK

1. **Open in Android Studio**:
   - Open Android Studio (Ladybug / Jellyfish or newer)
   - Click **File > Open** and select this unzipped \`ReplyFloatAI\` folder
   - Wait for Gradle sync to finish

2. **Run on Device or Emulator**:
   - Connect an Android device (API 26+ / Android 8.0 to Android 15) or start an Emulator
   - Click the green **Run (Shift + F10)** button to build & install \`app-debug.apk\`

3. **Or Build from Terminal**:
   \`\`\`bash
   ./gradlew assembleDebug
   \`\`\`
   The generated APK will be located at:
   \`app/build/outputs/apk/debug/app-debug.apk\`

## Granting Permissions
1. **Display over other apps**: Settings > Apps > Special app access > Display over other apps > Enable for ReplyFloat AI.
2. **Accessibility Service**: Settings > Accessibility > Downloaded apps > ReplyFloat AI Context Detection > Enable.
`
  );

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
