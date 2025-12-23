# syntax=docker/dockerfile:1
FROM node:22-slim AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build args for client-side env vars (embedded at build time)
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_MATOMO_URL
ARG VITE_MATOMO_SITE_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_MATOMO_URL=$VITE_MATOMO_URL
ENV VITE_MATOMO_SITE_ID=$VITE_MATOMO_SITE_ID

RUN npm run build

# Production image
FROM node:22-slim AS runner

WORKDIR /app

# Use existing node user (UID 1000)
USER node

# Copy built application
COPY --from=builder --chown=node:node /app/.output ./.output
COPY --from=builder --chown=node:node /app/package.json ./

# Expose port
EXPOSE 3000

# Health check (using node instead of curl)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start server
CMD ["node", ".output/server/index.mjs"]
