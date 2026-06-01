# ── Stage 1: Build React frontend ─────────────────────────────────────────────
# Build context must be the repo root (set in docker-compose.yml)
# so that COPY Frontend/ works from here.
FROM node:20-alpine AS react-builder

WORKDIR /app

# Copy dependency manifests first for layer cache efficiency
COPY Frontend/package*.json ./
RUN npm ci

# Copy the full frontend source (includes .env.production for Vite)
COPY Frontend/ ./

# Vite automatically picks up .env.production during build
RUN npm run build

# ── Stage 2: Nginx serving static files ───────────────────────────────────────
FROM nginx:1.27-alpine

# Copy React build output into Nginx's default serve directory
COPY --from=react-builder /app/dist /usr/share/nginx/html

# Remove default Nginx config — ours is bind-mounted via docker-compose
RUN rm /etc/nginx/conf.d/default.conf

EXPOSE 80 443
