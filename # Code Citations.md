# Code Citations

## License: MIT
https://github.com/Vbubblery/blog/blob/12e3310f173fc2ae7689dfea68ae69464908ea25/_posts/2018-10-22-Node.js-Project-Online.md

```
Repo is clean (`fc5b8a6`). Here is your complete manual step-by-step guide:

---

## Manual VPS Deployment Guide — LoveNest

> SSH into your VPS first, then run every command below in order.

---

### STEP 1 — System Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw
```

---

### STEP 2 — Install Node.js 20 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v    # must show v20.x.x
```

---

### STEP 3 — Install PM2

```bash
npm install -g pm2
pm2 startup   # ← copy and run the command it prints (starts PM2 on reboot)
```

---

### STEP 4 — Install Redis

```bash
sudo apt install -y redis-server
sudo nano /etc/redis/redis.conf
# Find the line: supervised no
# Change it to:  supervised systemd
# Save (Ctrl+O, Enter, Ctrl+X)

sudo systemctl restart redis-server
sudo systemctl enable redis-server
redis-cli ping   # must return: PONG
```

---

### STEP 5 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### STEP 6 — Clone Repo & Setup Backend

```bash
git clone https://github.com/Sayakdas12/LoveNest.git /var/www/lovenest
cd /var/www/lovenest/Backend
npm install --omit=dev

# Create your .env file:
nano .env
```

Paste your **production `.env`** (same as your local Backend/.env but change these values):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://lovenest.in
# ... all your other keys (MongoDB, JWT, Razorpay, etc.) stay the same
```

---

### STEP 7 — Start Backend with PM2

```bash
cd /var/www/lovenest/Backend
pm2 start src/app.js --name lovenest-api
pm2 save

# Verify it's running:
pm2 logs lovenest-api --lines 30
# Press Ctrl+C to exit logs

# Quick test (should return something, not connection refused):
curl http://localhost:3000
```

---

### STEP 8 — Build Frontend

```bash
cd /var/www/lovenest/Frontend
npm install

# Create production env file:
nano .env.production
```

Paste:
```
VITE_API_URL=https://lovenest.in/api
VITE_SOCKET_URL=https://lovenest.in
```

```bash
npm run build
# Creates /var/www/lovenest/Frontend/dist/
ls dist/   # should show index.html, assets/
```

---

### STEP 9 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lovenest
```

**Paste this entire config:**

```nginx
# ── HTTP → redirect to HTTPS ──────────────────────────────────────────────────
server {
    listen 80;
    server_name lovenest.in www.lovenest.in;

    # Certbot will add a location block here during Step 10
    location / {
        return 301 https://$host$request_uri;
    }
}

# ── HTTPS main server ─────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    server_name lovenest.in www.lovenest.in;

    # SSL certs — Certbot fills these in Step 10
    # ssl_certificate     /etc/letsencrypt/live/lovenest.in/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/lovenest.in/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upload size (profile photos)
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # ── Socket.IO (WebSocket) ─────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ── API reverse proxy ─────────────────────────────────────────────────
```


## License: unknown
https://github.com/paulguerrero/paulguerrero.github.io/blob/dad8504f1280a4b4d493f767c5328438e6e928cc/misc/nginx.conf

```
Repo is clean (`fc5b8a6`). Here is your complete manual step-by-step guide:

---

## Manual VPS Deployment Guide — LoveNest

> SSH into your VPS first, then run every command below in order.

---

### STEP 1 — System Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw
```

---

### STEP 2 — Install Node.js 20 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v    # must show v20.x.x
```

---

### STEP 3 — Install PM2

```bash
npm install -g pm2
pm2 startup   # ← copy and run the command it prints (starts PM2 on reboot)
```

---

### STEP 4 — Install Redis

```bash
sudo apt install -y redis-server
sudo nano /etc/redis/redis.conf
# Find the line: supervised no
# Change it to:  supervised systemd
# Save (Ctrl+O, Enter, Ctrl+X)

sudo systemctl restart redis-server
sudo systemctl enable redis-server
redis-cli ping   # must return: PONG
```

---

