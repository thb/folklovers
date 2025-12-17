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
echo "=== Restarting backend ==="
docker compose up -d --no-deps --wait backend
echo "Backend is healthy"

echo ""
echo "=== Running migrations ==="
docker compose exec -T backend bundle exec rails db:migrate
echo "Migrations completed"

echo ""
echo "=== Restarting frontend ==="
docker compose up -d --no-deps --wait frontend
echo "Frontend is healthy"

echo ""
echo "=== Container status ==="
docker compose ps

echo ""
echo "=== Cleaning up old images ==="
docker image prune -f

echo ""
echo "=== Deployment completed successfully! ==="
