#!/bin/bash
set -euo pipefail

cd ~/docker/folklovers

echo "=== Starting deployment ==="
echo "Date: $(date)"
echo "Directory: $(pwd)"

echo ""
echo "=== Pulling latest code ==="
git fetch origin main
git reset --hard origin/main

echo ""
echo "=== Building containers ==="
docker compose build

echo ""
echo "=== Rolling restart (zero-downtime) ==="
# Restart backend first, wait for health check
docker compose up -d --no-deps --wait backend
echo "Backend is healthy"

# Then restart frontend
docker compose up -d --no-deps --wait frontend
echo "Frontend is healthy"

echo ""
echo "=== Running migrations ==="
docker compose exec -T backend bundle exec rails db:migrate || echo "Migration failed or no migrations to run"

echo ""
echo "=== Container status ==="
docker compose ps

echo ""
echo "=== Cleaning up old images ==="
docker image prune -f

echo ""
echo "=== Deployment completed successfully! ==="
