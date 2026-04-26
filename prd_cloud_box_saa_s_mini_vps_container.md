# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# CloudBox — SaaS Simulasi VPS Mini Berbasis Docker Container untuk SSH dan Deploy Website Statis

**Nama Produk:** CloudBox  
**Jenis Produk:** SaaS Mini Cloud Hosting / Simulasi VPS Mini berbasis Docker Container  
**Versi Dokumen:** 1.0 Final PRD  
**Target Tugas:** MID/UTS dan UAS Cloud Computing  
**Server Target:** Tencent Cloud VPS 2GB RAM, 40GB Storage  
**Domain Target:** `cloudbox.online` atau domain `.online` lain  
**Tim:** Riansyah, Taslim, Nicole  

---

## 1. Ringkasan Eksekutif

CloudBox adalah platform SaaS yang memberikan pengalaman menggunakan VPS mini kepada pengguna melalui Docker container. Pengguna tidak mengakses VPS utama secara langsung, tetapi mendapatkan satu container Linux pribadi yang dapat diakses melalui SSH. Di dalam container tersebut, pengguna dapat belajar command line Linux dan melakukan deploy satu website statis menggunakan file HTML, CSS, dan JavaScript.

CloudBox dirancang sebagai simulasi layanan cloud skala kecil. Sistem berjalan di atas satu VPS utama Tencent Cloud dengan spesifikasi 2GB RAM dan 40GB storage. Resource setiap container dibatasi agar aman dan tidak mengganggu server utama. Untuk kebutuhan pembayaran, CloudBox mengintegrasikan Xendit sebagai third party REST API untuk membuat invoice dan menerima status pembayaran melalui webhook.

Produk ini memenuhi kebutuhan tugas Cloud Computing karena mencakup:

1. Integrasi REST API eksternal melalui Xendit Payment API.
2. Simulasi environment staging dan production menggunakan file `.env` yang berbeda.
3. Deployment aplikasi SaaS ke VPS production.
4. Konfigurasi Nginx reverse proxy.
5. Penggunaan domain `.online`.
6. Penggunaan HTTPS melalui Certbot.
7. Landing page harga layanan SaaS.
8. Fitur cloud berbasis Docker container.
9. Akses SSH container untuk pengalaman seperti VPS mini.
10. Deploy satu website statis oleh user.

---

## 2. Latar Belakang Masalah

Mahasiswa atau pemula sering ingin belajar menggunakan VPS, SSH, command line Linux, dan proses deploy website, tetapi memiliki beberapa kendala:

1. Tidak semua mahasiswa memiliki VPS sendiri.
2. VPS asli dapat berisiko jika salah konfigurasi.
3. Pengguna pemula bisa merusak sistem jika diberi akses root.
4. Biaya VPS asli relatif mahal untuk sekadar belajar dasar.
5. Layanan hosting biasa tidak memberikan pengalaman menggunakan terminal Linux.

CloudBox hadir sebagai solusi berupa lingkungan VPS mini berbasis Docker container. Pengguna tetap dapat merasakan pengalaman login SSH, membuat file, mengelola folder, dan deploy website statis, tetapi seluruh aktivitas dilakukan di container terisolasi, bukan di VPS utama.

---

## 3. Tujuan Produk

Tujuan utama CloudBox adalah menyediakan platform SaaS sederhana yang memungkinkan pengguna:

1. Membeli paket layanan CloudBox melalui Xendit.
2. Mendapatkan satu container Linux pribadi setelah pembayaran berhasil.
3. Mengakses container melalui SSH.
4. Belajar command line Linux dasar.
5. Mengunggah satu website statis ke folder `public_html`.
6. Mengakses website statis melalui URL yang disediakan sistem.
7. Mengontrol container melalui dashboard, seperti start, stop, restart, dan reset.

---

## 4. Batasan Produk

CloudBox bukan layanan VPS production sungguhan. CloudBox adalah simulasi VPS mini berbasis container untuk pembelajaran dan demo cloud computing.

### Yang didukung

1. SSH ke container user.
2. Upload file statis via `scp`.
3. Deploy website HTML, CSS, JavaScript.
4. Satu website statis per user.
5. Resource container terbatas.
6. Akses dashboard web.
7. Integrasi pembayaran Xendit.

### Yang tidak didukung pada MVP

1. Akses root ke VPS utama.
2. Akses Docker command untuk user.
3. Menjalankan Docker di dalam container.
4. Hosting aplikasi backend berat seperti Laravel, Node.js server, Django production, atau database mandiri.
5. Email hosting.
6. Multiple website per user.
7. Auto-scaling.
8. Kubernetes.
9. Panel administrasi kompleks seperti cPanel.

---

## 5. Target Pengguna

| Target User | Kebutuhan |
|---|---|
| Mahasiswa | Belajar SSH, Linux CLI, dan deploy web sederhana |
| Pemula DevOps | Mengenal konsep VPS, terminal, dan Nginx |
| Peserta praktikum | Mendapat environment Linux sementara |
| Dosen/asisten | Memberikan demo cloud container sederhana |
| Developer pemula | Mencoba upload static website melalui SSH/SCP |

---

## 6. Value Proposition

CloudBox memberikan pengalaman seperti VPS mini, tetapi lebih aman dan ringan karena menggunakan container Docker.

**Tagline:**  
> Satu user, satu cloud box untuk belajar SSH dan deploy website statis.

**Nilai utama produk:**