### STEP 5 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### STEP 6 — Clone Repo & Setup Backend

```bash
git clone https://github.com/Sayakdas12/LoveNest.git /var/www/lovenest
cd /var/www/lovenest/Backend
npm install --omit=dev

# Create your .env file:
nano .env
```

Paste your **production `.env`** (same as your local Backend/.env but change these values):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://lovenest.in
# ... all your other keys (MongoDB, JWT, Razorpay, etc.) stay the same
```

---

### STEP 7 — Start Backend with PM2

```bash
cd /var/www/lovenest/Backend
pm2 start src/app.js --name lovenest-api
pm2 save

# Verify it's running:
pm2 logs lovenest-api --lines 30
# Press Ctrl+C to exit logs

# Quick test (should return something, not connection refused):
curl http://localhost:3000
```

---

### STEP 8 — Build Frontend

```bash
cd /var/www/lovenest/Frontend
npm install

# Create production env file:
nano .env.production
```

Paste:
```
VITE_API_URL=https://lovenest.in/api
VITE_SOCKET_URL=https://lovenest.in
```

```bash
npm run build
# Creates /var/www/lovenest/Frontend/dist/
ls dist/   # should show index.html, assets/
```

---

### STEP 9 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lovenest
```

**Paste this entire config:**

```nginx
# ── HTTP → redirect to HTTPS ──────────────────────────────────────────────────
server {
    listen 80;
    server_name lovenest.in www.lovenest.in;

    # Certbot will add a location block here during Step 10
    location / {
        return 301 https://$host$request_uri;
    }
}

# ── HTTPS main server ─────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    server_name lovenest.in www.lovenest.in;

    # SSL certs — Certbot fills these in Step 10
    # ssl_certificate     /etc/letsencrypt/live/lovenest.in/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/lovenest.in/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upload size (profile photos)
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # ── Socket.IO (WebSocket) ─────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ── API reverse proxy ─────────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:3000/;
```


## License: MIT
https://github.com/Vbubblery/blog/blob/12e3310f173fc2ae7689dfea68ae69464908ea25/_posts/2018-10-22-Node.js-Project-Online.md

```
Repo is clean (`fc5b8a6`). Here is your complete manual step-by-step guide:

---

## Manual VPS Deployment Guide — LoveNest

> SSH into your VPS first, then run every command below in order.

---

### STEP 1 — System Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw
```

---

### STEP 2 — Install Node.js 20 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v    # must show v20.x.x
```

---

### STEP 3 — Install PM2

```bash
npm install -g pm2
pm2 startup   # ← copy and run the command it prints (starts PM2 on reboot)
```

---

### STEP 4 — Install Redis

```bash
sudo apt install -y redis-server
sudo nano /etc/redis/redis.conf
# Find the line: supervised no
# Change it to:  supervised systemd
# Save (Ctrl+O, Enter, Ctrl+X)

sudo systemctl restart redis-server
sudo systemctl enable redis-server
redis-cli ping   # must return: PONG
```

---

### STEP 5 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### STEP 6 — Clone Repo & Setup Backend

```bash
git clone https://github.com/Sayakdas12/LoveNest.git /var/www/lovenest
cd /var/www/lovenest/Backend
npm install --omit=dev

# Create your .env file:
nano .env
```

Paste your **production `.env`** (same as your local Backend/.env but change these values):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://lovenest.in
# ... all your other keys (MongoDB, JWT, Razorpay, etc.) stay the same
```

---

### STEP 7 — Start Backend with PM2

```bash
cd /var/www/lovenest/Backend
pm2 start src/app.js --name lovenest-api
pm2 save

# Verify it's running:
pm2 logs lovenest-api --lines 30
# Press Ctrl+C to exit logs

# Quick test (should return something, not connection refused):
curl http://localhost:3000
```

---

### STEP 8 — Build Frontend

```bash
cd /var/www/lovenest/Frontend
npm install

# Create production env file:
nano .env.production
```

Paste:
```
VITE_API_URL=https://lovenest.in/api
VITE_SOCKET_URL=https://lovenest.in
```

```bash
npm run build
# Creates /var/www/lovenest/Frontend/dist/
ls dist/   # should show index.html, assets/
```

