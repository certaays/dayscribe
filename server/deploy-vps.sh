#!/usr/bin/env bash
# ==============================================================================
# DayScribe — VPS Production Setup & Deployment Script
# ==============================================================================
set -e

echo "🕯️ Starting DayScribe VPS Deployment..."

# 1. Check Node.js and PM2
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 process manager globally..."
    npm install -g pm2
fi

# 2. Build Frontend
echo "✨ Building frontend web app..."
cd "$(dirname "$0")/.."
npm install
npm run build

# 3. Setup and Build Server
echo "⚙️ Setting up backend server..."
cd server
npm install
npx prisma generate
npx prisma db push
npm run build

# 4. Start / Restart PM2 service
echo "🚀 Starting backend with PM2..."
pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs
pm2 save

echo "✅ DayScribe Backend is now running on port 5000!"
echo "📁 Frontend dist built at: $(pwd)/../dist"