1. Murah dan ringan.
2. Aman karena user hanya masuk ke container.
3. Cocok untuk belajar VPS tanpa risiko merusak server utama.
4. Ada pengalaman SSH nyata.
5. Bisa deploy satu website statis.
6. Cocok untuk demo tugas Cloud Computing.

---

## 7. Target MID/UTS dan UAS

### 7.1 Target MID/UTS

| Kebutuhan Tugas | Implementasi di CloudBox |
|---|---|
| Mengintegrasikan REST API eksternal | Menggunakan Xendit Invoice/Payment Link API |
| Mengakses API publik dari aplikasi lokal | Backend lokal memanggil Xendit API sandbox |
| Simulasi environment staging dan production | `.env` lokal menggunakan Xendit test key, `.env` server menggunakan production/live key atau production config |
| Bukti CLI menggunakan API pihak ketiga | Script CLI `node scripts/check-xendit-invoice.js` untuk membaca status invoice dari Xendit |
| Perbedaan `.env` | `APP_ENV=development` di laptop dan `APP_ENV=production` di server |

### 7.2 Target UAS

| Kebutuhan Tugas | Implementasi di CloudBox |
|---|---|
| Membuat ide SaaS | CloudBox sebagai SaaS simulasi VPS mini berbasis container |
| Deploy aplikasi | Deploy backend dan frontend ke Tencent VPS |
| Konfigurasi Nginx | Nginx reverse proxy ke backend/frontend dan routing website user |
| Beli domain `.online` | Domain diarahkan ke IP VPS Tencent |
| Landing page harga jasa SaaS | Halaman pricing CloudBox dengan paket Demo, Student, dan Pro |
| HTTPS | Certbot SSL untuk domain utama |
| Tahap deployment lengkap | SSH, clone repo, install dependency, setup env, Docker, Nginx, systemd, Certbot |

---

## 8. Scope MVP

MVP CloudBox wajib memiliki fitur berikut:

1. Landing page.
2. Pricing page.
3. Register dan login user.
4. Dashboard user.
5. Pemilihan paket CloudBox.
6. Create invoice menggunakan Xendit.
7. Webhook Xendit untuk update status pembayaran.
8. Provisioning Docker container setelah pembayaran berhasil.
9. Menampilkan credential SSH container.
10. User dapat SSH ke container.
11. User dapat upload website statis ke `public_html`.
12. Website statis dapat diakses melalui URL.
13. Dashboard control: start, stop, restart, reset container.
14. Admin dashboard sederhana untuk melihat user, order, dan container.
15. Perbedaan environment development dan production.

---

## 9. Fitur Utama

### 9.1 Landing Page

Landing page menjelaskan CloudBox sebagai layanan simulasi VPS mini.

Konten wajib:

1. Hero section.
2. Deskripsi produk.
3. Benefit.
4. Cara kerja.
5. Pricing section.
6. CTA: Mulai Sekarang.
7. Demo alur SSH dan deploy web statis.

Contoh copywriting hero:

> Rasakan pengalaman menggunakan VPS mini tanpa membeli VPS sungguhan. Login SSH ke CloudBox kamu, upload website statis, lalu lihat websitemu online.

CTA:

> Coba CloudBox Sekarang

---

### 9.2 Pricing Page

| Paket | Harga | Resource | Masa Aktif | Fitur |
|---|---:|---|---|---|
| Demo Box | Gratis | 100MB RAM, 0.1 CPU | 1 jam | Demo SSH dan static page default |
| Student Box | Rp5.000 | 128MB RAM, 0.2 CPU | 7 hari | SSH container dan 1 static website |
| Pro Box | Rp10.000 | 256MB RAM, 0.25 CPU | 30 hari | SSH container, 1 static website, reset lab |

Untuk implementasi tugas, cukup aktifkan satu paket utama:

**Student Box**  
Harga: Rp5.000  
Resource: 128MB RAM, 0.2 CPU  
Fitur: SSH container dan deploy satu website statis.

---

### 9.3 Authentication

User harus dapat:

1. Register akun.
2. Login akun.
3. Logout.
4. Melihat dashboard pribadi.

Data user minimal:

1. Nama.
2. Email.
3. Password hash.
4. Role: `user` atau `admin`.

---

### 9.4 Payment Integration dengan Xendit

Saat user memilih paket, backend membuat invoice ke Xendit.

Alur:

1. User klik beli paket.
2. Backend membuat record order dengan status `PENDING`.
3. Backend memanggil Xendit API untuk membuat invoice.
4. Xendit mengembalikan `invoice_url`.
5. User diarahkan ke `invoice_url`.
6. Xendit mengirim webhook saat pembayaran berhasil.
7. Backend mengubah status order menjadi `PAID`.
8. Backend membuat container untuk user.
9. Dashboard menampilkan SSH credential dan website URL.

Status order:

1. `PENDING`
2. `PAID`
3. `EXPIRED`
4. `FAILED`
5. `CANCELLED`

---

### 9.5 Dashboard User

Dashboard user menampilkan:

1. Status pembayaran.
2. Paket aktif.
3. Status CloudBox/container.
4. SSH host.
5. SSH port.
6. Username container.
7. Password sementara atau instruksi SSH key.
8. Folder deploy: `/home/student/public_html`.
9. Website URL.
10. Tombol start, stop, restart, reset.
11. Panduan upload website pakai SCP.

Contoh informasi dashboard:

```txt
Nama Box      : cloudbox-riansyah
Status        : Running
Paket         : Student Box
RAM           : 128 MB
CPU           : 0.2 Core
SSH Host      : cloudbox.online
SSH Port      : 2201
Username      : student
Password      : ********
Folder Web    : /home/student/public_html
Website URL   : https://cloudbox.online/sites/riansyah
```

---

### 9.6 SSH Container

User dapat login ke container menggunakan terminal laptop:

```bash
ssh student@cloudbox.online -p 2201
```

Setelah login, user berada di container:

```bash
student@cloudbox-riansyah:~$
```

Command yang boleh dicoba user:

```bash
pwd
ls
cd public_html
mkdir latihan
touch index.html
nano index.html
cat index.html
tree
```

User tidak boleh mendapat akses root ke VPS utama.

---

### 9.7 Deploy Website Statis

User dapat deploy satu website statis.

Folder deploy:

```txt
/home/student/public_html
```

File utama:

```txt
index.html
style.css
script.js
```

Cara upload menggunakan SCP:

```bash
scp -P 2201 -r my-website/* student@cloudbox.online:/home/student/public_html/
```

Setelah upload, website dapat diakses melalui:

```txt
https://cloudbox.online/sites/riansyah
```

Atau jika menggunakan subdomain:

```txt
https://riansyah.cloudbox.online
```

Untuk MVP, gunakan path-based routing agar lebih mudah:

```txt
https://cloudbox.online/sites/:username
```

---

### 9.8 Container Control

Dashboard menyediakan tombol:

1. Start Box.
2. Stop Box.
3. Restart Box.
4. Reset Box.
5. Delete Box untuk admin.

Status container:

1. `CREATING`
2. `RUNNING`
3. `STOPPED`
4. `RESTARTING`
5. `EXPIRED`
6. `ERROR`

---

### 9.9 Admin Dashboard

Admin dapat melihat:

1. Total user.
2. Total order.
3. Order paid/pending.
4. Daftar container.
5. Status container.
6. Port SSH setiap user.
7. Tombol stop/delete container.

---

## 10. User Flow

### 10.1 Flow Pembelian dan Provisioning

```txt
User membuka landing page
↓
User register/login
↓
User memilih Student Box
↓
Backend membuat order PENDING
↓
Backend membuat invoice Xendit
↓
User membayar invoice
↓
Xendit mengirim webhook PAID
↓
Backend update order menjadi PAID
↓
Backend membuat Docker container
↓
Dashboard menampilkan akses SSH dan URL website
```

### 10.2 Flow Deploy Website Statis

```txt
User login ke dashboard
↓
User melihat SSH credential
↓
User SSH ke container
↓
User masuk ke /home/student/public_html
↓
User upload index.html, style.css, script.js
↓
Nginx menyajikan file website
↓
Website tampil di URL CloudBox
```

---

## 11. Arsitektur Sistem

```txt
Internet User
│
├── Browser: Landing Page / Dashboard
├── Terminal: SSH ke container
│
▼
Domain cloudbox.online
│
▼
Nginx VPS Utama
│
├── Reverse proxy ke Backend Node.js
├── Serve Frontend React/Vite build
├── Routing /sites/:username ke container web port
│
▼
Backend Express.js
│
├── Auth
├── Order
├── Xendit Integration
├── Docker Provisioning Engine
├── Container Control
├── Webhook Handler
│
▼
Docker Engine
│
├── cloudbox-user-1 container
│   ├── SSH port 22 mapped ke host port 2201
│   └── Nginx port 80 mapped ke host port 8081
│
└── cloudbox-user-2 container
    ├── SSH port 22 mapped ke host port 2202
    └── Nginx port 80 mapped ke host port 8082
```

---

## 12. Spesifikasi Server

Server utama:

| Komponen | Spesifikasi |
|---|---|
| Provider | Tencent Cloud |
| RAM | 2GB |
| Storage | 40GB |
| OS | Ubuntu Server 22.04 LTS atau 24.04 LTS |
| Web Server | Nginx |
| Runtime | Node.js LTS |
| Container | Docker Engine |
| SSL | Certbot Let's Encrypt |
| Domain | `.online` |

Batas jumlah user untuk demo:

| Mode | Jumlah User Aktif |
|---|---:|
| Demo aman | 1 user |
| Demo maksimal | 2 user |
| Produksi kecil | Tidak disarankan tanpa upgrade server |

---

## 13. Resource Limit Container

Untuk VPS 2GB RAM, gunakan batas aman:

| Paket | Memory | CPU | PIDs | Storage |
|---|---:|---:|---:|---:|
| Demo Box | 100MB | 0.1 | 32 | 250MB |
| Student Box | 128MB | 0.2 | 64 | 500MB |
| Pro Box | 256MB | 0.25 | 96 | 1GB |

MVP direkomendasikan:

```txt
1 user: 128MB atau 256MB RAM
2 user: masing-masing 128MB RAM
```

---

## 14. Tech Stack

### Frontend

1. React.js.
2. Vite.
3. Tailwind CSS.
4. Axios/fetch.

### Backend

1. Node.js LTS.
2. Express.js.
3. JWT Authentication.
4. Prisma ORM atau SQLite native.
5. Docker CLI melalui backend service.

### Database

Untuk MVP:

1. SQLite.

Untuk production lebih serius:

1. PostgreSQL.

### Infrastructure

1. Ubuntu Server.
2. Docker Engine.
3. Nginx.
4. Certbot.
5. Systemd service.
6. Domain `.online`.