---

### STEP 9 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lovenest
```

**Paste this entire config:**

```nginx
# ── HTTP → redirect to HTTPS ──────────────────────────────────────────────────
server {
    listen 80;
    server_name lovenest.in www.lovenest.in;

    # Certbot will add a location block here during Step 10
    location / {
        return 301 https://$host$request_uri;
    }
}

# ── HTTPS main server ─────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    server_name lovenest.in www.lovenest.in;

    # SSL certs — Certbot fills these in Step 10
    # ssl_certificate     /etc/letsencrypt/live/lovenest.in/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/lovenest.in/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upload size (profile photos)
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # ── Socket.IO (WebSocket) ─────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ── API reverse proxy ─────────────────────────────────────────────────
```


## License: unknown
https://github.com/paulguerrero/paulguerrero.github.io/blob/dad8504f1280a4b4d493f767c5328438e6e928cc/misc/nginx.conf

```
Repo is clean (`fc5b8a6`). Here is your complete manual step-by-step guide:

---

## Manual VPS Deployment Guide — LoveNest

> SSH into your VPS first, then run every command below in order.

---

### STEP 1 — System Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw
```

---

### STEP 2 — Install Node.js 20 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v    # must show v20.x.x
```

---

### STEP 3 — Install PM2

```bash
npm install -g pm2
pm2 startup   # ← copy and run the command it prints (starts PM2 on reboot)
```

---

### STEP 4 — Install Redis

```bash
sudo apt install -y redis-server
sudo nano /etc/redis/redis.conf
# Find the line: supervised no
# Change it to:  supervised systemd
# Save (Ctrl+O, Enter, Ctrl+X)

sudo systemctl restart redis-server
sudo systemctl enable redis-server
redis-cli ping   # must return: PONG
```

---

### STEP 5 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### STEP 6 — Clone Repo & Setup Backend

```bash
git clone https://github.com/Sayakdas12/LoveNest.git /var/www/lovenest
cd /var/www/lovenest/Backend
npm install --omit=dev

# Create your .env file:
nano .env
```

Paste your **production `.env`** (same as your local Backend/.env but change these values):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://lovenest.in
# ... all your other keys (MongoDB, JWT, Razorpay, etc.) stay the same
```

---

### STEP 7 — Start Backend with PM2

```bash
cd /var/www/lovenest/Backend
pm2 start src/app.js --name lovenest-api
pm2 save

# Verify it's running:
pm2 logs lovenest-api --lines 30
# Press Ctrl+C to exit logs

# Quick test (should return something, not connection refused):
curl http://localhost:3000
```

---

### STEP 8 — Build Frontend

```bash
cd /var/www/lovenest/Frontend
npm install

# Create production env file:
nano .env.production
```

Paste:
```
VITE_API_URL=https://lovenest.in/api
VITE_SOCKET_URL=https://lovenest.in
```

```bash
npm run build
# Creates /var/www/lovenest/Frontend/dist/
ls dist/   # should show index.html, assets/
```

---

### STEP 9 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lovenest
```

**Paste this entire config:**

```nginx
# ── HTTP → redirect to HTTPS ──────────────────────────────────────────────────
server {
    listen 80;
    server_name lovenest.in www.lovenest.in;

    # Certbot will add a location block here during Step 10
    location / {
        return 301 https://$host$request_uri;
    }
}

# ── HTTPS main server ─────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    server_name lovenest.in www.lovenest.in;

    # SSL certs — Certbot fills these in Step 10
    # ssl_certificate     /etc/letsencrypt/live/lovenest.in/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/lovenest.in/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upload size (profile photos)
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # ── Socket.IO (WebSocket) ─────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ── API reverse proxy ─────────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:3000/;
```


## License: Apache-2.0
https://github.com/mobiledgex/edge-cloud-infra/blob/a4b8cf11b76a8f355b9a59106db23c476c2332e9/ansible/templates/mexplat/console-nginx-config.j2

```
Repo is clean (`fc5b8a6`). Here is your complete manual step-by-step guide:

---

## Manual VPS Deployment Guide — LoveNest

> SSH into your VPS first, then run every command below in order.

---

### STEP 1 — System Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw
```

