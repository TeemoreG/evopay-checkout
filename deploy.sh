#!/bin/bash
set -e

REPO=/home/evopayaf/checkout-deploy
APP=/home/evopayaf/evopay-checkout

echo "==> [1/5] Fetching latest commit from GitHub"
cd "$REPO"
git fetch origin main
git reset --hard origin/main
DEPLOYED_SHA=$(git rev-parse --short HEAD)
echo "    Deployed commit: $DEPLOYED_SHA"

echo "==> [2/5] Syncing Laravel app files"
cp -R "$REPO/app"           "$APP/"
cp -R "$REPO/bootstrap"     "$APP/"
cp -R "$REPO/config"        "$APP/"
cp -R "$REPO/database"      "$APP/"
cp -R "$REPO/resources"     "$APP/"
cp -R "$REPO/routes"        "$APP/"
cp "$REPO/artisan"          "$APP/"
cp "$REPO/composer.json"    "$APP/"
cp "$REPO/composer.lock"    "$APP/"

echo "==> [3/5] Syncing public assets (Fixing 404s)"
# Remove the old build folder completely to prevent stale file references
rm -rf "$APP/public/build"
# Copy the fresh build folder from the repo
cp -R "$REPO/public/build"  "$APP/public/"

echo "==> [4/5] Clearing Laravel caches"
cd "$APP"
rm -f public/hot
php artisan optimize:clear > /dev/null

echo "==> [5/5] Done!"
echo "Live at: https://checkout.evopay.africa"