# CloudBox UAS Tahap 4B - VPS Deployment Runbook HTTP/IP

Runbook ini dipakai untuk deploy CloudBox ke Tencent VPS lewat HTTP biasa atau IP server terlebih dahulu. Jangan jalankan Certbot dan jangan setup HTTPS pada tahap ini. Domain boleh masih belum resolve; semua pengujian bisa memakai IP publik VPS.

## Scope Tahap 4B

- Deploy backend Express ke VPS.
- Deploy frontend build React/Vite ke Nginx.
- Build Docker image `cloudbox-static-ssh` di VPS.
- Jalankan backend sebagai systemd service.
- Akses CloudBox lewat HTTP/IP.
- Uji provisioning Docker melalui endpoint development `mark-paid`.
- Uji SSH container dan upload static website.

Belum dikerjakan pada tahap ini:

- Certbot.
- HTTPS.
- Redirect HTTP ke HTTPS.
- Validasi DNS final.
- Deployment memakai secret live production.

## 1. Preflight Lokal Sebelum Push GitHub

Jalankan dari laptop lokal:

```bash
cd "/Users/gustikrisnapranata/ILMU KOMPUTER/SEMESTER 6/Cloud Computing/cloudbox"
git status --short
sed -n '1,120p' .gitignore
git ls-files | grep -E '(^|/)\.env($|\.)|\.db$|\.sqlite$|node_modules|(^|/)dist($|/)' || true
```

Yang boleh muncul dari pengecekan `git ls-files` hanya:

```txt
backend/.env.example
frontend/.env.example
```

Pastikan file berikut tidak ikut commit:

- `.env`
- `.env.*` selain `.env.example`
- `*.db`
- `*.sqlite`
- `node_modules`
- `dist`
- secret asli Xendit/JWT/callback token

## 2. Push ke GitHub

Jika repo lokal belum pernah dibuat:

```bash
git init
git add .
git commit -m "Implement CloudBox MID and UAS deployment prep"
git branch -M main
git remote add origin https://github.com/gstkrsnaprnta/cloudbox.git
git push -u origin main
```

Jika repo sudah ada dan remote sudah terpasang:

```bash
git status --short
git add docs/UAS-VPS-DEPLOYMENT-RUNBOOK.md README.md
git commit -m "Add VPS deployment runbook"
git push
```

## 3. SSH ke Tencent VPS

Ganti `IP_VPS_TENCENT` dengan IP publik server.

```bash
ssh root@IP_VPS_TENCENT
```

## 4. Update Server

```bash
sudo apt update && sudo apt upgrade -y
```

## 5. Install Dependency Server

```bash
sudo apt install -y nginx git curl ufw unzip ca-certificates gnupg lsb-release
```

## 6. Install Node.js LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 7. Install Docker

Untuk demo UAS, Docker dari repository Ubuntu cukup.

```bash
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
docker --version
sudo docker ps
```

