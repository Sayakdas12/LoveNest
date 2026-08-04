# Code Citations

## License: MIT
https://github.com/yafoo/iijs/blob/3ff17b1649ef29138e5e639badf8cd9867db24fb/README.md

```
## Step-by-Step: Ubuntu Container → Test LoveNest Deployment Locally

---

### STEP 1 — Start the Ubuntu Container

Open **PowerShell** and run:

```powershell
docker run -it `
  --name lovenest-vps `
  -p 80:80 `
  -p 443:443 `
  -p 3000:3000 `
  -v "D:\My Project\LoveNest:/var/www/lovenest" `
  ubuntu:22.04 `
  /bin/bash
```

> You're now **inside** the Ubuntu container. Your project is live-mounted at `/var/www/lovenest`.

---

### STEP 2 — System Setup (inside container)

```bash
apt update && apt upgrade -y
apt install -y git curl build-essential nano nginx redis-server
```

---

### STEP 3 — Install Node.js 20

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v    # should show v20.x.x
npm -v
```

---

### STEP 4 — Install PM2

```bash
npm install -g pm2
```

---

### STEP 5 — Start Redis

```bash
service redis-server start
redis-cli ping    # should return: PONG
```

---

### STEP 6 — Setup Backend

```bash
cd /var/www/lovenest/Backend
npm install --omit=dev
```

Create the `.env` file:
```bash
nano .env
```
Paste your production values (copy from your local `Backend/.env` but change `NODE_ENV`):
```
NODE_ENV=production
PORT=3000
# ... rest of your keys exactly as in your local .env
```
Save: `Ctrl+O` → `Enter` → `Ctrl+X`

Start with PM2:
```bash
pm2 start src/app.js --name lovenest-api
pm2 logs lovenest-api --lines 20
# Ctrl+C to exit logs
```

Quick test — open a **new PowerShell window** on Windows and run:
```powershell
curl http://localhost:3000
```
You should get a response (not "connection refused"). ✅

---

### STEP 7 — Build Frontend

Back in the container:
```bash
cd /var/www/lovenest/Frontend
npm install
nano .env.production
```
Paste:
```
VITE_API_URL=http://localhost/api
VITE_SOCKET_URL=http://localhost
```
> Note: Using `http://localhost` here (no SSL locally). For real VPS you'll use `https://lovenest.in`.

```bash
npm run build
ls dist/    # should show index.html + assets/
```

---

### STEP 8 — Configure Nginx

```bash
nano /etc/nginx/sites-available/lovenest
```

Paste this full config:

```nginx
server {
    listen 80;
    server_name localhost;

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Socket.IO
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }

    # API
    location /api/ {
        proxy_pass       http://127.0.0.1:3000/;
        proxy_http_version 
```


## License: MIT
https://github.com/yafoo/iijs/blob/3ff17b1649ef29138e5e639badf8cd9867db24fb/README.md

```
## Step-by-Step: Ubuntu Container → Test LoveNest Deployment Locally

---

### STEP 1 — Start the Ubuntu Container

Open **PowerShell** and run:

```powershell
docker run -it `
  --name lovenest-vps `
  -p 80:80 `
  -p 443:443 `
  -p 3000:3000 `
  -v "D:\My Project\LoveNest:/var/www/lovenest" `
  ubuntu:22.04 `
  /bin/bash
```

> You're now **inside** the Ubuntu container. Your project is live-mounted at `/var/www/lovenest`.

---

### STEP 2 — System Setup (inside container)

```bash
apt update && apt upgrade -y
apt install -y git curl build-essential nano nginx redis-server
```

---

