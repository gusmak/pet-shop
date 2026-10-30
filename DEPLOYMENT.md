# 🚀 Hướng Dẫn Deploy PetShop Lên VPS

## 📋 Tổng Quan

Hệ thống PetShop bao gồm:
- **Backend:** NestJS API (port 8000)
- **Frontend:** Next.js (port 3000)
- **Database:** PostgreSQL

## 🛠️ Yêu Cầu VPS

### Cấu hình tối thiểu
- **CPU:** 2 cores
- **RAM:** 2GB
- **Storage:** 20GB SSD
- **OS:** Ubuntu 22.04 LTS hoặc Debian 12
- **Network:** 100Mbps

### Nhà cung cấp VPS khuyến nghị
- **Việt Nam:** Viettel, VNPT, FPT, DigitalOcean Singapore
- **Quốc tế:** DigitalOcean, Linode, Vultr, AWS Lightsail

**Chi phí ước tính:** $10-30/tháng (250k-750k VND)

---

## 📦 Cách 1: Deploy Thủ Công (Production)

### Bước 1: Chuẩn bị VPS

```bash
# SSH vào VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL 15
apt install -y postgresql postgresql-contrib

# Install Nginx (reverse proxy)
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2
```

### Bước 2: Setup Database

```bash
# Login PostgreSQL
sudo -u postgres psql

# Tạo database và user
CREATE DATABASE pshop;
CREATE USER petshop_user WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE pshop TO petshop_user;
\q

# Import schema (từ local)
# Trên local machine:
psql -h your-vps-ip -U petshop_user -d pshop -f schema.sql
```

### Bước 3: Upload Code

```bash
# Trên VPS, tạo thư mục
mkdir -p /var/www/petshop
cd /var/www/petshop

# Option 1: Git clone (nếu có repo)
git clone https://github.com/yourusername/pet-shop.git .

# Option 2: Upload từ local (dùng rsync hoặc scp)
# Trên local:
rsync -avz --exclude node_modules --exclude .env ./backend root@your-vps-ip:/var/www/petshop/backend/
rsync -avz --exclude node_modules --exclude .next ./web root@your-vps-ip:/var/www/petshop/web/
```

### Bước 4: Setup Backend

```bash
cd /var/www/petshop/backend

# Install dependencies
npm install --production

# Tạo file .env
nano .env
```

**Nội dung .env:**
```env
DATABASE_URL="postgresql://petshop_user:your-strong-password@localhost:5432/pshop?schema=public"
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

```bash
# Generate Prisma client
npx prisma generate

# Build backend
npm run build

# Start với PM2
pm2 start dist/main.js --name petshop-backend
```

### Bước 5: Setup Frontend

```bash
cd /var/www/petshop/web

# Install dependencies
npm install

# Tạo file .env.production
nano .env.production
```

**Nội dung .env.production:**
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

```bash
# Build frontend
npm run build

# Start với PM2
pm2 start npm --name petshop-frontend -- start
```

### Bước 6: Setup Nginx (Reverse Proxy)

```bash
# Tạo config file
nano /etc/nginx/sites-available/petshop
```

**Nội dung config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (sau khi có SSL)
    # return 301 https://$server_name$request_uri;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API (NestJS)
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
    }
}
```

```bash
# Enable config
ln -s /etc/nginx/sites-available/petshop /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Bước 7: Setup SSL (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Lấy SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (đã được setup tự động)
certbot renew --dry-run
```

### Bước 8: Save PM2 Process List

```bash
# Save PM2 processes
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy và chạy lệnh được hiển thị
```

---

## 🐳 Cách 2: Deploy với Docker (Recommended)

### Bước 1: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install -y docker-compose-plugin
```

### Bước 2: Tạo Docker Compose File

```bash
cd /var/www/petshop
nano docker-compose.yml
```

**Nội dung docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: petshop-db
    restart: always
    environment:
      POSTGRES_DB: pshop
      POSTGRES_USER: petshop_user
      POSTGRES_PASSWORD: your-strong-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    networks:
      - petshop-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: petshop-backend
    restart: always
    environment:
      DATABASE_URL: postgresql://petshop_user:your-strong-password@postgres:5432/pshop?schema=public
      PORT: 8000
      NODE_ENV: production
      FRONTEND_URL: https://yourdomain.com
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    networks:
      - petshop-network

  frontend:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: petshop-frontend
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: https://yourdomain.com/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - petshop-network

  nginx:
    image: nginx:alpine
    container_name: petshop-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - petshop-network

volumes:
  postgres_data:

networks:
  petshop-network:
    driver: bridge
```