## 8. Clone Repo ke `/var/www/cloudbox`

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/gstkrsnaprnta/cloudbox.git
sudo chown -R $USER:$USER /var/www/cloudbox
cd /var/www/cloudbox
git status --short
```

Jika folder sudah ada dari percobaan sebelumnya:

```bash
cd /var/www/cloudbox
git pull
```

## 9. Setup Backend `.env` Production Demo

```bash
cd /var/www/cloudbox/backend
cp .env.example .env
nano .env
```

Contoh isi untuk demo HTTP/IP. Ganti `IP_VPS_TENCENT` dan isi secret dengan nilai test/sandbox yang valid. Jangan commit file `.env`.

```env
APP_NAME=CloudBox
APP_ENV=production
APP_DEBUG=false
APP_URL=http://IP_VPS_TENCENT
FRONTEND_URL=http://IP_VPS_TENCENT
PORT=5000
DATABASE_URL=file:/var/www/cloudbox/backend/prisma/prod.db
JWT_SECRET=ISI_SECRET_PANJANG_SENDIRI
XENDIT_SECRET_KEY=ISI_XENDIT_TEST_SECRET_KEY
XENDIT_CALLBACK_TOKEN=ISI_XENDIT_CALLBACK_TOKEN
XENDIT_SUCCESS_REDIRECT_URL=http://IP_VPS_TENCENT/dashboard?payment=success
XENDIT_FAILURE_REDIRECT_URL=http://IP_VPS_TENCENT/pricing?payment=failed
DOCKER_IMAGE=cloudbox-static-ssh
SSH_HOST=IP_VPS_TENCENT
SSH_PORT_START=2201
WEB_PORT_START=8081
DEFAULT_BOX_USERNAME=student
DEFAULT_BOX_PASSWORD=student123
BOX_MEMORY_MB=128
BOX_CPU_LIMIT=0.2
BOX_PIDS_LIMIT=64
BOX_DURATION_DAYS=7
```

Catatan penting: untuk demo production UAS, Xendit boleh tetap memakai test key/sandbox supaya tidak memakai uang asli.

## 10. Install Backend Dependency

```bash
cd /var/www/cloudbox/backend
npm install
```

## 11. Prisma Migrate, Generate, dan Seed

```bash
cd /var/www/cloudbox/backend
npm run prisma:migrate
npm run prisma:generate
npm run seed
```

Pastikan package `Student Box` tersedia setelah seed.

## 12. Install dan Build Frontend

```bash
cd /var/www/cloudbox/frontend
npm install
npm run build
```

Build output berada di:

```txt
/var/www/cloudbox/frontend/dist
```

## 13. Build Docker Image User Container

```bash
cd /var/www/cloudbox/docker/cloudbox-static-ssh
sudo docker build -t cloudbox-static-ssh .
sudo docker images | grep cloudbox-static-ssh
```

## 14. Setup Nginx HTTP

Copy konfigurasi Nginx CloudBox:

```bash
cd /var/www/cloudbox
sudo cp deploy/nginx-cloudbox.conf /etc/nginx/sites-available/cloudbox
sudo ln -sf /etc/nginx/sites-available/cloudbox /etc/nginx/sites-enabled/cloudbox
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Konfigurasi `deploy/nginx-cloudbox.conf` masih memakai placeholder domain:

```txt
cloudbox.online
www.cloudbox.online
```

Nginx tetap bisa diuji via IP jika request memakai server default yang aktif. Jika browser via IP belum masuk ke site CloudBox, sementara ganti baris `server_name` di `/etc/nginx/sites-available/cloudbox` menjadi:

```nginx
server_name cloudbox.online www.cloudbox.online IP_VPS_TENCENT _;
```

Lalu jalankan:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 15. Setup Systemd Backend

```bash
cd /var/www/cloudbox
sudo cp deploy/cloudbox-backend.service /etc/systemd/system/cloudbox-backend.service
sudo systemctl daemon-reload
sudo systemctl enable cloudbox-backend
sudo systemctl start cloudbox-backend
sudo systemctl status cloudbox-backend --no-pager
```

Untuk MVP demo, service memakai `User=root` agar backend bisa memanggil Docker CLI. Untuk production serius, gunakan user khusus dengan permission Docker terbatas.

## 16. Setup Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 2201/tcp
sudo ufw enable
sudo ufw status
```

Port yang dipakai tahap ini:

- `22/tcp` untuk SSH VPS.
- `80/tcp` untuk HTTP/Nginx.
- `2201/tcp` untuk SSH container demo.
- `8081/tcp` hanya perlu lokal di server karena website container diproxy lewat Nginx. Untuk demo langsung via IP:8081, buka firewall `8081/tcp` sementara jika dibutuhkan.

## 17. Test Backend Health

Dari VPS:

```bash
curl http://127.0.0.1:5000/api/health
curl http://localhost/api/health
```

Dari laptop:

```bash
curl http://IP_VPS_TENCENT/api/health
```

Expected response berisi status CloudBox API sehat.

## 18. Test Frontend dari Browser

Buka:

```txt
http://IP_VPS_TENCENT/
```

Pastikan landing page CloudBox tampil, navbar terlihat, dan halaman pricing/login/register bisa dibuka.

## 19. Test Register dan Login

Dari browser:

1. Buka `http://IP_VPS_TENCENT/register`.
2. Register user demo.
3. Login.
4. Buka dashboard.

Atau gunakan curl dari VPS/laptop:

```bash
curl -X POST http://IP_VPS_TENCENT/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo UAS","email":"demo-uas@example.com","password":"password123"}'

curl -X POST http://IP_VPS_TENCENT/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo-uas@example.com","password":"password123"}'
```