### STEP 3 — Install Node.js 20

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v    # should show v20.x.x
npm -v
```

---

### STEP 4 — Install PM2

```bash
npm install -g pm2
```

---

### STEP 5 — Start Redis

```bash
service redis-server start
redis-cli ping    # should return: PONG
```

---

### STEP 6 — Setup Backend

```bash
cd /var/www/lovenest/Backend
npm install --omit=dev
```

Create the `.env` file:
```bash
nano .env
```
Paste your production values (copy from your local `Backend/.env` but change `NODE_ENV`):
```
NODE_ENV=production
PORT=3000
# ... rest of your keys exactly as in your local .env
```
Save: `Ctrl+O` → `Enter` → `Ctrl+X`

Start with PM2:
```bash
pm2 start src/app.js --name lovenest-api
pm2 logs lovenest-api --lines 20
# Ctrl+C to exit logs
```

Quick test — open a **new PowerShell window** on Windows and run:
```powershell
curl http://localhost:3000
```
You should get a response (not "connection refused"). ✅

---

### STEP 7 — Build Frontend

Back in the container:
```bash
cd /var/www/lovenest/Frontend
npm install
nano .env.production
```
Paste:
```
VITE_API_URL=http://localhost/api
VITE_SOCKET_URL=http://localhost
```
> Note: Using `http://localhost` here (no SSL locally). For real VPS you'll use `https://lovenest.in`.

```bash
npm run build
ls dist/    # should show index.html + assets/
```

---

### STEP 8 — Configure Nginx

```bash
nano /etc/nginx/sites-available/lovenest
```

Paste this full config:

```nginx
server {
    listen 80;
    server_name localhost;

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Socket.IO
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }

    # API
    location /api/ {
        proxy_pass       http://127.0.0.1:3000/;
        proxy_http_version 
```


## License: MIT
https://github.com/yafoo/iijs/blob/3ff17b1649ef29138e5e639badf8cd9867db24fb/README.md

```
## Step-by-Step: Ubuntu Container → Test LoveNest Deployment Locally

---

### STEP 1 — Start the Ubuntu Container

Open **PowerShell** and run:

```powershell
docker run -it `
  --name lovenest-vps `
  -p 80:80 `
  -p 443:443 `
  -p 3000:3000 `
  -v "D:\My Project\LoveNest:/var/www/lovenest" `
  ubuntu:22.04 `
  /bin/bash
```

> You're now **inside** the Ubuntu container. Your project is live-mounted at `/var/www/lovenest`.

---

### STEP 2 — System Setup (inside container)

```bash
apt update && apt upgrade -y
apt install -y git curl build-essential nano nginx redis-server
```

---

### STEP 3 — Install Node.js 20

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v    # should show v20.x.x
npm -v
```

---

### STEP 4 — Install PM2

```bash
npm install -g pm2
```

---

### STEP 5 — Start Redis

```bash
service redis-server start
redis-cli ping    # should return: PONG
```

---

### STEP 6 — Setup Backend

```bash
cd /var/www/lovenest/Backend
npm install --omit=dev
```

Create the `.env` file:
```bash
nano .env
```
Paste your production values (copy from your local `Backend/.env` but change `NODE_ENV`):
```
NODE_ENV=production
PORT=3000
# ... rest of your keys exactly as in your local .env
```
Save: `Ctrl+O` → `Enter` → `Ctrl+X`

Start with PM2:
```bash
pm2 start src/app.js --name lovenest-api
pm2 logs lovenest-api --lines 20
# Ctrl+C to exit logs
```

Quick test — open a **new PowerShell window** on Windows and run:
```powershell
curl http://localhost:3000
```
You should get a response (not "connection refused"). ✅

---

### STEP 7 — Build Frontend

Back in the container:
```bash
cd /var/www/lovenest/Frontend
npm install
nano .env.production
```
Paste:
```
VITE_API_URL=http://localhost/api
VITE_SOCKET_URL=http://localhost
```
> Note: Using `http://localhost` here (no SSL locally). For real VPS you'll use `https://lovenest.in`.

```bash
npm run build
ls dist/    # should show index.html + assets/
```

---

### STEP 8 — Configure Nginx

```bash
nano /etc/nginx/sites-available/lovenest
```

Paste this full config:

```nginx
server {
    listen 80;
    server_name localhost;

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Socket.IO
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }

    # API
    location /api/ {
        proxy_pass       http://127.0.0.1:3000/;
        proxy_http_version 
```


