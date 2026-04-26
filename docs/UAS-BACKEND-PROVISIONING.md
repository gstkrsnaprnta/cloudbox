# KloudBox UAS Backend Provisioning

Panduan ini untuk UAS tahap 2: integrasi Docker container ke backend dan dashboard KloudBox. Jangan lanjut ke Nginx production, domain, Certbot, systemd, atau deployment VPS pada tahap ini.

## 1. Pastikan Docker Berjalan

```bash
docker info
docker --version
```

Jika Docker belum berjalan, buka Docker Desktop atau start Docker daemon di server.

## 2. Cleanup Sebelum Testing

Jika port `2201` atau `8081` bentrok karena container lama, hapus container demo lama:

```bash
docker rm -f cloudbox-demo cloudbox-demo-test2 cloudbox-user-1
```

Command ini menghapus container lokal tersebut. Pastikan tidak ada data penting di dalamnya.

## 3. Build Image `cloudbox-static-ssh`

```bash
cd docker/cloudbox-static-ssh
docker build -t cloudbox-static-ssh .
```

Backend provisioning membutuhkan image ini. Jika image belum ada, endpoint provisioning akan menampilkan pesan agar image dibuild dulu.

## 4. Jalankan Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run seed
npm start
```

Pastikan `.env` development berisi:

```env
APP_ENV=development
DOCKER_IMAGE=cloudbox-static-ssh
SSH_HOST=localhost
SSH_PORT_START=2201
WEB_PORT_START=8081
DEFAULT_BOX_USERNAME=student
DEFAULT_BOX_PASSWORD=student123
BOX_DURATION_DAYS=7
```

Backend berjalan di:

```txt
http://localhost:5000
```

## 5. Jalankan Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend berjalan di:

```txt
http://127.0.0.1:5173
```

## 6. Buat Order

Login dari frontend, buka pricing, lalu klik `Beli Paket`.

Jika Xendit test key belum valid, order akan tercatat sebagai `FAILED`, tetapi tetap bisa digunakan untuk demo development melalui endpoint `mark-paid`.

Pada `APP_ENV=development`, backend tetap mengembalikan order tersebut agar dashboard bisa dipakai untuk demo. Pada production, error Xendit tetap dianggap gagal.

## 7. Mark Order Paid di Development

Endpoint development-only:

```txt
POST /api/orders/:id/mark-paid
```

Endpoint ini hanya aktif saat:

```env
APP_ENV=development
```

Contoh curl:

```bash
TOKEN="JWT_TOKEN_DARI_LOGIN"
ORDER_ID="1"

curl -X POST "http://localhost:5000/api/orders/$ORDER_ID/mark-paid" \
  -H "Authorization: Bearer $TOKEN"
```

Hasil yang diharapkan:

- Order berubah menjadi `PAID`.
- Backend menjalankan `docker run`.
- Container `cloudbox-user-<userId>` dibuat.
- Data container tersimpan di tabel `cloud_boxes`.
- Dashboard menampilkan SSH command, SCP command, dan website URL.

## 8. Cek Container

```bash
docker ps
```

Expected:

```txt
cloudbox-user-1
0.0.0.0:2201->22/tcp
0.0.0.0:8081->80/tcp
```

Cek resource limit:

```bash
docker inspect cloudbox-user-1 --format 'Memory={{.HostConfig.Memory}} MemorySwap={{.HostConfig.MemorySwap}} NanoCPUs={{.HostConfig.NanoCpus}} PidsLimit={{.HostConfig.PidsLimit}} SecurityOpt={{.HostConfig.SecurityOpt}}'
```

Expected:

```txt
Memory=134217728 MemorySwap=134217728 NanoCPUs=200000000 PidsLimit=64 SecurityOpt=[no-new-privileges]
```

## 9. SSH ke Container

```bash
ssh student@localhost -p 2201
```

Password demo:

```txt
student123
```

Setelah login:

```bash
whoami
hostname
ls -la /home/student/public_html
```

Expected:

```txt
student
cloudbox-user-1
```

## 10. Upload Static Website

```bash
scp -P 2201 -r my-website/* student@localhost:/home/student/public_html/
```

Contoh cepat:

```bash
mkdir -p /tmp/cloudbox-demo-site
cat > /tmp/cloudbox-demo-site/index.html <<'EOF'
<!doctype html>
<html>
  <body>
    <h1>Hello from KloudBox Dashboard Provisioning</h1>
    <p>Uploaded with SCP after backend provisioning.</p>
  </body>
</html>
EOF
scp -P 2201 -r /tmp/cloudbox-demo-site/* student@localhost:/home/student/public_html/
```

## 11. Buka Website

```txt
http://localhost:8081
```

Atau:

```bash
curl http://localhost:8081
```

## 12. Dashboard Control

Di dashboard, gunakan tombol:

- Start Box
- Stop Box
- Restart Box
- Reset Box

Setiap tombol memanggil endpoint:

- `POST /api/boxes/:id/start`
- `POST /api/boxes/:id/stop`
- `POST /api/boxes/:id/restart`
- `POST /api/boxes/:id/reset`

Semua endpoint membutuhkan JWT auth.

## 13. Error Handling yang Perlu Dibuktikan

- Docker belum berjalan: backend menampilkan pesan agar Docker daemon dijalankan.
- Image belum ada: backend menampilkan pesan agar build `cloudbox-static-ssh`.
- Port `2201` atau `8081` dipakai: backend menampilkan pesan port bentrok.
- Webhook/mark-paid dipanggil ulang: container tidak dibuat dobel.

## 14. Troubleshooting Database Development

Jika container lama sudah dihapus tetapi tabel `cloud_boxes` masih menyimpan port `2201` atau `8081`, backup database terlebih dahulu:

```bash
cp backend/prisma/dev.db /tmp/cloudbox-dev-backup.db
```

Lalu hapus record stale hanya di database development:

```bash
cd backend
DATABASE_URL=file:./dev.db node --input-type=module -e '
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
await prisma.cloudBox.deleteMany({ where: { containerName: { startsWith: "cloudbox-user-" } } });
await prisma.$disconnect();
'
```

Jangan menjalankan cleanup database seperti ini pada production tanpa backup dan verifikasi manual.

## Screenshot yang Perlu Diambil

- [ ] Docker Desktop/daemon berjalan.
- [ ] Build image `cloudbox-static-ssh` berhasil.
- [ ] Backend berjalan.
- [ ] Frontend dashboard berjalan.
- [ ] User login.
- [ ] Order dibuat.
- [ ] `POST /api/orders/:id/mark-paid` berhasil.
- [ ] `docker ps` menampilkan `cloudbox-user-1`.
- [ ] Dashboard menampilkan container name.
- [ ] Dashboard menampilkan SSH command.
- [ ] Dashboard menampilkan SCP command.
- [ ] Dashboard menampilkan username `student`.
- [ ] Dashboard menampilkan password demo `student123`.
- [ ] SSH ke container sebagai `student`.
- [ ] Upload website statis via SCP.
- [ ] Website tampil di `http://localhost:8081`.
- [ ] Tombol start/stop/restart/reset berjalan.