Simpan JWT dari response login untuk test API berikutnya.

## 20. Test Packages dan Create Order

```bash
curl http://IP_VPS_TENCENT/api/packages
```

Ganti `JWT_TOKEN_HERE` dan `PACKAGE_ID_HERE`.

```bash
curl -X POST http://IP_VPS_TENCENT/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKEN_HERE" \
  -d '{"packageId": PACKAGE_ID_HERE}'
```

Jika Xendit key masih placeholder, invoice asli akan gagal. Untuk demo UAS, isi Xendit test key valid terlebih dahulu, atau gunakan flow `mark-paid` hanya ketika backend berjalan dengan environment non-production.

## 21. Catatan Testing `mark-paid`

Endpoint berikut hanya aktif jika `APP_ENV !== production`:

```txt
POST /api/orders/:id/mark-paid
```

Untuk demo VPS yang tetap ingin memakai `mark-paid`, ubah sementara:

```env
APP_ENV=staging
APP_DEBUG=true
```

Lalu restart backend:

```bash
sudo systemctl restart cloudbox-backend
```

Setelah demo selesai, kembalikan ke:

```env
APP_ENV=production
APP_DEBUG=false
```

Test mark-paid:

```bash
curl -X POST http://IP_VPS_TENCENT/api/orders/ORDER_ID_HERE/mark-paid \
  -H "Authorization: Bearer JWT_TOKEN_HERE"
```

Expected:

- Order berubah menjadi `PAID`.
- Backend membuat atau reuse container `cloudbox-user-<userId>`.
- CloudBox detail muncul di dashboard.

## 22. Test Docker Provisioning

Dari VPS:

```bash
sudo docker ps
sudo docker inspect cloudbox-user-1 --format '{{json .NetworkSettings.Ports}}'
```

Expected mapping:

```txt
0.0.0.0:2201->22/tcp
0.0.0.0:8081->80/tcp
```

Jika user ID bukan `1`, nama container mengikuti format:

```txt
cloudbox-user-<userId>
```

## 23. Test SSH Container

Dari laptop:

```bash
ssh student@IP_VPS_TENCENT -p 2201
```

Password demo:

```txt
student123
```

Di dalam container:

```bash
whoami
pwd
ls -la /home/student/public_html
exit
```

## 24. Test Upload Static Website

Buat website kecil di laptop:

```bash
mkdir -p /tmp/cloudbox-demo-site
cat > /tmp/cloudbox-demo-site/index.html <<'HTML'
<h1>CloudBox UAS Deployment OK</h1>
<p>Static website uploaded with SCP.</p>
HTML
```

Upload via SCP:

```bash
scp -P 2201 -r /tmp/cloudbox-demo-site/* student@IP_VPS_TENCENT:/home/student/public_html/
```

## 25. Test Website Static

Jika port `8081` dibuka sementara:

```txt
http://IP_VPS_TENCENT:8081
```

Lewat Nginx path routing:

```txt
http://IP_VPS_TENCENT/sites/riansyah/
```

Expected: HTML yang baru diupload tampil.

## 26. Test Control Box dari Dashboard

Dari dashboard CloudBox:

1. Buka detail CloudBox.
2. Klik `Stop Box`.
3. Cek `sudo docker ps -a`.
4. Klik `Start Box`.
5. Klik `Restart Box`.
6. Klik `Reset Box`.
7. Pastikan tidak ada container dobel.

Dari VPS untuk validasi:

```bash
sudo docker ps -a | grep cloudbox-user
```

## Troubleshooting

### Port 5000 Sudah Dipakai

Cek process:

```bash
sudo lsof -i :5000
sudo ss -ltnp | grep 5000
```

Jika process lama CloudBox masih jalan:

```bash
sudo systemctl restart cloudbox-backend
```

Jika process manual Node yang memakai port:

```bash
sudo kill -9 PID
```

### Nginx 502 Bad Gateway

Biasanya backend tidak jalan atau port salah.

```bash
sudo systemctl status cloudbox-backend --no-pager
sudo journalctl -u cloudbox-backend -n 100 --no-pager
curl http://127.0.0.1:5000/api/health
sudo nginx -t
```