## License: MIT
https://github.com/yafoo/iijs/blob/3ff17b1649ef29138e5e639badf8cd9867db24fb/README.md

```
## Step-by-Step: Ubuntu Container → Test LoveNest Deployment Locally

---

### STEP 1 — Start the Ubuntu Container

Open **PowerShell** and run:

```powershell
docker run -it `
  --name lovenest-vps `
  -p 80:80 `
  -p 443:443 `
  -p 3000:3000 `
  -v "D:\My Project\LoveNest:/var/www/lovenest" `
  ubuntu:22.04 `
  /bin/bash
```

> You're now **inside** the Ubuntu container. Your project is live-mounted at `/var/www/lovenest`.

---

### STEP 2 — System Setup (inside container)

```bash
apt update && apt upgrade -y
apt install -y git curl build-essential nano nginx redis-server
```

---

### STEP 3 — Install Node.js 20

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v    # should show v20.x.x
npm -v
```

---

### STEP 4 — Install PM2

```bash
npm install -g pm2
```

---

### STEP 5 — Start Redis

```bash
service redis-server start
redis-cli ping    # should return: PONG
```

---

### STEP 6 — Setup Backend

```bash
cd /var/www/lovenest/Backend
npm install --omit=dev
```

Create the `.env` file:
```bash
nano .env
```
Paste your production values (copy from your local `Backend/.env` but change `NODE_ENV`):
```
NODE_ENV=production
PORT=3000
# ... rest of your keys exactly as in your local .env
```
Save: `Ctrl+O` → `Enter` → `Ctrl+X`

Start with PM2:
```bash
pm2 start src/app.js --name lovenest-api
pm2 logs lovenest-api --lines 20
# Ctrl+C to exit logs
```

Quick test — open a **new PowerShell window** on Windows and run:
```powershell
curl http://localhost:3000
```
You should get a response (not "connection refused"). ✅

---

### STEP 7 — Build Frontend

Back in the container:
```bash
cd /var/www/lovenest/Frontend
npm install
nano .env.production
```
Paste:
```
VITE_API_URL=http://localhost/api
VITE_SOCKET_URL=http://localhost
```
> Note: Using `http://localhost` here (no SSL locally). For real VPS you'll use `https://lovenest.in`.

```bash
npm run build
ls dist/    # should show index.html + assets/
```

---

### STEP 8 — Configure Nginx

```bash
nano /etc/nginx/sites-available/lovenest
```

Paste this full config:

```nginx
server {
    listen 80;
    server_name localhost;

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Socket.IO
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }

    # API
    location /api/ {
        proxy_pass       http://127.0.0.1:3000/;
        proxy_http_version 
```


## License: MIT
https://github.com/yafoo/iijs/blob/3ff17b1649ef29138e5e639badf8cd9867db24fb/README.md

```
## Step-by-Step: Ubuntu Container → Test LoveNest Deployment Locally

---

### STEP 1 — Start the Ubuntu Container

Open **PowerShell** and run:

```powershell
docker run -it `
  --name lovenest-vps `
  -p 80:80 `
  -p 443:443 `
  -p 3000:3000 `
  -v "D:\My Project\LoveNest:/var/www/lovenest" `
  ubuntu:22.04 `
  /bin/bash
```

> You're now **inside** the Ubuntu container. Your project is live-mounted at `/var/www/lovenest`.

---

### STEP 2 — System Setup (inside container)

```bash
apt update && apt upgrade -y
apt install -y git curl build-essential nano nginx redis-server
```

---

