# ---- Stage 1: Build ----
FROM node:18-alpine AS builder
WORKDIR /app

# Copy all package manifests first to leverage layer caching
COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/
COPY boundedContext/mediaManagement/package*.json boundedContext/mediaManagement/
COPY boundedContext/postManagement/package*.json boundedContext/postManagement/
COPY boundedContext/userManagement/package*.json boundedContext/userManagement/
COPY boundedContext/shared-kernel/package*.json boundedContext/shared-kernel/
COPY packages/bounded-context-service-contracts/package*.json packages/bounded-context-service-contracts/
COPY packages/contracts/package*.json packages/contracts/
COPY packages/platform/package*.json packages/platform/
COPY packages/common/package*.json packages/common/

# Install all dependencies (including devDependencies needed for the build)
RUN npm ci

# Copy source
COPY . .

# Compile everything: shared-kernel, bounded contexts, packages, backend TS, frontend Vite
RUN npm run build

# Remove dev dependencies — production deps only remain in node_modules
RUN npm prune --production

# ---- Stage 2: Runner ----
FROM node:18-alpine AS runner
WORKDIR /app

# Copy the entire pruned workspace from the builder.
# Source files are present but harmless — only compiled build/ and dist/ directories execute.
COPY --from=builder /app .

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENV NODE_ENV=prod
ENV PORT=8080

# Install dotenvx and verify no plaintext .env files were accidentally included.
# .dockerignore is the first gate; this is the second — it fails the build if any .env file slipped through.
RUN npm install -g @dotenvx/dotenvx && dotenvx ext prebuild

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]