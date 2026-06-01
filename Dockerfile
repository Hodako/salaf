# syntax=docker/dockerfile:1.4

# ---- Builder Stage ----
# Installs all dependencies and builds the application.
FROM node:24-alpine AS builder

# Alpine needs libc6-compat for some native bindings (like Next.js SWC compiler)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Use corepack to enable pnpm
RUN corepack enable pnpm

# Copy only the dependency manifests to leverage Docker cache
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# ---- Runtime Stage ----
# Creates the final, lean production image.
FROM node:24-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage
# This includes the server, static assets, and public folder.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# IMPORTANT: Next.js standalone server needs to bind to 0.0.0.0 inside a container
ENV HOSTNAME="0.0.0.0"

# Start the server from the standalone output directory
CMD ["node", "server.js"]