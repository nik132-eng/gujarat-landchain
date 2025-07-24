#!/bin/bash

echo "🚀 Starting Gujarat LandChain Development Environment..."

# Start databases
echo "📊 Starting databases..."
docker run -d --name landchain-postgres \
  -e POSTGRES_DB=gujarat_landchain \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:13

docker run -d --name landchain-redis \
  -p 6379:6379 \
  redis:6-alpine

# Start Solana validator
echo "⛓️ Starting Solana validator..."
solana-test-validator &

# Start monitoring
echo "📈 Starting monitoring stack..."
cd scripts/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
cd ../..

# Start frontend applications
echo "🖥️ Starting frontend applications..."
cd apps/citizen-pwa && npm run dev &
cd ../official-dashboard && npm run dev &
cd ../../frontend && npm run dev &

echo "✅ Development environment started!"
echo "🌐 Citizen PWA: http://localhost:3000"
echo "🏛️ Official Dashboard: http://localhost:3001"
echo "🔧 Legacy Frontend: http://localhost:5173"
echo "📊 Grafana: http://localhost:3001"
echo "📈 Prometheus: http://localhost:9090"
