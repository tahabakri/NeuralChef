Write-Host "Fixing Metro bundler issues for Expo SDK 53..." -ForegroundColor Cyan

# Remove node_modules folder
Write-Host "Removing node_modules folder..." -ForegroundColor Yellow
if (Test-Path .\node_modules) {
    Remove-Item -Recurse -Force .\node_modules
}

# Remove lock files
Write-Host "Removing package lock files..." -ForegroundColor Yellow
if (Test-Path .\package-lock.json) {
    Remove-Item -Force .\package-lock.json
}
if (Test-Path .\yarn.lock) {
    Remove-Item -Force .\yarn.lock
}

# Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Install dependencies with specific versions for Expo SDK 53
Write-Host "Installing compatible dependencies for Expo SDK 53..." -ForegroundColor Green
npm install metro@0.76.8 metro-resolver@0.76.8 metro-runtime@0.76.8 
npm install metro-config@0.76.8 metro-core@0.76.8 metro-source-map@0.76.8
npm install @expo/metro-config@0.10.0 metro-babel-transformer@0.76.8

# Reinstall dependencies
Write-Host "Reinstalling all dependencies..." -ForegroundColor Green
npm install

# Final cleanup
Write-Host "Performing final cleanup..." -ForegroundColor Yellow
npm dedupe

Write-Host "Fix completed! Try running 'npx expo start --clear' now." -ForegroundColor Cyan 