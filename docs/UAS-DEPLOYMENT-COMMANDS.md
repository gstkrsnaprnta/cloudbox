# KloudBox UAS Deployment Commands

Dokumen ini berisi command berurutan untuk push ke GitHub dan deployment production draft ke Tencent VPS. Jalankan command VPS hanya saat sudah masuk tahap deployment sungguhan.

## 1. Git Init Jika Belum Repository

Cek status git:

```bash
git status
```

Jika belum repository:

```bash
git init
```

## 2. Review File yang Akan Dipush

```bash
git status --short
```

Pastikan tidak ada:

- `.env`
- `.env.*` selain `.env.example`
- `node_modules`
- `dist`
- `*.db`
- `*.sqlite`

## 3. Add dan Commit

```bash
git add .
git commit -m "Implement KloudBox MID and UAS deployment prep"
```

## 4. Tambahkan Remote GitHub

Ganti URL repo sesuai repository GitHub yang dibuat.

```bash
git remote add origin https://github.com/USERNAME/cloudbox.git
git remote -v
```

Jika remote sudah ada:

```bash
git remote set-url origin https://github.com/USERNAME/cloudbox.git
```

## 5. Push ke GitHub

```bash
git branch -M main
git push -u origin main
```

## 6. SSH ke VPS

```bash
ssh ubuntu@43.133.144.235
```

## 7. Install Dependencies Server

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx git curl ufw unzip -y
```

## 8. Install Node.js LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install nodejs -y
node -v
npm -v
```

## 9. Install Docker

```bash
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker
docker --version
```

## 10. Clone Repo ke `/var/www/cloudbox`

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/USERNAME/cloudbox.git
sudo chown -R $USER:$USER /var/www/cloudbox
```

## 11. Setup `.env` Production

```bash
cd /var/www/cloudbox/backend
cp .env.example .env
nano .env
```

Gunakan contoh:

```txt
/var/www/cloudbox/deploy/env-production-example.md
```

Untuk production demo, Xendit boleh tetap memakai test key/sandbox agar tidak menggunakan uang asli.

## 12. Install Backend

```bash
cd /var/www/cloudbox/backend
npm install
```

## 13. Prisma Migrate dan Generate

```bash
cd /var/www/cloudbox/backend
npm run prisma:migrate
npm run prisma:generate
npm run seed
```

## 14. Install Frontend

```bash
cd /var/www/cloudbox/frontend
npm install
```

## 15. Build Frontend

```bash
cd /var/www/cloudbox/frontend
npm run build
```

Hasil build berada di:

```txt
/var/www/cloudbox/frontend/dist
```

## 16. Build Docker Image

```bash
cd /var/www/cloudbox/docker/cloudbox-static-ssh
docker build -t cloudbox-static-ssh .
```

## 17. Setup Nginx

```bash
cd /var/www/cloudbox
sudo cp deploy/nginx-cloudbox.conf /etc/nginx/sites-available/cloudbox
sudo ln -s /etc/nginx/sites-available/cloudbox /etc/nginx/sites-enabled/cloudbox
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 18. Setup Systemd Backend

```bash
cd /var/www/cloudbox
sudo cp deploy/cloudbox-backend.service /etc/systemd/system/cloudbox-backend.service
sudo systemctl daemon-reload
sudo systemctl enable cloudbox-backend
sudo systemctl start cloudbox-backend
sudo systemctl status cloudbox-backend
```

## 19. Setup Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 2201/tcp
sudo ufw enable
sudo ufw status
```

## 20. Test Backend

```bash
curl http://127.0.0.1:5000/api/health
curl http://localhost/api/health
curl http://kloudbox.my.id/api/health
```

## 21. Test Frontend

Buka:

```txt
http://kloudbox.my.id/
http://kloudbox.my.id/pricing
http://kloudbox.my.id/login
```

## 22. Test Docker Provisioning

Di browser:

1. Register/login user.
2. Buat order Student Box.
3. Gunakan Xendit test/sandbox flow atau endpoint development jika masih demo lokal.
4. Pastikan box dibuat.

Cek server:

```bash
docker ps
```

Expected:

```txt
cloudbox-user-1
0.0.0.0:2201->22/tcp
0.0.0.0:8081->80/tcp
```

## 23. Test SSH Container

```bash
ssh student@kloudbox.my.id -p 2201
```

Password demo:

```txt
student123
```

## 24. Test Upload Static Website

```bash
scp -P 2201 -r my-website/* student@kloudbox.my.id:/home/student/public_html/
```

## 25. Test Website Static

Buka:

```txt
http://kloudbox.my.id/sites/riansyah/
```

Setelah HTTPS tahap berikutnya:

```txt
https://kloudbox.my.id/sites/riansyah/
```

## 26. Setup Certbot Setelah DNS Aktif

Jalankan hanya setelah DNS `kloudbox.my.id` dan `www.kloudbox.my.id` resolve ke IP VPS.

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot certonly --nginx -d kloudbox.my.id -d www.kloudbox.my.id --dry-run
sudo certbot --nginx -d kloudbox.my.id -d www.kloudbox.my.id
sudo certbot renew --dry-run
```

## 27. Final HTTPS Test

```bash
curl https://kloudbox.my.id/api/health
```

Buka:

```txt
https://kloudbox.my.id/
https://kloudbox.my.id/sites/riansyah/
```