### Third Party API

1. Xendit Invoice API / Payment Link API.
2. Xendit Webhook.

---

## 15. Struktur Repository

```txt
cloudbox/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   ├── env.js
│   │   │   └── database.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── packages.routes.js
│   │   │   ├── orders.routes.js
│   │   │   ├── xendit.routes.js
│   │   │   ├── containers.routes.js
│   │   │   └── admin.routes.js
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── xendit.service.js
│   │   │   ├── docker.service.js
│   │   │   ├── port.service.js
│   │   │   └── credential.service.js
│   │   ├── middleware/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── scripts/
│   │   ├── check-xendit-invoice.js
│   │   └── cleanup-expired-containers.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── PricingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── BoxDetailPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── components/
│   │   ├── services/api.js
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
│
├── docker/
│   └── cloudbox-static-ssh/
│       ├── Dockerfile
│       ├── nginx-default.conf
│       └── motd.txt
│
├── deploy/
│   ├── nginx-cloudbox.conf
│   ├── cloudbox-backend.service
│   ├── cloudbox-cleanup.service
│   └── cloudbox-cleanup.timer
│
├── docs/
│   ├── PRD.md
│   ├── DEPLOYMENT.md
│   └── SCREENSHOT-CHECKLIST.md
│
├── .gitignore
└── README.md
```

---

## 16. Database Design

### 16.1 Tabel users

| Field | Type | Keterangan |
|---|---|---|
| id | integer/string | Primary key |
| name | string | Nama user |
| email | string | Email unik |
| password_hash | string | Hash password |
| role | string | `user` atau `admin` |
| created_at | datetime | Tanggal dibuat |

### 16.2 Tabel packages

| Field | Type | Keterangan |
|---|---|---|
| id | integer/string | Primary key |
| name | string | Nama paket |
| price | integer | Harga Rupiah |
| memory_mb | integer | Limit RAM |
| cpu_limit | float | Limit CPU |
| storage_mb | integer | Limit storage |
| duration_days | integer | Masa aktif |
| is_active | boolean | Status paket |

### 16.3 Tabel orders

| Field | Type | Keterangan |
|---|---|---|
| id | integer/string | Primary key |
| user_id | foreign key | Relasi user |
| package_id | foreign key | Relasi paket |
| external_id | string | ID unik untuk Xendit |
| xendit_invoice_id | string | ID invoice Xendit |
| xendit_invoice_url | string | URL pembayaran |
| amount | integer | Nominal pembayaran |
| status | string | PENDING, PAID, EXPIRED, FAILED |
| created_at | datetime | Waktu order |
| paid_at | datetime | Waktu dibayar |

### 16.4 Tabel cloud_boxes

| Field | Type | Keterangan |
|---|---|---|
| id | integer/string | Primary key |
| user_id | foreign key | Pemilik box |
| order_id | foreign key | Order terkait |
| container_name | string | Nama container Docker |
| hostname | string | Hostname dalam container |
| ssh_host | string | Domain/IP VPS utama |
| ssh_port | integer | Port SSH host yang dimapping ke container |
| web_port | integer | Port web host yang dimapping ke container |
| username | string | Username container |
| password_encrypted | string | Password terenkripsi |
| public_url | string | URL website static |
| status | string | CREATING/RUNNING/STOPPED/ERROR/EXPIRED |
| expires_at | datetime | Tanggal expired |
| created_at | datetime | Tanggal dibuat |

### 16.5 Tabel webhook_logs

| Field | Type | Keterangan |
|---|---|---|
| id | integer/string | Primary key |
| provider | string | xendit |
| event_type | string | Jenis event |
| payload | json/text | Payload asli |
| received_at | datetime | Waktu diterima |

---

## 17. API Backend Specification

Base URL development:

```txt
http://localhost:5000/api
```

Base URL production:

```txt
https://cloudbox.online/api
```

### 17.1 Auth

#### Register

```http
POST /api/auth/register
```

Request:

```json
{
  "name": "Riansyah",
  "email": "riansyah@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "message": "Register success",
  "user": {
    "id": 1,
    "name": "Riansyah",
    "email": "riansyah@example.com"
  }
}
```

#### Login

```http
POST /api/auth/login
```

Response:

```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "name": "Riansyah",
    "role": "user"
  }
}
```

---

### 17.2 Packages

```http
GET /api/packages
```

Response:

```json
[
  {
    "id": 1,
    "name": "Student Box",
    "price": 5000,
    "memory_mb": 128,
    "cpu_limit": 0.2,
    "duration_days": 7
  }
]
```

---

### 17.3 Orders

#### Create Order

```http
POST /api/orders
Authorization: Bearer jwt_token
```

Request:

```json
{
  "package_id": 1
}
```

Response:

```json
{
  "order_id": 10,
  "status": "PENDING",
  "invoice_url": "https://checkout.xendit.co/web/..."
}
```

#### Get My Orders

```http
GET /api/orders/me
Authorization: Bearer jwt_token
```

---

### 17.4 Xendit Webhook

```http
POST /api/xendit/webhook
```

Behavior:

1. Validasi callback token.
2. Simpan payload ke `webhook_logs`.
3. Cari order berdasarkan `external_id`.
4. Jika status invoice `PAID`, update order menjadi `PAID`.
5. Jalankan provisioning container.
6. Buat data `cloud_boxes`.

---

### 17.5 Cloud Box Management

#### Get My Box

```http
GET /api/boxes/me
Authorization: Bearer jwt_token
```