### STEP 3 — Install Node.js 20

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v    # should show v20.x.x
npm -v
```

---

### STEP 4 — Install PM2

```bash
npm install -g pm2
```

---

### STEP 5 — Start Redis

```bash
service redis-server start
redis-cli ping    # should return: PONG
```

---

### STEP 6 — Setup Backend

```bash
cd /var/www/lovenest/Backend
npm install --omit=dev
```

Create the `.env` file:
```bash
nano .env
```
Paste your production values (copy from your local `Backend/.env` but change `NODE_ENV`):
```
NODE_ENV=production
PORT=3000
# ... rest of your keys exactly as in your local .env
```
Save: `Ctrl+O` → `Enter` → `Ctrl+X`

Start with PM2:
```bash
pm2 start src/app.js --name lovenest-api
pm2 logs lovenest-api --lines 20
# Ctrl+C to exit logs
```

Quick test — open a **new PowerShell window** on Windows and run:
```powershell
curl http://localhost:3000
```
You should get a response (not "connection refused"). ✅

---

### STEP 7 — Build Frontend

Back in the container:
```bash
cd /var/www/lovenest/Frontend
npm install
nano .env.production
```
Paste:
```
VITE_API_URL=http://localhost/api
VITE_SOCKET_URL=http://localhost
```
> Note: Using `http://localhost` here (no SSL locally). For real VPS you'll use `https://lovenest.in`.

```bash
npm run build
ls dist/    # should show index.html + assets/
```

---

### STEP 8 — Configure Nginx

```bash
nano /etc/nginx/sites-available/lovenest
```

Paste this full config:

```nginx
server {
    listen 80;
    server_name localhost;

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Socket.IO
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }

    # API
    location /api/ {
        proxy_pass       http://127.0.0.1:3000/;
        proxy_http_version 
```


## License: MIT
https://github.com/yafoo/iijs/blob/3ff17b1649ef29138e5e639badf8cd9867db24fb/README.md

```
## Step-by-Step: Ubuntu Container → Test LoveNest Deployment Locally

---

### STEP 1 — Start the Ubuntu Container

Open **PowerShell** and run:

```powershell
docker run -it `
  --name lovenest-vps `
  -p 80:80 `
  -p 443:443 `
  -p 3000:3000 `
  -v "D:\My Project\LoveNest:/var/www/lovenest" `
  ubuntu:22.04 `
  /bin/bash
```

> You're now **inside** the Ubuntu container. Your project is live-mounted at `/var/www/lovenest`.

---

### STEP 2 — System Setup (inside container)

```bash
apt update && apt upgrade -y
apt install -y git curl build-essential nano nginx redis-server
```

---

### STEP 3 — Install Node.js 20

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v    # should show v20.x.x
npm -v
```

---

### STEP 4 — Install PM2

```bash
npm install -g pm2
```

---

### STEP 5 — Start Redis

```bash
service redis-server start
redis-cli ping    # should return: PONG
```

---

### STEP 6 — Setup Backend

```bash
cd /var/www/lovenest/Backend
npm install --omit=dev
```

Create the `.env` file:
```bash
nano .env
```
Paste your production values (copy from your local `Backend/.env` but change `NODE_ENV`):
```
NODE_ENV=production
PORT=3000
# ... rest of your keys exactly as in your local .env
```
Save: `Ctrl+O` → `Enter` → `Ctrl+X`

Start with PM2:
```bash
pm2 start src/app.js --name lovenest-api
pm2 logs lovenest-api --lines 20
# Ctrl+C to exit logs
```

Quick test — open a **new PowerShell window** on Windows and run:
```powershell
curl http://localhost:3000
```
You should get a response (not "connection refused"). ✅

---

### STEP 7 — Build Frontend

Back in the container:
```bash
cd /var/www/lovenest/Frontend
npm install
nano .env.production
```
Paste:
```
VITE_API_URL=http://localhost/api
VITE_SOCKET_URL=http://localhost
```
> Note: Using `http://localhost` here (no SSL locally). For real VPS you'll use `https://lovenest.in`.

```bash
npm run build
ls dist/    # should show index.html + assets/
```

---

### STEP 8 — Configure Nginx

```bash
nano /etc/nginx/sites-available/lovenest
```

Paste this full config:

```nginx
server {
    listen 80;
    server_name localhost;

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Socket.IO
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }

    # API
    location /api/ {
        proxy_pass       http://127.0.0.1:3000/;
        proxy_http_version 
```