### Docker Permission Error

Systemd MVP memakai `User=root`, jadi Docker CLI seharusnya bisa dipanggil. Jika error masih muncul:

```bash
sudo systemctl status docker --no-pager
sudo docker ps
sudo journalctl -u cloudbox-backend -n 100 --no-pager
```

Pastikan service file yang aktif adalah:

```txt
/etc/systemd/system/cloudbox-backend.service
```

Lalu reload:

```bash
sudo systemctl daemon-reload
sudo systemctl restart cloudbox-backend
```

### Prisma Database Error

Cek `.env`:

```bash
cd /var/www/cloudbox/backend
grep DATABASE_URL .env
npm run prisma:generate
npm run prisma:migrate
```

Pastikan folder Prisma bisa ditulis:

```bash
sudo chown -R root:root /var/www/cloudbox/backend/prisma
```

Jika menjalankan command sebagai user non-root, sesuaikan owner ke user tersebut.

### Frontend Blank Page

Cek build dan Nginx:

```bash
cd /var/www/cloudbox/frontend
npm run build
ls -la dist
sudo nginx -t
sudo systemctl reload nginx
```

Cek browser console. Pastikan `VITE_API_BASE_URL` di frontend production tidak menunjuk ke localhost laptop. Untuk deploy via Nginx yang sama, API default `/api` sudah cukup.

### Port 2201 atau 8081 Bentrok

Cek process/container:

```bash
sudo ss -ltnp | grep -E ':2201|:8081'
sudo docker ps -a
```

Cleanup container demo lama jika memang aman:

```bash
sudo docker rm -f cloudbox-demo cloudbox-demo-test cloudbox-demo-test2 cloudbox-user-1
```

Jika container user lain masih diperlukan, jangan hapus sebelum data user dibackup.

### Backend Service Gagal Start

Cek log:

```bash
sudo systemctl status cloudbox-backend --no-pager
sudo journalctl -u cloudbox-backend -n 150 --no-pager
```

Cek Node path:

```bash
which node
node -v
```

Jika Node bukan di `/usr/bin/node`, update `ExecStart` di service file sesuai hasil `which node`.

### Xendit Key Masih Placeholder

Invoice asli tidak akan dibuat jika masih memakai:

```txt
xnd_development_test_key
development_callback_token
********
```

Isi `.env` server dengan Xendit test/sandbox key valid. Untuk demo UAS, tetap gunakan sandbox agar tidak memakai uang asli.

### Domain Belum Resolve

Tahap 4B tidak bergantung domain. Gunakan IP:

```txt
http://IP_VPS_TENCENT/
http://IP_VPS_TENCENT/api/health
http://IP_VPS_TENCENT/sites/riansyah/
```

Certbot hanya dijalankan setelah DNS A record domain benar-benar resolve ke IP VPS.

## Screenshot Checklist Tahap 4B

- [ ] SSH ke VPS Tencent berhasil.
- [ ] `git clone` repo ke `/var/www/cloudbox`.
- [ ] `npm install` backend berhasil.
- [ ] Prisma migrate/generate berhasil.
- [ ] `npm run build` frontend berhasil.
- [ ] `docker build -t cloudbox-static-ssh .` berhasil.
- [ ] `systemctl status cloudbox-backend` aktif/running.
- [ ] `nginx -t` sukses.
- [ ] Browser membuka CloudBox via IP/domain HTTP.
- [ ] Register/login user berhasil.
- [ ] Dashboard order tampil.
- [ ] `mark-paid` atau webhook membuat order `PAID`.
- [ ] `docker ps` menampilkan container user.
- [ ] SSH ke container user sebagai `student`.
- [ ] SCP upload website ke `/home/student/public_html`.
- [ ] Website static tampil via `http://IP_VPS_TENCENT/sites/riansyah/`.

## PASS Criteria Tahap 4B

- Repo GitHub aman tanpa secret/database/dependency/build lokal.
- VPS bisa menjalankan backend systemd.
- Nginx menyajikan frontend dan proxy `/api`.
- Docker image user container berhasil dibuild di VPS.
- Provisioning container bekerja dari CloudBox.
- SSH container dan SCP upload berhasil.
- Website static user tampil lewat HTTP/IP.
