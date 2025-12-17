#!/bin/bash
set -e

cd ~/docker/folklovers

echo "Pulling latest code..."
git pull origin main

echo "Building containers..."
docker compose build

echo "Starting containers..."
docker compose up -d

echo "Running migrations..."
docker compose exec -T backend bundle exec rails db:migrate

echo "Cleaning up old images..."
docker image prune -f

echo "Deployment completed!"