Response:

```json
{
  "id": 1,
  "name": "cloudbox-riansyah",
  "status": "RUNNING",
  "ssh_host": "cloudbox.online",
  "ssh_port": 2201,
  "username": "student",
  "web_folder": "/home/student/public_html",
  "public_url": "https://cloudbox.online/sites/riansyah"
}
```

#### Start Box

```http
POST /api/boxes/:id/start
```

#### Stop Box

```http
POST /api/boxes/:id/stop
```

#### Restart Box

```http
POST /api/boxes/:id/restart
```

#### Reset Box

```http
POST /api/boxes/:id/reset
```

---

## 18. Environment Configuration

### 18.1 `.gitignore`

```gitignore
node_modules/
dist/
build/
.env
.env.*
!.env.example
*.sqlite
*.db
logs/
.DS_Store
```

---

### 18.2 Backend `.env.example`

```env
APP_NAME=CloudBox
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
PORT=5000

DATABASE_URL=file:./dev.db
JWT_SECRET=change_this_secret

XENDIT_SECRET_KEY=xnd_development_secret_key
XENDIT_CALLBACK_TOKEN=development_callback_token
XENDIT_SUCCESS_REDIRECT_URL=http://localhost:5173/dashboard?payment=success
XENDIT_FAILURE_REDIRECT_URL=http://localhost:5173/pricing?payment=failed

DOCKER_IMAGE=cloudbox-static-ssh
DOCKER_NETWORK=cloudbox-net
SSH_HOST=localhost
SSH_PORT_START=2201
WEB_PORT_START=8081

DEFAULT_BOX_USERNAME=student
DEFAULT_BOX_PASSWORD=student123
BOX_MEMORY_MB=128
BOX_CPU_LIMIT=0.2
BOX_PIDS_LIMIT=64
BOX_DURATION_DAYS=7
```

---

### 18.3 `.env.development` di Laptop

```env
APP_NAME=CloudBox
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
PORT=5000

DATABASE_URL=file:./dev.db
JWT_SECRET=dev_jwt_secret_cloudbox

XENDIT_SECRET_KEY=xnd_development_test_key
XENDIT_CALLBACK_TOKEN=dev_callback_token
XENDIT_SUCCESS_REDIRECT_URL=http://localhost:5173/dashboard?payment=success
XENDIT_FAILURE_REDIRECT_URL=http://localhost:5173/pricing?payment=failed

DOCKER_IMAGE=cloudbox-static-ssh
DOCKER_NETWORK=cloudbox-net
SSH_HOST=localhost
SSH_PORT_START=2201
WEB_PORT_START=8081

DEFAULT_BOX_USERNAME=student
DEFAULT_BOX_PASSWORD=student123
BOX_MEMORY_MB=128
BOX_CPU_LIMIT=0.2
BOX_PIDS_LIMIT=64
BOX_DURATION_DAYS=7
```

---

### 18.4 `.env.production` di Server Tencent

```env
APP_NAME=CloudBox
APP_ENV=production
APP_DEBUG=false
APP_URL=https://cloudbox.online
FRONTEND_URL=https://cloudbox.online
PORT=5000

DATABASE_URL=file:/var/www/cloudbox/backend/prisma/prod.db
JWT_SECRET=replace_with_long_random_secret

XENDIT_SECRET_KEY=xnd_production_or_test_key_for_demo
XENDIT_CALLBACK_TOKEN=production_callback_token
XENDIT_SUCCESS_REDIRECT_URL=https://cloudbox.online/dashboard?payment=success
XENDIT_FAILURE_REDIRECT_URL=https://cloudbox.online/pricing?payment=failed

DOCKER_IMAGE=cloudbox-static-ssh
DOCKER_NETWORK=cloudbox-net
SSH_HOST=cloudbox.online
SSH_PORT_START=2201
WEB_PORT_START=8081

DEFAULT_BOX_USERNAME=student
DEFAULT_BOX_PASSWORD=generate_random_per_user
BOX_MEMORY_MB=128
BOX_CPU_LIMIT=0.2
BOX_PIDS_LIMIT=64
BOX_DURATION_DAYS=7
```

Catatan keamanan:

1. Jangan commit file `.env` ke GitHub.
2. Untuk demo pembayaran, boleh tetap menggunakan Xendit test key meskipun aplikasi dideploy di server production.
3. Screenshot laporan cukup menampilkan perbedaan key dengan sensor sebagian value.

---

## 19. Docker Image untuk Container User

Folder:

```txt
docker/cloudbox-static-ssh/
```

### 19.1 Dockerfile

```dockerfile
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt install -y \
    openssh-server \
    nginx \
    nano \
    vim \
    curl \
    tree \
    procps \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash student \
    && echo "student:student123" | chpasswd \
    && mkdir -p /home/student/public_html \
    && chown -R student:student /home/student/public_html

RUN mkdir -p /var/run/sshd

RUN rm -rf /var/www/html \
    && ln -s /home/student/public_html /var/www/html

RUN echo '<!DOCTYPE html><html><head><title>CloudBox</title></head><body><h1>CloudBox Static Website</h1><p>Upload your files to public_html.</p></body></html>' > /home/student/public_html/index.html \
    && chown student:student /home/student/public_html/index.html

RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
    && sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

EXPOSE 22 80

CMD service nginx start && /usr/sbin/sshd -D
```

### 19.2 Build Image

