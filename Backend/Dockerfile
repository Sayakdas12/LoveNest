# ── LoveNest Backend ──────────────────────────────────────────────────────────
FROM node:20-alpine

# Install dumb-init for proper PID-1 signal handling inside Docker
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy dependency manifests first — leverages Docker layer cache
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY src/ ./src/

# Create uploads directory (persisted via Docker volume at runtime)
RUN mkdir -p uploads

EXPOSE 3000

# Use dumb-init to reap zombie processes and forward signals correctly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/app.js"]
