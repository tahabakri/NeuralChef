#!/bin/bash

# Stop any running processes
echo "Stopping any running processes..."
pkill -f "react-native"
pkill -f "expo"

# Clear React Native cache
echo "Clearing React Native and npm caches..."
rm -rf $TMPDIR/metro-bundler-cache-*
rm -rf $TMPDIR/metro-cache-*
rm -rf $TMPDIR/react-*
rm -rf node_modules/.cache

# Clear Watchman cache
echo "Clearing Watchman cache..."
watchman watch-del-all

# Remove node_modules and package locks
echo "Removing node_modules and package locks..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

# Start Expo with a clean cache
echo "Starting Expo with a clean cache..."
npx expo start -c

echo "Cleanup complete!" 