---

### STEP 2 — Install Node.js 20 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v    # must show v20.x.x
```

---

### STEP 3 — Install PM2

```bash
npm install -g pm2
pm2 startup   # ← copy and run the command it prints (starts PM2 on reboot)
```

---

### STEP 4 — Install Redis

```bash
sudo apt install -y redis-server
sudo nano /etc/redis/redis.conf
# Find the line: supervised no
# Change it to:  supervised systemd
# Save (Ctrl+O, Enter, Ctrl+X)

sudo systemctl restart redis-server
sudo systemctl enable redis-server
redis-cli ping   # must return: PONG
```

---

### STEP 5 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### STEP 6 — Clone Repo & Setup Backend

```bash
git clone https://github.com/Sayakdas12/LoveNest.git /var/www/lovenest
cd /var/www/lovenest/Backend
npm install --omit=dev

# Create your .env file:
nano .env
```

Paste your **production `.env`** (same as your local Backend/.env but change these values):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://lovenest.in
# ... all your other keys (MongoDB, JWT, Razorpay, etc.) stay the same
```

---

### STEP 7 — Start Backend with PM2

```bash
cd /var/www/lovenest/Backend
pm2 start src/app.js --name lovenest-api
pm2 save

# Verify it's running:
pm2 logs lovenest-api --lines 30
# Press Ctrl+C to exit logs

# Quick test (should return something, not connection refused):
curl http://localhost:3000
```

---

### STEP 8 — Build Frontend

```bash
cd /var/www/lovenest/Frontend
npm install

# Create production env file:
nano .env.production
```

Paste:
```
VITE_API_URL=https://lovenest.in/api
VITE_SOCKET_URL=https://lovenest.in
```

```bash
npm run build
# Creates /var/www/lovenest/Frontend/dist/
ls dist/   # should show index.html, assets/
```

---

### STEP 9 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lovenest
```

**Paste this entire config:**

```nginx
# ── HTTP → redirect to HTTPS ──────────────────────────────────────────────────
server {
    listen 80;
    server_name lovenest.in www.lovenest.in;

    # Certbot will add a location block here during Step 10
    location / {
        return 301 https://$host$request_uri;
    }
}

# ── HTTPS main server ─────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    server_name lovenest.in www.lovenest.in;

    # SSL certs — Certbot fills these in Step 10
    # ssl_certificate     /etc/letsencrypt/live/lovenest.in/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/lovenest.in/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upload size (profile photos)
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # ── Socket.IO (WebSocket) ─────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ── API reverse proxy ─────────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-
```


## License: MIT
https://github.com/Vbubblery/blog/blob/12e3310f173fc2ae7689dfea68ae69464908ea25/_posts/2018-10-22-Node.js-Project-Online.md

```
Repo is clean (`fc5b8a6`). Here is your complete manual step-by-step guide:

---

## Manual VPS Deployment Guide — LoveNest

> SSH into your VPS first, then run every command below in order.

---

### STEP 1 — System Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw
```

---

### STEP 2 — Install Node.js 20 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v    # must show v20.x.x
```

---

### STEP 3 — Install PM2

```bash
npm install -g pm2
pm2 startup   # ← copy and run the command it prints (starts PM2 on reboot)
```

---

### STEP 4 — Install Redis

```bash
sudo apt install -y redis-server
sudo nano /etc/redis/redis.conf
# Find the line: supervised no
# Change it to:  supervised systemd
# Save (Ctrl+O, Enter, Ctrl+X)

sudo systemctl restart redis-server
sudo systemctl enable redis-server
redis-cli ping   # must return: PONG
```

---

### STEP 5 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### STEP 6 — Clone Repo & Setup Backend

```bash
git clone https://github.com/Sayakdas12/LoveNest.git /var/www/lovenest
cd /var/www/lovenest/Backend
npm install --omit=dev

# Create your .env file:
nano .env
```

