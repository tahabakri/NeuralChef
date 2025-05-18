# Voice Input Feature for ReciptAI

This document outlines the setup and usage of the voice input feature for ingredient detection.

## Setup

### 1. Install Dependencies

```bash
# Install required packages
npm install @react-native-voice/voice

# For iOS, also run pod install
cd ios && pod install && cd ..
```

### 2. Configure Permissions

#### iOS

Add the following to your `Info.plist` file:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone to recognize spoken ingredients</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>We need access to speech recognition to convert your voice to text</string>
```

#### Android

Add the following permissions to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

### 3. Usage

The voice input component is now fully integrated with the TagInput component. When users tap the microphone icon, they'll see a modal with:

1. A large microphone button they can tap to start/stop recording
2. Real-time transcription feedback
3. An "Add" button to confirm and add the recognized text as ingredient tags

### Technical Details

The integration uses:

- **@react-native-voice/voice**: For speech recognition (available across iOS and Android)
- **Animated microphone** with visual feedback during recording
- **Intelligent parsing** to split sentences like "chicken and rice with peas" into separate ingredients
- **Haptic feedback** throughout the process
- **Error handling** for failed recognitions

## Troubleshooting

If you encounter issues with voice recognition:

1. Ensure the app has the necessary permissions
2. Check internet connectivity (required for most speech recognition APIs)
3. For iOS simulator testing, use the built-in audio file playback feature
4. For Android emulator testing, ensure Google Play Services are installed

## Screenshots

(Insert screenshots of the voice input modal here) 