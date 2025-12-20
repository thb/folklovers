#!/bin/bash
set -euo pipefail

cd ~/docker/folklovers

echo "=== Starting deployment ==="
echo "Date: $(date)"

echo ""
echo "=== Pulling latest images from GHCR ==="
docker compose -f docker-compose.prod.yml pull backend frontend

echo ""
echo "=== Restarting backend ==="
docker compose -f docker-compose.prod.yml up -d --no-deps backend
sleep 5

echo ""
echo "=== Running migrations ==="
docker compose -f docker-compose.prod.yml exec -T backend bundle exec rails db:migrate
echo "Migrations completed"

echo ""
echo "=== Restarting frontend ==="
docker compose -f docker-compose.prod.yml up -d --no-deps frontend

echo ""
echo "=== Container status ==="
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=== Cleaning up old images ==="
docker image prune -f

echo ""
echo "=== Deployment completed successfully! ==="