Paste your **production `.env`** (same as your local Backend/.env but change these values):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://lovenest.in
# ... all your other keys (MongoDB, JWT, Razorpay, etc.) stay the same
```

---

### STEP 7 — Start Backend with PM2

```bash
cd /var/www/lovenest/Backend
pm2 start src/app.js --name lovenest-api
pm2 save

# Verify it's running:
pm2 logs lovenest-api --lines 30
# Press Ctrl+C to exit logs

# Quick test (should return something, not connection refused):
curl http://localhost:3000
```

---

### STEP 8 — Build Frontend

```bash
cd /var/www/lovenest/Frontend
npm install

# Create production env file:
nano .env.production
```

Paste:
```
VITE_API_URL=https://lovenest.in/api
VITE_SOCKET_URL=https://lovenest.in
```

```bash
npm run build
# Creates /var/www/lovenest/Frontend/dist/
ls dist/   # should show index.html, assets/
```

---

### STEP 9 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lovenest
```

**Paste this entire config:**

```nginx
# ── HTTP → redirect to HTTPS ──────────────────────────────────────────────────
server {
    listen 80;
    server_name lovenest.in www.lovenest.in;

    # Certbot will add a location block here during Step 10
    location / {
        return 301 https://$host$request_uri;
    }
}

# ── HTTPS main server ─────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    server_name lovenest.in www.lovenest.in;

    # SSL certs — Certbot fills these in Step 10
    # ssl_certificate     /etc/letsencrypt/live/lovenest.in/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/lovenest.in/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upload size (profile photos)
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # ── Socket.IO (WebSocket) ─────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ── API reverse proxy ─────────────────────────────────────────────────
```


## License: unknown
https://github.com/paulguerrero/paulguerrero.github.io/blob/dad8504f1280a4b4d493f767c5328438e6e928cc/misc/nginx.conf

```
Repo is clean (`fc5b8a6`). Here is your complete manual step-by-step guide:

---

## Manual VPS Deployment Guide — LoveNest

> SSH into your VPS first, then run every command below in order.

---

### STEP 1 — System Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw
```

---

### STEP 2 — Install Node.js 20 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v    # must show v20.x.x
```

---

### STEP 3 — Install PM2

```bash
npm install -g pm2
pm2 startup   # ← copy and run the command it prints (starts PM2 on reboot)
```

---

### STEP 4 — Install Redis

```bash
sudo apt install -y redis-server
sudo nano /etc/redis/redis.conf
# Find the line: supervised no
# Change it to:  supervised systemd
# Save (Ctrl+O, Enter, Ctrl+X)

sudo systemctl restart redis-server
sudo systemctl enable redis-server
redis-cli ping   # must return: PONG
```

---

### STEP 5 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### STEP 6 — Clone Repo & Setup Backend

```bash
git clone https://github.com/Sayakdas12/LoveNest.git /var/www/lovenest
cd /var/www/lovenest/Backend
npm install --omit=dev

# Create your .env file:
nano .env
```

Paste your **production `.env`** (same as your local Backend/.env but change these values):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://lovenest.in
# ... all your other keys (MongoDB, JWT, Razorpay, etc.) stay the same
```

---

### STEP 7 — Start Backend with PM2

```bash
cd /var/www/lovenest/Backend
pm2 start src/app.js --name lovenest-api
pm2 save

# Verify it's running:
pm2 logs lovenest-api --lines 30
# Press Ctrl+C to exit logs

# Quick test (should return something, not connection refused):
curl http://localhost:3000
```

---

### STEP 8 — Build Frontend

```bash
cd /var/www/lovenest/Frontend
npm install

# Create production env file:
nano .env.production
```

Paste:
```
VITE_API_URL=https://lovenest.in/api
VITE_SOCKET_URL=https://lovenest.in
```

```bash
npm run build
# Creates /var/www/lovenest/Frontend/dist/
ls dist/   # should show index.html, assets/
```

---

### STEP 9 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lovenest
```

**Paste this entire config:**

```nginx
# ── HTTP → redirect to HTTPS ──────────────────────────────────────────────────
server {
    listen 80;
    server_name lovenest.in www.lovenest.in;

    # Certbot will add a location block here during Step 10
    location / {
        return 301 https://$host$request_uri;
    }
}