```bash
cd /var/www/cloudbox/docker/cloudbox-static-ssh
docker build -t cloudbox-static-ssh .
```

---

## 20. Docker Provisioning Command

Untuk membuat container user demo:

```bash
docker run -dit \
  --name cloudbox-riansyah \
  --hostname cloudbox-riansyah \
  --memory=128m \
  --memory-swap=128m \
  --cpus=0.2 \
  --pids-limit=64 \
  --security-opt no-new-privileges \
  -p 2201:22 \
  -p 8081:80 \
  cloudbox-static-ssh
```

Untuk cek container:

```bash
docker ps
```

Untuk stop:

```bash
docker stop cloudbox-riansyah
```

Untuk start:

```bash
docker start cloudbox-riansyah
```

Untuk restart:

```bash
docker restart cloudbox-riansyah
```

Untuk delete/reset:

```bash
docker rm -f cloudbox-riansyah
```

---

## 21. Backend Docker Service Logic

Backend harus menjalankan command Docker menggunakan service internal, bukan dari input mentah user.

Pseudo-code provisioning:

```js
async function provisionCloudBox(user, order, packageData) {
  const usernameSlug = slugify(user.name || user.email);
  const containerName = `cloudbox-${usernameSlug}-${user.id}`;
  const sshPort = await allocateAvailablePort('ssh');
  const webPort = await allocateAvailablePort('web');

  const command = [
    'docker', 'run', '-dit',
    '--name', containerName,
    '--hostname', containerName,
    '--memory', `${packageData.memory_mb}m`,
    '--memory-swap', `${packageData.memory_mb}m`,
    '--cpus', String(packageData.cpu_limit),
    '--pids-limit', '64',
    '--security-opt', 'no-new-privileges',
    '-p', `${sshPort}:22`,
    '-p', `${webPort}:80`,
    process.env.DOCKER_IMAGE
  ];

  await execFile(command[0], command.slice(1));

  await createCloudBoxRecord({
    user_id: user.id,
    order_id: order.id,
    container_name: containerName,
    ssh_host: process.env.SSH_HOST,
    ssh_port: sshPort,
    web_port: webPort,
    username: 'student',
    status: 'RUNNING',
    public_url: `${process.env.APP_URL}/sites/${usernameSlug}`
  });
}
```

Keamanan penting:

1. Jangan menerima nama container langsung dari user tanpa sanitasi.
2. Gunakan `execFile`, bukan string shell bebas.
3. Batasi command yang bisa dijalankan backend.
4. Jangan expose Docker socket ke user.
5. Jangan jalankan container dengan `--privileged`.

---

## 22. Nginx Configuration

### 22.1 Nginx untuk Aplikasi CloudBox

File:

```txt
/etc/nginx/sites-available/cloudbox
```

Konfigurasi awal HTTP:

```nginx
server {
    listen 80;
    server_name cloudbox.online www.cloudbox.online;

    root /var/www/cloudbox/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /sites/riansyah/ {
        proxy_pass http://127.0.0.1:8081/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

Aktifkan konfigurasi:

```bash
sudo ln -s /etc/nginx/sites-available/cloudbox /etc/nginx/sites-enabled/cloudbox
sudo nginx -t
sudo systemctl reload nginx
```

Catatan:

1. Untuk MVP satu user, routing `/sites/riansyah/` cukup.
2. Untuk banyak user, backend dapat membuat file snippet Nginx per user atau menggunakan pola reverse proxy dinamis.
3. Untuk tugas, satu user demo sudah cukup.

---

## 23. HTTPS dengan Certbot

Install Certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

Dry run:

```bash
sudo certbot certonly --nginx -d cloudbox.online -d www.cloudbox.online --dry-run
```

Generate SSL:

```bash
sudo certbot --nginx -d cloudbox.online -d www.cloudbox.online
```

Cek renewal:

```bash
sudo certbot renew --dry-run
```

---

## 24. Systemd Service Backend

File:

```txt
/etc/systemd/system/cloudbox-backend.service
```

Isi:

```ini
[Unit]
Description=CloudBox Backend Service
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/var/www/cloudbox/backend
EnvironmentFile=/var/www/cloudbox/backend/.env
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=5
User=root
Group=root

[Install]
WantedBy=multi-user.target
```

Catatan:

Untuk MVP, backend dapat dijalankan sebagai root agar bisa memanggil Docker CLI. Untuk produksi serius, lebih baik membuat user khusus dan memberikan permission Docker secara terbatas.

Aktifkan service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudbox-backend
sudo systemctl start cloudbox-backend
sudo systemctl status cloudbox-backend
```

---

## 25. DNS Domain

Arahkan domain `.online` ke IP VPS Tencent.

Record minimal:

| Type | Name | Value |
|---|---|---|
| A | @ | IP_VPS_TENCENT |
| A | www | IP_VPS_TENCENT |

Jika menggunakan subdomain user:

| Type | Name | Value |
|---|---|---|
| A | * | IP_VPS_TENCENT |

Untuk MVP, wildcard tidak wajib karena URL website user bisa menggunakan path:

```txt
https://cloudbox.online/sites/riansyah
```

---

## 26. Deployment Guide Production

### 26.1 Install Package Server

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx git curl ufw unzip -y
```

### 26.2 Install Node.js LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install nodejs -y
node -v
npm -v
```

### 26.3 Install Docker

```bash
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker
docker --version
```

