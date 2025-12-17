# syntax=docker/dockerfile:1
FROM node:22-slim AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build arg for client-side API URL (embedded at build time)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production image
FROM node:22-slim AS runner

WORKDIR /app

# Create non-root user
RUN useradd -m -u 1000 nodejs
USER nodejs

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/.output ./.output
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start server
CMD ["node", ".output/server/index.mjs"]
