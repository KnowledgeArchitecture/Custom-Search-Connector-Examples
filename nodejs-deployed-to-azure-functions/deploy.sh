#!/bin/bash
set -e

BUILD_DIR="$DEPLOYMENT_SOURCE/.build"

# Assemble both directories in a clean build workspace
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/nodejs-deployed-to-azure-functions"
mkdir -p "$BUILD_DIR/nodejs-simple-rss-scraper"

cp -r "$DEPLOYMENT_SOURCE/nodejs-deployed-to-azure-functions/." "$BUILD_DIR/nodejs-deployed-to-azure-functions/"
cp -r "$DEPLOYMENT_SOURCE/nodejs-simple-rss-scraper/." "$BUILD_DIR/nodejs-simple-rss-scraper/"

# Install dependencies (resolves "file:../nodejs-simple-rss-scraper" correctly)
cd "$BUILD_DIR/nodejs-deployed-to-azure-functions"
npm install

# Copy built output to deployment target
cp -r . "$DEPLOYMENT_TARGET"