### 26.4 Clone Repository

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/username/cloudbox.git
sudo chown -R $USER:$USER /var/www/cloudbox
```

### 26.5 Setup Backend

```bash
cd /var/www/cloudbox/backend
npm install
cp .env.example .env
nano .env
npx prisma migrate deploy
```

Jika memakai SQLite tanpa Prisma migrate:

```bash
npm run db:init
```

### 26.6 Setup Frontend

```bash
cd /var/www/cloudbox/frontend
npm install
npm run build
```

### 26.7 Build Docker Image Container User

```bash
cd /var/www/cloudbox/docker/cloudbox-static-ssh
docker build -t cloudbox-static-ssh .
```

### 26.8 Setup Nginx

```bash
sudo cp /var/www/cloudbox/deploy/nginx-cloudbox.conf /etc/nginx/sites-available/cloudbox
sudo ln -s /etc/nginx/sites-available/cloudbox /etc/nginx/sites-enabled/cloudbox
sudo nginx -t
sudo systemctl reload nginx
```

### 26.9 Setup Systemd Backend

```bash
sudo cp /var/www/cloudbox/deploy/cloudbox-backend.service /etc/systemd/system/cloudbox-backend.service
sudo systemctl daemon-reload
sudo systemctl enable cloudbox-backend
sudo systemctl start cloudbox-backend
```

### 26.10 Setup HTTPS

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot certonly --nginx -d cloudbox.online -d www.cloudbox.online --dry-run
sudo certbot --nginx -d cloudbox.online -d www.cloudbox.online
```

---

## 27. Firewall Configuration

Aktifkan firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 2201/tcp
sudo ufw enable
sudo ufw status
```

Untuk user kedua:

```bash
sudo ufw allow 2202/tcp
```

Catatan:

1. Port 22 adalah SSH VPS utama untuk admin.
2. Port 2201 adalah SSH container user demo.
3. Jangan membuka terlalu banyak port jika tidak diperlukan.

---

## 28. Security Requirement

### 28.1 Proteksi VPS Utama

1. User tidak boleh mendapat SSH VPS utama.
2. User hanya mendapat SSH ke container.
3. Root login VPS dinonaktifkan jika memungkinkan.
4. Gunakan password kuat atau SSH key untuk admin.
5. Gunakan UFW firewall.
6. Jangan expose database ke publik.

### 28.2 Proteksi Container

1. Jangan gunakan `--privileged`.
2. Gunakan `--memory`.
3. Gunakan `--cpus`.
4. Gunakan `--pids-limit`.
5. Gunakan `--security-opt no-new-privileges`.
6. Disable root login SSH di container.
7. Jangan pasang Docker CLI di container.
8. Jangan mount `/var/run/docker.sock` ke container.
9. Batasi jumlah user aktif.

### 28.3 Proteksi API

1. Semua endpoint user harus menggunakan JWT.
2. Webhook Xendit harus memvalidasi callback token.
3. Input user harus divalidasi.
4. Jangan menjalankan command shell dari input mentah.
5. Simpan secret hanya di `.env`.

---

## 29. CLI untuk Bukti Integrasi API MID/UTS

Buat file:

```txt
backend/scripts/check-xendit-invoice.js
```

Fungsi script:

1. Membaca `XENDIT_SECRET_KEY` dari `.env`.
2. Menerima invoice ID sebagai argumen.
3. Memanggil Xendit API untuk mengambil status invoice.
4. Menampilkan status invoice di terminal server.

Contoh penggunaan:

```bash
node scripts/check-xendit-invoice.js inv_xxx
```

Contoh output:

```txt
Invoice ID     : inv_xxx
External ID    : CLOUDBOX-ORDER-001
Amount         : 5000
Status         : PAID
Invoice URL    : https://checkout.xendit.co/web/...
```

Ini menjadi bukti bahwa aplikasi dapat mengonsumsi REST API eksternal dari CLI di server.

---

## 30. Acceptance Criteria

### 30.1 MID/UTS

| Kriteria | Status jika berhasil |
|---|---|
| Aplikasi lokal dapat memanggil Xendit API | Invoice berhasil dibuat dari local development |
| Ada perbedaan `.env` development dan production | `cat .env` menunjukkan nilai environment berbeda |
| `.env` tidak masuk GitHub | `.env` ada di `.gitignore` |
| CLI dapat mengambil data API pihak ketiga | Script CLI menampilkan status invoice |
| Dashboard menerima status pembayaran | Order berubah dari PENDING ke PAID |

### 30.2 UAS

| Kriteria | Status jika berhasil |
|---|---|
| SaaS memiliki landing page dan pricing | Halaman landing dan pricing bisa diakses |
| Aplikasi dideploy ke VPS Tencent | Domain membuka aplikasi CloudBox |
| Nginx reverse proxy aktif | `/api` diarahkan ke backend |
| Domain `.online` aktif | Domain mengarah ke IP VPS |
| HTTPS aktif | Domain bisa diakses lewat `https://` |
| Docker container dibuat | `docker ps` menampilkan container user |
| User bisa SSH container | `ssh student@domain -p 2201` berhasil |
| User bisa deploy website statis | File `index.html` tampil di URL website |

---

## 31. Screenshot Checklist untuk Laporan

### MID/UTS

1. Screenshot aplikasi membuat invoice Xendit.
2. Screenshot dashboard Xendit invoice test/sandbox.
3. Screenshot callback/webhook diterima backend.
4. Screenshot `.env` development di laptop.
5. Screenshot `.env` production di server.
6. Screenshot `.gitignore` berisi `.env`.
7. Screenshot CLI cek invoice Xendit.

