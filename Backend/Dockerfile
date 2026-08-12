# ─────────────────────────────────────────────────────────────────────────────
#  LoveNest Backend — Dockerfile
#  Node.js 20 Alpine, multi-stage (production deps only)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: install production dependencies ──────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: lean runtime image ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nodeuser

# Copy production node_modules from Stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src/ ./src/

# Use non-root user
USER nodeuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/app.js"]