# ── HTTPS main server ─────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    server_name lovenest.in www.lovenest.in;

    # SSL certs — Certbot fills these in Step 10
    # ssl_certificate     /etc/letsencrypt/live/lovenest.in/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/lovenest.in/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upload size (profile photos)
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # ── Socket.IO (WebSocket) ─────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ── API reverse proxy ─────────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:3000/;
```


## License: Apache-2.0
https://github.com/mobiledgex/edge-cloud-infra/blob/a4b8cf11b76a8f355b9a59106db23c476c2332e9/ansible/templates/mexplat/console-nginx-config.j2

```
Repo is clean (`fc5b8a6`). Here is your complete manual step-by-step guide:

---

## Manual VPS Deployment Guide — LoveNest

> SSH into your VPS first, then run every command below in order.

---

### STEP 1 — System Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw
```

---

### STEP 2 — Install Node.js 20 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v    # must show v20.x.x
```

---

### STEP 3 — Install PM2

```bash
npm install -g pm2
pm2 startup   # ← copy and run the command it prints (starts PM2 on reboot)
```

---

### STEP 4 — Install Redis

```bash
sudo apt install -y redis-server
sudo nano /etc/redis/redis.conf
# Find the line: supervised no
# Change it to:  supervised systemd
# Save (Ctrl+O, Enter, Ctrl+X)

sudo systemctl restart redis-server
sudo systemctl enable redis-server
redis-cli ping   # must return: PONG
```

---

### STEP 5 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### STEP 6 — Clone Repo & Setup Backend

```bash
git clone https://github.com/Sayakdas12/LoveNest.git /var/www/lovenest
cd /var/www/lovenest/Backend
npm install --omit=dev

# Create your .env file:
nano .env
```

Paste your **production `.env`** (same as your local Backend/.env but change these values):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://lovenest.in
# ... all your other keys (MongoDB, JWT, Razorpay, etc.) stay the same
```

---

### STEP 7 — Start Backend with PM2

```bash
cd /var/www/lovenest/Backend
pm2 start src/app.js --name lovenest-api
pm2 save

# Verify it's running:
pm2 logs lovenest-api --lines 30
# Press Ctrl+C to exit logs

# Quick test (should return something, not connection refused):
curl http://localhost:3000
```

---

### STEP 8 — Build Frontend

```bash
cd /var/www/lovenest/Frontend
npm install

# Create production env file:
nano .env.production
```

Paste:
```
VITE_API_URL=https://lovenest.in/api
VITE_SOCKET_URL=https://lovenest.in
```

```bash
npm run build
# Creates /var/www/lovenest/Frontend/dist/
ls dist/   # should show index.html, assets/
```

---

### STEP 9 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lovenest
```

**Paste this entire config:**

```nginx
# ── HTTP → redirect to HTTPS ──────────────────────────────────────────────────
server {
    listen 80;
    server_name lovenest.in www.lovenest.in;

    # Certbot will add a location block here during Step 10
    location / {
        return 301 https://$host$request_uri;
    }
}

# ── HTTPS main server ─────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    server_name lovenest.in www.lovenest.in;

    # SSL certs — Certbot fills these in Step 10
    # ssl_certificate     /etc/letsencrypt/live/lovenest.in/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/lovenest.in/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upload size (profile photos)
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # ── Socket.IO (WebSocket) ─────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ── API reverse proxy ─────────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-
```


## License: unknown
https://github.com/paulguerrero/paulguerrero.github.io/blob/dad8504f1280a4b4d493f767c5328438e6e928cc/misc/nginx.conf

```
Repo is clean (`fc5b8a6`). Here is your complete manual step-by-step guide:

---

## Manual VPS Deployment Guide — LoveNest

> SSH into your VPS first, then run every command below in order.

---

### STEP 1 — System Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw
```

---

### STEP 2 — Install Node.js 20 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v    # must show v20.x.x
```

---

### STEP 3 — Install PM2

```bash
npm install -g pm2
pm2 startup   # ← copy and run the command it prints (starts PM2 on reboot)
```

---

### STEP 4 — Install Redis

```bash
sudo apt install -y redis-server
sudo nano /etc/redis/redis.conf
# Find the line: supervised no
# Change it to:  supervised systemd
# Save (Ctrl+O, Enter, Ctrl+X)

