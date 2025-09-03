# Backend Dockerfile - Optimized Multi-stage build for NestJS + Prisma

# --------------------------
# Base image for deps
# --------------------------
FROM node:18-alpine AS base
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# --------------------------
# Dependencies (only once)
# --------------------------
FROM base AS deps
# Copy only package files for cache
COPY package*.json ./
# Install all deps (prod+dev) for build
RUN npm ci --frozen-lockfile

# --------------------------
# Builder
# --------------------------
FROM deps AS builder
# Copy source code
COPY . .
# Generate Prisma client
RUN npx prisma generate
# Build the app
RUN npm run build

# --------------------------
# Production
# --------------------------
FROM base AS runner

# Add dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

WORKDIR /app

# Copy only production deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copy build output + prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Environment
ENV NODE_ENV=development 

EXPOSE 3001
USER nestjs

# Healthcheck (optional)
HEALTHCHECK --interval=10s  --timeout=2s --start-period=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1

# Start
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]