## License: MIT
https://github.com/yafoo/iijs/blob/3ff17b1649ef29138e5e639badf8cd9867db24fb/README.md

```
## Step-by-Step: Ubuntu Container → Test LoveNest Deployment Locally

---

### STEP 1 — Start the Ubuntu Container

Open **PowerShell** and run:

```powershell
docker run -it `
  --name lovenest-vps `
  -p 80:80 `
  -p 443:443 `
  -p 3000:3000 `
  -v "D:\My Project\LoveNest:/var/www/lovenest" `
  ubuntu:22.04 `
  /bin/bash
```

> You're now **inside** the Ubuntu container. Your project is live-mounted at `/var/www/lovenest`.

---

### STEP 2 — System Setup (inside container)

```bash
apt update && apt upgrade -y
apt install -y git curl build-essential nano nginx redis-server
```

---

### STEP 3 — Install Node.js 20

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v    # should show v20.x.x
npm -v
```

---

### STEP 4 — Install PM2

```bash
npm install -g pm2
```

---

### STEP 5 — Start Redis

```bash
service redis-server start
redis-cli ping    # should return: PONG
```

---

### STEP 6 — Setup Backend

```bash
cd /var/www/lovenest/Backend
npm install --omit=dev
```

Create the `.env` file:
```bash
nano .env
```
Paste your production values (copy from your local `Backend/.env` but change `NODE_ENV`):
```
NODE_ENV=production
PORT=3000
# ... rest of your keys exactly as in your local .env
```
Save: `Ctrl+O` → `Enter` → `Ctrl+X`

Start with PM2:
```bash
pm2 start src/app.js --name lovenest-api
pm2 logs lovenest-api --lines 20
# Ctrl+C to exit logs
```

Quick test — open a **new PowerShell window** on Windows and run:
```powershell
curl http://localhost:3000
```
You should get a response (not "connection refused"). ✅

---

### STEP 7 — Build Frontend

Back in the container:
```bash
cd /var/www/lovenest/Frontend
npm install
nano .env.production
```
Paste:
```
VITE_API_URL=http://localhost/api
VITE_SOCKET_URL=http://localhost
```
> Note: Using `http://localhost` here (no SSL locally). For real VPS you'll use `https://lovenest.in`.

```bash
npm run build
ls dist/    # should show index.html + assets/
```

---

### STEP 8 — Configure Nginx

```bash
nano /etc/nginx/sites-available/lovenest
```

Paste this full config:

```nginx
server {
    listen 80;
    server_name localhost;

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Socket.IO
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }

    # API
    location /api/ {
        proxy_pass       http://127.0.0.1:3000/;
        proxy_http_version 
```


## License: MIT
https://github.com/yafoo/iijs/blob/3ff17b1649ef29138e5e639badf8cd9867db24fb/README.md

```
## Step-by-Step: Ubuntu Container → Test LoveNest Deployment Locally

---

### STEP 1 — Start the Ubuntu Container

Open **PowerShell** and run:

```powershell
docker run -it `
  --name lovenest-vps `
  -p 80:80 `
  -p 443:443 `
  -p 3000:3000 `
  -v "D:\My Project\LoveNest:/var/www/lovenest" `
  ubuntu:22.04 `
  /bin/bash
```

> You're now **inside** the Ubuntu container. Your project is live-mounted at `/var/www/lovenest`.

---

### STEP 2 — System Setup (inside container)

```bash
apt update && apt upgrade -y
apt install -y git curl build-essential nano nginx redis-server
```

---

