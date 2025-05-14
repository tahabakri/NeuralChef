# Stop any running processes
Write-Host "Stopping any running processes..."
Stop-Process -Name "node" -ErrorAction SilentlyContinue

# Clear React Native cache
Write-Host "Clearing React Native and npm caches..."
if (Test-Path $env:TEMP\metro-bundler-cache-*) {
    Remove-Item -Recurse -Force $env:TEMP\metro-bundler-cache-*
}
if (Test-Path $env:TEMP\metro-cache-*) {
    Remove-Item -Recurse -Force $env:TEMP\metro-cache-*
}
if (Test-Path $env:TEMP\react-*) {
    Remove-Item -Recurse -Force $env:TEMP\react-*
}
if (Test-Path .\node_modules\.cache) {
    Remove-Item -Recurse -Force .\node_modules\.cache
}

# Remove node_modules and package locks
Write-Host "Removing node_modules and package locks..."
if (Test-Path .\node_modules) {
    Remove-Item -Recurse -Force .\node_modules
}
if (Test-Path .\package-lock.json) {
    Remove-Item -Force .\package-lock.json
}
if (Test-Path .\yarn.lock) {
    Remove-Item -Force .\yarn.lock
}

# Clean npm cache
Write-Host "Cleaning npm cache..."
npm cache clean --force

# Reinstall dependencies
Write-Host "Reinstalling dependencies..."
npm install

# Start Expo with a clean cache
Write-Host "Starting Expo with a clean cache..."
npx expo start -c

Write-Host "Cleanup complete!" 