#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# LoveNest — One-shot VPS deployment script
# Run this on your Ubuntu VPS via SSH, NOT on Windows.
#
# Usage:
#   ssh root@YOUR_VPS_IP
#   curl -fsSL https://raw.githubusercontent.com/Sayakdas12/LoveNest/main/deploy.sh | bash
#
# OR after cloning:
#   bash /var/www/lovenest/deploy.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Stop immediately if any command fails

DOMAIN="lovenest.in"
REPO="https://github.com/Sayakdas12/LoveNest.git"
APP_DIR="/var/www/lovenest"

echo ""
echo "══════════════════════════════════════════"
echo "  LoveNest VPS Deployment"
echo "══════════════════════════════════════════"
echo ""

# ── Step 1: System update ─────────────────────────────────────────────────────
echo "► [1/6] Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq
echo "✓ System updated"

# ── Step 2: Install Docker ────────────────────────────────────────────────────
echo ""
echo "► [2/6] Installing Docker..."
if command -v docker &>/dev/null; then
    echo "✓ Docker already installed ($(docker --version))"
else
    curl -fsSL https://get.docker.com | sh
    echo "✓ Docker installed"
fi

# ── Step 3: Install Certbot ───────────────────────────────────────────────────
echo ""
echo "► [3/6] Installing Certbot..."
apt-get install -y -qq certbot
echo "✓ Certbot installed"

# ── Step 4: Get SSL certificate ───────────────────────────────────────────────
echo ""
echo "► [4/6] Obtaining SSL certificate for $DOMAIN..."
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "✓ Certificate already exists — skipping"
else
    certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --register-unsafely-without-email \
        -d "$DOMAIN" \
        -d "www.$DOMAIN"
    echo "✓ SSL certificate obtained"
fi

# ── Step 5: Clone / update repo ───────────────────────────────────────────────
echo ""
echo "► [5/6] Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
    echo "  Repo already exists — pulling latest changes..."
    cd "$APP_DIR" && git pull origin main
else
    git clone "$REPO" "$APP_DIR"
    cd "$APP_DIR"
fi
echo "✓ Code ready at $APP_DIR"

# ── Step 6: Check .env exists ─────────────────────────────────────────────────
echo ""
echo "► [6/6] Checking Backend/.env..."
if [ ! -f "$APP_DIR/Backend/.env" ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║  ACTION REQUIRED: Create Backend/.env                   ║"
    echo "╠══════════════════════════════════════════════════════════╣"
    echo "║  Run:  nano $APP_DIR/Backend/.env                       ║"
    echo "║  Paste your .env contents, then re-run:                 ║"
    echo "║    cd $APP_DIR && docker compose up -d --build          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    exit 1
fi
echo "✓ .env file found"

# ── Launch Docker Compose ─────────────────────────────────────────────────────
echo ""
echo "► Building and launching containers (this takes 3-5 minutes)..."
cd "$APP_DIR"
docker compose up -d --build

echo ""
echo "══════════════════════════════════════════"
echo "  Deployment complete!"
echo "══════════════════════════════════════════"
echo ""
docker compose ps
echo ""
echo "Open https://$DOMAIN in your browser."
echo ""
echo "► To watch live logs:"
echo "  docker compose logs -f"
echo ""
echo "► If something is wrong:"
echo "  docker compose logs backend"
echo "  docker compose logs nginx"
echo ""

# ── Set up SSL auto-renewal cron ─────────────────────────────────────────────
CRON_JOB="0 3 * * 1 certbot renew --quiet && docker exec lovenest-nginx nginx -s reload"
if ! crontab -l 2>/dev/null | grep -qF "certbot renew"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✓ SSL auto-renewal cron set up"
fi
