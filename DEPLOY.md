# Deployment Guide

## Architecture Overview

### 1. GitHub Actions (CI/CD)

```
.github/workflows/
├── ci.yml        # Tests (backend RSpec + frontend build)
└── deploy.yml    # Orchestrates everything: calls CI then deploys
```

**Flow on `git push main`:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     GITHUB ACTIONS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  deploy.yml                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Job 1: test (calls ci.yml)                              │   │
│  │   ├── test-backend: Ruby + PostgreSQL + RSpec           │   │
│  │   └── test-frontend: Node + npm build                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼ (if tests pass)                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Job 2: deploy                                           │   │
│  │   └── SSH to server → executes deploy.sh                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. On the Server

**`deploy.sh`** executes and does:

```bash
git pull                    # 1. Pull latest code
docker compose build        # 2. Rebuild Docker images
docker compose up -d        # 3. Restart containers
rails db:migrate            # 4. Run database migrations
```

### 3. Docker Compose (Orchestration)

**`docker-compose.yml`** defines 3 services:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOCKER COMPOSE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     db       │  │   backend    │  │   frontend   │          │
│  │  PostgreSQL  │  │    Rails     │  │  Node SSR    │          │
│  │    :5432     │  │    :3000     │  │    :3000     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                 │                   │
│         └────────┬────────┴────────┬────────┘                   │
│                  │                 │                            │
│           network: internal   network: proxy                    │
│           (internal)         (to Traefik)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Dockerfiles (Image Builds)

Each service has its own Dockerfile:

**`backend/Dockerfile`**:
```
FROM ruby:3.3.4-slim
  → Install system dependencies (libpq, git...)
  → bundle install (Ruby gems)
  → Copy Rails code
  → CMD: start Rails server on :3000
```

**`frontend/Dockerfile`**:
```
FROM node:22-slim (builder)
  → npm ci (dependencies)
  → npm run build (compile the app)

FROM node:22-slim (runner)
  → Copy build output (.output/)
  → CMD: start Node SSR server on :3000
```

### 5. Traefik (Reverse Proxy)

Traefik runs on the server and routes traffic:

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         TRAEFIK                                 │
│                     (network: proxy)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   thefolklovers.com      →  frontend:3000                       │
│   api.thefolklovers.com  →  backend:3000                        │
│                                                                 │
│   + Automatic SSL (Let's Encrypt)                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6. Request Flow (SSR)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                  │
│  fetch → https://api.thefolklovers.com (VITE_API_URL)          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     TRAEFIK (proxy)                             │
│              SSL termination + routing                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND (Node SSR)                           │
│  loader() → http://backend:3000 (API_URL_INTERNAL)             │
│  (internal Docker network, no public round-trip)                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Rails)                            │
│                        port 3000                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL                                 │
│                        port 5432                                │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits:**
- SSR loaders run server-side via internal Docker network (fast)
- Client requests go through the public URL with HTTPS
- No external network latency for SSR

## Complete Deployment Flow

```
1. You run: git push

2. GitHub Actions:
   └── deploy.yml starts
       ├── Executes ci.yml (tests)
       │   ├── Backend: RSpec with temporary PostgreSQL
       │   └── Frontend: npm build
       └── If OK → SSH to server

3. On server (deploy.sh):
   ├── git pull
   ├── docker compose build
   │   ├── Build backend/Dockerfile → folklovers-backend image
   │   └── Build frontend/Dockerfile → folklovers-frontend image
   ├── docker compose up -d
   │   ├── Start db (PostgreSQL)
   │   ├── Start backend (Rails)
   │   └── Start frontend (Node SSR)
   └── rails db:migrate

4. Traefik detects new containers (via labels)
   └── Routes traffic to the right services

5. Site accessible at https://thefolklovers.com
```

## Server Setup

### Prerequisites

- Docker and Docker Compose
- Traefik running with an external network named `proxy`
- DNS configured for your domains
- Git installed

### SSH Key for GitHub Actions

Generate a restricted deploy key:

```bash
ssh-keygen -t ed25519 -C "github-actions-folklovers" -f ~/.ssh/folklovers_deploy -N ""
```

Add to `~/.ssh/authorized_keys` with restrictions:

```
command="cd ~/docker/folklovers && ./deploy.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA... github-actions-folklovers
```

This ensures the key can ONLY execute the deploy script.

### GitHub Secrets

Configure in `Settings > Secrets and variables > Actions > Repository secrets`:

| Secret | Description |
|--------|-------------|
| `SERVER_HOST` | Server IP or domain |
| `SERVER_USER` | SSH user (e.g., `deploy`) |
| `SERVER_SSH_KEY` | Private SSH key content |

### Initial Deployment

```bash
# Clone the repository
cd ~/docker
git clone git@github.com:thb/folklovers.git
cd folklovers

# Configure environment
cp .env.example .env
vim .env  # Set your values

# Build and start containers
docker compose up -d --build

# Run migrations and seed data
docker compose exec backend bundle exec rails db:migrate
docker compose exec backend bundle exec rails db:seed
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Domains
API_DOMAIN=api.thefolklovers.com
FRONTEND_DOMAIN=thefolklovers.com

# PostgreSQL
POSTGRES_USER=folklovers
POSTGRES_PASSWORD=<generate with: openssl rand -hex 16>
POSTGRES_DB=folklovers_production

# Rails secrets (generate with: openssl rand -hex 64)
SECRET_KEY_BASE=<generated_secret>
JWT_SECRET_KEY=<generated_secret>

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Troubleshooting

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Rebuild a specific service

```bash
docker compose build --no-cache backend
docker compose up -d backend
```

### Access Rails console

```bash
docker compose exec backend bundle exec rails console
```

### Reset database

```bash
docker compose exec backend bundle exec rails db:reset
```