sudo systemctl restart redis-server
sudo systemctl enable redis-server
redis-cli ping   # must return: PONG
```

---

### STEP 5 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### STEP 6 — Clone Repo & Setup Backend

```bash
git clone https://github.com/Sayakdas12/LoveNest.git /var/www/lovenest
cd /var/www/lovenest/Backend
npm install --omit=dev

# Create your .env file:
nano .env
```

Paste your **production `.env`** (same as your local Backend/.env but change these values):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://lovenest.in
# ... all your other keys (MongoDB, JWT, Razorpay, etc.) stay the same
```

---

### STEP 7 — Start Backend with PM2

```bash
cd /var/www/lovenest/Backend
pm2 start src/app.js --name lovenest-api
pm2 save

# Verify it's running:
pm2 logs lovenest-api --lines 30
# Press Ctrl+C to exit logs

# Quick test (should return something, not connection refused):
curl http://localhost:3000
```

---

### STEP 8 — Build Frontend

```bash
cd /var/www/lovenest/Frontend
npm install

# Create production env file:
nano .env.production
```

Paste:
```
VITE_API_URL=https://lovenest.in/api
VITE_SOCKET_URL=https://lovenest.in
```

```bash
npm run build
# Creates /var/www/lovenest/Frontend/dist/
ls dist/   # should show index.html, assets/
```

---

### STEP 9 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lovenest
```

**Paste this entire config:**

```nginx
# ── HTTP → redirect to HTTPS ──────────────────────────────────────────────────
server {
    listen 80;
    server_name lovenest.in www.lovenest.in;

    # Certbot will add a location block here during Step 10
    location / {
        return 301 https://$host$request_uri;
    }
}

# ── HTTPS main server ─────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    server_name lovenest.in www.lovenest.in;

    # SSL certs — Certbot fills these in Step 10
    # ssl_certificate     /etc/letsencrypt/live/lovenest.in/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/lovenest.in/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upload size (profile photos)
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # ── Socket.IO (WebSocket) ─────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ── API reverse proxy ─────────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:3000/;
```


## License: MIT
https://github.com/Vbubblery/blog/blob/12e3310f173fc2ae7689dfea68ae69464908ea25/_posts/2018-10-22-Node.js-Project-Online.md

```
Repo is clean (`fc5b8a6`). Here is your complete manual step-by-step guide:

---

## Manual VPS Deployment Guide — LoveNest

> SSH into your VPS first, then run every command below in order.

---

### STEP 1 — System Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw
```

---

### STEP 2 — Install Node.js 20 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v    # must show v20.x.x
```

---

### STEP 3 — Install PM2

```bash
npm install -g pm2
pm2 startup   # ← copy and run the command it prints (starts PM2 on reboot)
```

---

### STEP 4 — Install Redis

```bash
sudo apt install -y redis-server
sudo nano /etc/redis/redis.conf
# Find the line: supervised no
# Change it to:  supervised systemd
# Save (Ctrl+O, Enter, Ctrl+X)

sudo systemctl restart redis-server
sudo systemctl enable redis-server
redis-cli ping   # must return: PONG
```

---

### STEP 5 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### STEP 6 — Clone Repo & Setup Backend

```bash
git clone https://github.com/Sayakdas12/LoveNest.git /var/www/lovenest
cd /var/www/lovenest/Backend
npm install --omit=dev

# Create your .env file:
nano .env
```

Paste your **production `.env`** (same as your local Backend/.env but change these values):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://lovenest.in
# ... all your other keys (MongoDB, JWT, Razorpay, etc.) stay the same
```

---

### STEP 7 — Start Backend with PM2

```bash
cd /var/www/lovenest/Backend
pm2 start src/app.js --name lovenest-api
pm2 save

# Verify it's running:
pm2 logs lovenest-api --lines 30
# Press Ctrl+C to exit logs

# Quick test (should return something, not connection refused):
curl http://localhost:3000
```

---

### STEP 8 — Build Frontend

```bash
cd /var/www/lovenest/Frontend
npm install

