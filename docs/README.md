# ReciptAI

ReciptAI is a mobile application that helps you create delicious recipes from ingredients you have, using AI technology.

## Features

- Scan ingredients or grocery receipts to generate recipe ideas
- Get AI-powered recipe recommendations based on your ingredients and preferences
- Save favorite recipes for later use
- Step-by-step cooking instructions
- Customize dietary preferences and restrictions

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/reciptai.git
   cd reciptai
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```
   npx expo start
   ```

4. Open the app on your device using the Expo Go app or run on a simulator

## Testing the Onboarding Flow

The app features a comprehensive onboarding experience that guides new users through:

1. Welcome screen
2. Permission requests (camera and microphone)
3. Dietary preference selection
4. App tutorial

To test the onboarding flow:

- For a fresh start: Clear the app data on your device/simulator or uninstall and reinstall the Expo app
- To reset onboarding programmatically:
  ```javascript
  import AsyncStorage from '@react-native-async-storage/async-storage';
  // Use this in a debug screen or developer menu
  await AsyncStorage.removeItem('onboardingComplete');
  await AsyncStorage.removeItem('reciptai-onboarding-storage');
  ```

## Project Structure

- `/app` - Application screens and navigation
  - `/(tabs)` - Main tab navigation screens
  - `/onboarding` - Onboarding flow screens
- `/components` - Reusable UI components
- `/constants` - App constants (colors, typography, etc.)
- `/stores` - Global state management (Zustand)
- `/services` - API and service functions
- `/assets` - Images, fonts, and other static assets

## Technologies Used

- React Native
- Expo
- TypeScript
- Zustand for state management
- Expo Router for navigation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/) 