### UAS

1. Screenshot Tencent VPS instance.
2. Screenshot SSH remote ke VPS utama oleh admin.
3. Screenshot clone GitHub repo.
4. Screenshot `npm install` backend/frontend.
5. Screenshot build frontend.
6. Screenshot build Docker image.
7. Screenshot `docker ps` container user.
8. Screenshot Nginx config di `sites-available`.
9. Screenshot domain DNS A record.
10. Screenshot Certbot dry-run.
11. Screenshot HTTPS aktif.
12. Screenshot landing page CloudBox.
13. Screenshot pricing page CloudBox.
14. Screenshot dashboard user.
15. Screenshot SSH user ke container.
16. Screenshot upload file website pakai SCP.
17. Screenshot website statis berhasil tampil.
18. Screenshot start/stop/restart container dari dashboard.

---

## 32. Demo Script Presentasi

1. Buka `https://cloudbox.online`.
2. Tampilkan landing page CloudBox.
3. Tampilkan pricing Student Box.
4. Login sebagai user demo.
5. Klik beli paket.
6. Tampilkan invoice Xendit.
7. Simulasikan pembayaran berhasil.
8. Tampilkan dashboard dengan status PAID.
9. Tampilkan container berhasil dibuat.
10. Buka terminal laptop.
11. Login SSH:

```bash
ssh student@cloudbox.online -p 2201
```

12. Masuk ke folder web:

```bash
cd public_html
```

13. Buat file `index.html`:

```bash
echo '<h1>Hello from CloudBox</h1>' > index.html
```

14. Buka browser:

```txt
https://cloudbox.online/sites/riansyah
```

15. Website berhasil tampil.
16. Tunjukkan dashboard control container.
17. Tunjukkan Nginx, Docker, Certbot, dan `.env` production di server.

---

## 33. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| RAM VPS penuh | Aplikasi down | Batasi 1–2 container, gunakan memory limit |
| User menjalankan proses berat | Container lambat | CPU limit, PIDs limit, tanpa sudo |
| User mencoba akses root | Risiko keamanan | Disable root login dan tidak beri password root |
| Port bentrok | SSH gagal | Port allocator di backend |
| Webhook Xendit tidak masuk | Order tetap pending | Sediakan tombol refresh status invoice |
| Domain belum propagasi | HTTPS gagal | Tunggu DNS aktif dan test dengan `dig`/`ping` |
| Certbot gagal | HTTPS belum aktif | Pastikan port 80 terbuka dan Nginx aktif |
| Container hilang saat reset | Data user terhapus | Tampilkan warning sebelum reset |

---

## 34. Rekomendasi MVP Paling Aman

Untuk tugas dan demo, gunakan konfigurasi berikut:

1. Satu user demo.
2. Satu container aktif.
3. RAM container 128MB atau 256MB.
4. Port SSH container: 2201.
5. Port web container: 8081.
6. URL website: `/sites/riansyah`.
7. Database SQLite.
8. Xendit test mode.
9. Domain `.online` dengan HTTPS.
10. Backend Node.js Express.
11. Frontend React Vite.

---

## 35. Definisi Sukses Produk

CloudBox dianggap berhasil jika:

1. Aplikasi bisa diakses melalui domain `.online`.
2. Landing page dan pricing page tampil.
3. User bisa register/login.
4. User bisa membuat invoice Xendit.
5. Order berubah menjadi paid setelah webhook/simulasi pembayaran.
6. Sistem membuat container Docker.
7. User mendapat akses SSH ke container.
8. User dapat upload file `index.html` ke `public_html`.
9. Website statis user tampil melalui URL.
10. Terdapat bukti perbedaan environment development dan production.
11. Nginx, Certbot, domain, Docker, dan deployment dapat didokumentasikan.

---

## 36. Ringkasan Final untuk Laporan

CloudBox adalah platform SaaS simulasi VPS mini berbasis Docker container. Sistem memberikan pengalaman menggunakan VPS kepada user melalui akses SSH ke container pribadi. Setelah melakukan pembayaran melalui Xendit, user mendapatkan CloudBox aktif yang berisi lingkungan Linux terbatas. User dapat belajar command line dan melakukan deploy satu website statis ke folder `public_html`. Website tersebut kemudian dapat diakses melalui URL yang disediakan sistem.

CloudBox berjalan di atas VPS Tencent 2GB RAM dan menggunakan Nginx sebagai reverse proxy, Docker sebagai engine container, Xendit sebagai REST API pembayaran, domain `.online`, serta HTTPS melalui Certbot. Produk ini dirancang khusus untuk memenuhi kebutuhan MID/UTS dan UAS mata kuliah Cloud Computing.

---

## 37. Lampiran Command Cepat Demo

### SSH ke VPS utama sebagai admin

```bash
ssh root@IP_VPS_TENCENT
```

### Cek aplikasi backend

```bash
sudo systemctl status cloudbox-backend
```

### Cek Nginx

```bash
sudo nginx -t
sudo systemctl status nginx
```

### Cek Docker

```bash
docker ps
```

### SSH ke container user

```bash
ssh student@cloudbox.online -p 2201
```

### Upload website static

```bash
scp -P 2201 -r my-website/* student@cloudbox.online:/home/student/public_html/
```

### Buka website user

```txt
https://cloudbox.online/sites/riansyah
```

---

# Akhir PRD CloudBox

