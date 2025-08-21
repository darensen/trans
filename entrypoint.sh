#!/bin/bash

echo "🚀 Starting application setup..."

# Build frontend
echo "📦 Building frontend..."
cd srcs/front
npm install
npm install typescript
npx tsc
cd ../..

# Build backend
echo "📦 Building backend..."
cd srcs/back
npm install
npx tsc
npx prisma generate
cd ../..

echo "🔧 Starting Docker services..."
docker compose up --build

echo "✅ Application ready!"