### STEP 3 — Install Node.js 20

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v    # should show v20.x.x
npm -v
```

---

### STEP 4 — Install PM2

```bash
npm install -g pm2
```

---

### STEP 5 — Start Redis

```bash
service redis-server start
redis-cli ping    # should return: PONG
```

---

### STEP 6 — Setup Backend

```bash
cd /var/www/lovenest/Backend
npm install --omit=dev
```

Create the `.env` file:
```bash
nano .env
```
Paste your production values (copy from your local `Backend/.env` but change `NODE_ENV`):
```
NODE_ENV=production
PORT=3000
# ... rest of your keys exactly as in your local .env
```
Save: `Ctrl+O` → `Enter` → `Ctrl+X`

Start with PM2:
```bash
pm2 start src/app.js --name lovenest-api
pm2 logs lovenest-api --lines 20
# Ctrl+C to exit logs
```

Quick test — open a **new PowerShell window** on Windows and run:
```powershell
curl http://localhost:3000
```
You should get a response (not "connection refused"). ✅

---

### STEP 7 — Build Frontend

Back in the container:
```bash
cd /var/www/lovenest/Frontend
npm install
nano .env.production
```
Paste:
```
VITE_API_URL=http://localhost/api
VITE_SOCKET_URL=http://localhost
```
> Note: Using `http://localhost` here (no SSL locally). For real VPS you'll use `https://lovenest.in`.

```bash
npm run build
ls dist/    # should show index.html + assets/
```

---

### STEP 8 — Configure Nginx

```bash
nano /etc/nginx/sites-available/lovenest
```

Paste this full config:

```nginx
server {
    listen 80;
    server_name localhost;

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Socket.IO
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }

    # API
    location /api/ {
        proxy_pass       http://127.0.0.1:3000/;
        proxy_http_version 
```


## License: MIT
https://github.com/yafoo/iijs/blob/3ff17b1649ef29138e5e639badf8cd9867db24fb/README.md

```
## Step-by-Step: Ubuntu Container → Test LoveNest Deployment Locally

---

### STEP 1 — Start the Ubuntu Container

Open **PowerShell** and run:

```powershell
docker run -it `
  --name lovenest-vps `
  -p 80:80 `
  -p 443:443 `
  -p 3000:3000 `
  -v "D:\My Project\LoveNest:/var/www/lovenest" `
  ubuntu:22.04 `
  /bin/bash
```

> You're now **inside** the Ubuntu container. Your project is live-mounted at `/var/www/lovenest`.

---

### STEP 2 — System Setup (inside container)

```bash
apt update && apt upgrade -y
apt install -y git curl build-essential nano nginx redis-server
```

---

### STEP 3 — Install Node.js 20

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v    # should show v20.x.x
npm -v
```

---

### STEP 4 — Install PM2

```bash
npm install -g pm2
```

---

### STEP 5 — Start Redis

```bash
service redis-server start
redis-cli ping    # should return: PONG
```

---

### STEP 6 — Setup Backend

```bash
cd /var/www/lovenest/Backend
npm install --omit=dev
```

Create the `.env` file:
```bash
nano .env
```
Paste your production values (copy from your local `Backend/.env` but change `NODE_ENV`):
```
NODE_ENV=production
PORT=3000
# ... rest of your keys exactly as in your local .env
```
Save: `Ctrl+O` → `Enter` → `Ctrl+X`

Start with PM2:
```bash
pm2 start src/app.js --name lovenest-api
pm2 logs lovenest-api --lines 20
# Ctrl+C to exit logs
```

Quick test — open a **new PowerShell window** on Windows and run:
```powershell
curl http://localhost:3000
```
You should get a response (not "connection refused"). ✅

---

### STEP 7 — Build Frontend

Back in the container:
```bash
cd /var/www/lovenest/Frontend
npm install
nano .env.production
```
Paste:
```
VITE_API_URL=http://localhost/api
VITE_SOCKET_URL=http://localhost
```
> Note: Using `http://localhost` here (no SSL locally). For real VPS you'll use `https://lovenest.in`.

```bash
npm run build
ls dist/    # should show index.html + assets/
```

---

### STEP 8 — Configure Nginx

```bash
nano /etc/nginx/sites-available/lovenest
```

Paste this full config:

```nginx
server {
    listen 80;
    server_name localhost;

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Socket.IO
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }

    # API
    location /api/ {
        proxy_pass       http://127.0.0.1:3000/;
        proxy_http_version 
```

