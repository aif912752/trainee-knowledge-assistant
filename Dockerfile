# Build stage
FROM node:22-alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Install pnpm (match your local version or latest 10)
RUN npm install -g pnpm@10

WORKDIR /app

# Copy package files (including workspace and lockfile)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# ติดตั้ง dependencies โดยสั่งให้ pnpm ข้ามการเช็คความปลอดภัยเรื่อง build scripts
RUN pnpm config set only-allow-trusted-dependencies false && \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build Nuxt application
RUN pnpm run build

# Production stage
FROM node:22-alpine AS runtime

# Install runtime dependencies for shared libraries used by native modules
RUN apk add --no-cache libstdc++ libgcc

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built output
COPY --from=builder --chown=nodejs:nodejs /app/.output ./.output

# Copy database schema (needed for initialization)
COPY --from=builder --chown=nodejs:nodejs /app/server/db/schema.sql ./server/db/schema.sql

# Prepare Storage and Data
RUN mkdir -p /app/storage/uploads /app/data && \
    chown -R nodejs:nodejs /app/storage /app/data && \
    chmod -R 755 /app/storage /app/data

USER nodejs

EXPOSE 3000

ENV HOST=0.0.0.0 \
    PORT=3000 \
    NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", ".output/server/index.mjs"]