# Create production env file:
nano .env.production
```

Paste:
```
VITE_API_URL=https://lovenest.in/api
VITE_SOCKET_URL=https://lovenest.in
```

```bash
npm run build
# Creates /var/www/lovenest/Frontend/dist/
ls dist/   # should show index.html, assets/
```

---

### STEP 9 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lovenest
```

**Paste this entire config:**

```nginx
# ── HTTP → redirect to HTTPS ──────────────────────────────────────────────────
server {
    listen 80;
    server_name lovenest.in www.lovenest.in;

    # Certbot will add a location block here during Step 10
    location / {
        return 301 https://$host$request_uri;
    }
}

# ── HTTPS main server ─────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    server_name lovenest.in www.lovenest.in;

    # SSL certs — Certbot fills these in Step 10
    # ssl_certificate     /etc/letsencrypt/live/lovenest.in/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/lovenest.in/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upload size (profile photos)
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # ── Socket.IO (WebSocket) ─────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ── API reverse proxy ─────────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:3000/;
```


## License: Apache-2.0
https://github.com/mobiledgex/edge-cloud-infra/blob/a4b8cf11b76a8f355b9a59106db23c476c2332e9/ansible/templates/mexplat/console-nginx-config.j2

```
Repo is clean (`fc5b8a6`). Here is your complete manual step-by-step guide:

---

## Manual VPS Deployment Guide — LoveNest

> SSH into your VPS first, then run every command below in order.

---

### STEP 1 — System Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw
```

---

### STEP 2 — Install Node.js 20 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v    # must show v20.x.x
```

---

### STEP 3 — Install PM2

```bash
npm install -g pm2
pm2 startup   # ← copy and run the command it prints (starts PM2 on reboot)
```

---

### STEP 4 — Install Redis

```bash
sudo apt install -y redis-server
sudo nano /etc/redis/redis.conf
# Find the line: supervised no
# Change it to:  supervised systemd
# Save (Ctrl+O, Enter, Ctrl+X)

sudo systemctl restart redis-server
sudo systemctl enable redis-server
redis-cli ping   # must return: PONG
```

---

### STEP 5 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### STEP 6 — Clone Repo & Setup Backend

```bash
git clone https://github.com/Sayakdas12/LoveNest.git /var/www/lovenest
cd /var/www/lovenest/Backend
npm install --omit=dev

# Create your .env file:
nano .env
```

Paste your **production `.env`** (same as your local Backend/.env but change these values):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://lovenest.in
# ... all your other keys (MongoDB, JWT, Razorpay, etc.) stay the same
```

---

### STEP 7 — Start Backend with PM2

```bash
cd /var/www/lovenest/Backend
pm2 start src/app.js --name lovenest-api
pm2 save

# Verify it's running:
pm2 logs lovenest-api --lines 30
# Press Ctrl+C to exit logs

# Quick test (should return something, not connection refused):
curl http://localhost:3000
```

---

### STEP 8 — Build Frontend

```bash
cd /var/www/lovenest/Frontend
npm install

# Create production env file:
nano .env.production
```

Paste:
```
VITE_API_URL=https://lovenest.in/api
VITE_SOCKET_URL=https://lovenest.in
```

```bash
npm run build
# Creates /var/www/lovenest/Frontend/dist/
ls dist/   # should show index.html, assets/
```

---

### STEP 9 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lovenest
```

**Paste this entire config:**

```nginx
# ── HTTP → redirect to HTTPS ──────────────────────────────────────────────────
server {
    listen 80;
    server_name lovenest.in www.lovenest.in;

    # Certbot will add a location block here during Step 10
    location / {
        return 301 https://$host$request_uri;
    }
}

# ── HTTPS main server ─────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    server_name lovenest.in www.lovenest.in;

    # SSL certs — Certbot fills these in Step 10
    # ssl_certificate     /etc/letsencrypt/live/lovenest.in/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/lovenest.in/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upload size (profile photos)
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # ── Socket.IO (WebSocket) ─────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ── API reverse proxy ─────────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-
```

