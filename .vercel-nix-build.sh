#!/bin/bash
# Vercel Build Script with Cache Busting
set -e

echo "=== Vercel Build Script ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Force npm to not use cache
export npm_config_cache=/tmp/npm-cache
export npm_config_prefer_offline=false
export npm_config_offline=false

echo "Step 1: Installing dependencies with cache disabled..."
npm install --legacy-peer-deps --no-cache

echo "Step 2: Building web..."
npm run build:web

echo "Step 3: Building server..."
cd server
npm install --legacy-peer-deps --no-cache
npm run build
cd ..

echo "=== Build completed successfully ==="
