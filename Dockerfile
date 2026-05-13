# Build stage
FROM node:20-alpine AS builder

# Install build dependencies for native modules (better-sqlite3, bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files (MUST NOT be ignored in .dockerignore)
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies (including devDependencies for building)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build Nuxt application
RUN pnpm build

# Production stage
FROM node:20-alpine AS runtime

# Install runtime dependencies for shared libraries used by native modules
RUN apk add --no-cache libstdc++ libgcc

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built output from builder
# Nuxt standalone output includes the necessary node_modules for runtime
COPY --from=builder --chown=nodejs:nodejs /app/.output ./.output

# Create necessary directories for persistence and set permissions
# /app/data for SQLite, /app/storage/uploads for files
RUN mkdir -p /app/storage/uploads /app/data && \
    chown -R nodejs:nodejs /app/storage /app/data && \
    chmod -R 755 /app/storage /app/data

# Switch to non-root user
USER nodejs

# Expose port (Nuxt default is 3000)
EXPOSE 3000

# Environment defaults
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Health check
# Checks if the server is responding on port 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", ".output/server/index.mjs"]
