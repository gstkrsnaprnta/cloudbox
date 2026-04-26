# CloudBox Production Deployment Draft

Panduan ini menyiapkan deployment ke Tencent VPS. Tahap ini belum menjalankan Certbot/HTTPS sungguhan dan belum melakukan deployment langsung.

## 1. SSH ke VPS

```bash
ssh root@IP_VPS_TENCENT
```

## 2. Update Server

```bash
sudo apt update && sudo apt upgrade -y
```

## 3. Install Dependency Server

```bash
sudo apt install nginx git curl ufw unzip -y
```

## 4. Install Node.js LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install nodejs -y
node -v
npm -v
```

## 5. Install Docker

```bash
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker
docker --version
```

## 6. Clone Repository

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/username/cloudbox.git
sudo chown -R $USER:$USER /var/www/cloudbox
```

## 7. Setup Backend `.env` Production

```bash
cd /var/www/cloudbox/backend
cp .env.example .env
nano .env
```

Gunakan contoh aman di:

```txt
deploy/env-production-example.md
```

## 8. Install Backend Dependency

```bash
cd /var/www/cloudbox/backend
npm install
```

## 9. Prisma Migrate dan Generate

```bash
cd /var/www/cloudbox/backend
npm run prisma:migrate
npm run prisma:generate
```

## 10. Seed Package Jika Dibutuhkan

```bash
cd /var/www/cloudbox/backend
npm run seed
```

## 11. Install Frontend Dependency

```bash
cd /var/www/cloudbox/frontend
npm install
```

## 12. Build Frontend

```bash
cd /var/www/cloudbox/frontend
npm run build
```

## 13. Build Docker Image User Container

```bash
cd /var/www/cloudbox/docker/cloudbox-static-ssh
docker build -t cloudbox-static-ssh .
```

## 14. Copy Nginx Config

```bash
cd /var/www/cloudbox
sudo cp deploy/nginx-cloudbox.conf /etc/nginx/sites-available/cloudbox
```

## 15. Enable Nginx Site

```bash
sudo ln -s /etc/nginx/sites-available/cloudbox /etc/nginx/sites-enabled/cloudbox
```

Jika default site mengganggu, nonaktifkan:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

## 16. Test Nginx

```bash
sudo nginx -t
```

## 17. Reload Nginx

```bash
sudo systemctl reload nginx
```

## 18. Copy Systemd Service

```bash
cd /var/www/cloudbox
sudo cp deploy/cloudbox-backend.service /etc/systemd/system/cloudbox-backend.service
```

## 19. Enable dan Start Backend Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudbox-backend
sudo systemctl start cloudbox-backend
sudo systemctl status cloudbox-backend
```

Untuk MVP demo, service memakai `User=root` agar backend bisa memanggil Docker CLI. Untuk production serius, buat user khusus dan berikan permission Docker secara terbatas.

## 20. Setup Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 2201/tcp
sudo ufw enable
sudo ufw status
```

## 21. Test Production Draft

```bash
curl http://127.0.0.1:5000/api/health
curl http://localhost/api/health
docker ps
ssh student@cloudbox.online -p 2201
```

Buka di browser:

```txt
http://cloudbox.online/
http://cloudbox.online/api/health
http://cloudbox.online/sites/riansyah/
```

Setelah Certbot pada tahap berikutnya:

```txt
https://cloudbox.online/
https://cloudbox.online/api/health
https://cloudbox.online/sites/riansyah/
```

## Important Scope Note

Certbot, domain DNS final, HTTPS, dan deployment sungguhan dikerjakan pada tahap berikutnya. File ini hanya deployment preparation.