### Bước 3: Tạo Dockerfile cho Backend

```bash
cd /var/www/petshop/backend
nano Dockerfile
```

**Nội dung Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 8000

# Start application
CMD ["node", "dist/main.js"]
```

### Bước 4: Tạo Dockerfile cho Frontend

```bash
cd /var/www/petshop/web
nano Dockerfile
```

**Nội dung Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Bước 5: Build và Run

```bash
cd /var/www/petshop

# Build images
docker compose build

# Start services
docker compose up -d

# Xem logs
docker compose logs -f

# Stop services
docker compose down
```

---

## 🔧 Quản Lý và Bảo Trì

### Kiểm tra logs

```bash
# PM2 logs
pm2 logs petshop-backend
pm2 logs petshop-frontend

# Docker logs
docker compose logs -f backend
docker compose logs -f frontend
```

### Restart services

```bash
# PM2
pm2 restart all

# Docker
docker compose restart
```

### Update code

```bash
# Pull latest code
cd /var/www/petshop
git pull

# Backend
cd backend
npm install --production
npx prisma generate
npm run build
pm2 restart petshop-backend

# Frontend
cd ../web
npm install
npm run build
pm2 restart petshop-frontend

# Hoặc với Docker
docker compose down
docker compose build
docker compose up -d
```

### Backup database

```bash
# Manual backup
pg_dump -U petshop_user pshop > backup_$(date +%Y%m%d).sql

# Auto backup (thêm vào crontab)
crontab -e

# Thêm dòng này để backup hàng ngày lúc 2:00 AM
0 2 * * * pg_dump -U petshop_user pshop > /backups/pshop_$(date +\%Y\%m\%d).sql
```

### Monitor resources

```bash
# CPU, RAM, Disk
htop
df -h
free -m

# PM2 status
pm2 status

# Docker stats
docker stats
```

---

## 🔒 Security Checklist

- [ ] Đổi password PostgreSQL (không dùng default)
- [ ] Setup firewall (UFW)
- [ ] Enable SSL/HTTPS
- [ ] Cập nhật system thường xuyên
- [ ] Backup database hàng ngày
- [ ] Giới hạn SSH access (disable root login, dùng SSH key)
- [ ] Setup fail2ban
- [ ] Monitor logs thường xuyên

### Setup Firewall

```bash
# Enable UFW
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 22/tcp
ufw enable

# Check status
ufw status
```

### Setup Fail2ban

```bash
# Install fail2ban
apt install -y fail2ban

# Enable for SSH
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 📊 Domain Setup

### 1. Mua domain
- **Việt Nam:** tenten.vn, matbao.net, inet.vn
- **Quốc tế:** Namecheap, GoDaddy, Google Domains

### 2. Trỏ DNS về VPS
```
A Record:   @        -> your-vps-ip
A Record:   www      -> your-vps-ip
```

### 3. Đợi DNS propagate (5-30 phút)

---

## 💰 Chi Phí Ước Tính (Monthly)

| Dịch vụ | Chi phí |
|---------|---------|
| VPS (2GB RAM) | $10-20 |
| Domain (.com) | ~$15/year |
| SSL Certificate | Free (Let's Encrypt) |
| Backup Storage | $2-5 |
| **Tổng** | **~$15-30/tháng** |

---

## 🆘 Troubleshooting

### Backend không start
```bash
# Check logs
pm2 logs petshop-backend --lines 100

# Kiểm tra database connection
npx prisma studio
```

### Frontend không start
```bash
# Check logs
pm2 logs petshop-frontend --lines 100

# Xóa .next cache
rm -rf .next
npm run build
```

### Nginx 502 Bad Gateway
```bash
# Kiểm tra backend/frontend có đang chạy không
pm2 status

# Restart services
pm2 restart all
systemctl restart nginx
```

### Database connection failed
```bash
# Kiểm tra PostgreSQL
systemctl status postgresql

# Restart PostgreSQL
systemctl restart postgresql
```

---

## 📞 Hỗ Trợ

- **Hotline:** 0971 616 634
- **Zalo:** https://zalo.me/0971616634

---

**Cập nhật lần cuối:** 28/10/2026
