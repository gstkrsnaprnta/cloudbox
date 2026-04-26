# CloudBox UAS Docker Testing

Panduan ini hanya untuk UAS tahap 1: Docker image lokal/server untuk user container CloudBox. Jangan lanjut ke Nginx production, domain, Certbot, systemd, atau deployment production pada tahap ini.

## 1. Build Image

```bash
cd docker/cloudbox-static-ssh
docker build -t cloudbox-static-ssh .
```

Acceptance: build selesai tanpa error dan image `cloudbox-static-ssh` tersedia.

## 2. Run Container Demo

```bash
docker run -dit \
  --name cloudbox-demo \
  --hostname cloudbox-demo \
  --memory=128m \
  --memory-swap=128m \
  --cpus=0.2 \
  --pids-limit=64 \
  --security-opt no-new-privileges \
  -p 2201:22 \
  -p 8081:80 \
  cloudbox-static-ssh
```

Resource limit yang dipakai:

- Memory: `128m`
- Memory swap: `128m`
- CPU: `0.2`
- PIDs limit: `64`
- Security option: `no-new-privileges`

## 3. Cek Container

```bash
docker ps
```

Pastikan container `cloudbox-demo` berstatus `Up` dan port berikut ter-map:

- `localhost:2201 -> container:22`
- `localhost:8081 -> container:80`

## 4. SSH ke Container

```bash
ssh student@localhost -p 2201
```

Password demo:

```txt
student123
```

Setelah login, cek user:

```bash
whoami
hostname
pwd
```

Expected:

```txt
student
cloudbox-demo
/home/student
```

Root login harus disabled. Untuk membuktikan, coba:

```bash
ssh root@localhost -p 2201
```

Expected: login root ditolak.

## 5. Cek Folder `public_html`

Di dalam SSH session user `student`:

```bash
ls -la /home/student/public_html
cat /home/student/public_html/index.html
```

Folder `/home/student/public_html` harus tersedia dan berisi default `index.html`.

## 6. Upload Static Website

Dari laptop/host, upload file website statis:

```bash
scp -P 2201 -r my-website/* student@localhost:/home/student/public_html/
```

Contoh cepat jika belum punya folder `my-website`:

```bash
mkdir -p /tmp/cloudbox-demo-site
cat > /tmp/cloudbox-demo-site/index.html <<'EOF'
<!doctype html>
<html>
  <head>
    <title>CloudBox Demo Site</title>
  </head>
  <body>
    <h1>Hello from CloudBox Student Box</h1>
    <p>This static website was uploaded with SCP.</p>
  </body>
</html>
EOF
scp -P 2201 -r /tmp/cloudbox-demo-site/* student@localhost:/home/student/public_html/
```

## 7. Buka Website

Buka browser:

```txt
http://localhost:8081
```

Atau cek dengan curl:

```bash
curl http://localhost:8081
```

Expected: nginx menyajikan file dari `/home/student/public_html`.

## 8. Cleanup Demo

```bash
docker stop cloudbox-demo
docker rm cloudbox-demo
```

## Screenshot untuk Laporan UAS Tahap 1

- [ ] `docker build` berhasil.
- [ ] `docker ps` menampilkan `cloudbox-demo`.
- [ ] SSH ke container sebagai `student`.
- [ ] `whoami` menampilkan `student`.
- [ ] Root login ditolak.
- [ ] Isi folder `/home/student/public_html`.
- [ ] Upload `index.html` via SCP.
- [ ] Website tampil di browser `http://localhost:8081`.
- [ ] Resource limit terlihat pada command `docker run`.

## Troubleshooting

Jika port sudah dipakai, ganti port host:

```bash
-p 2202:22
-p 8082:80
```

Jika SSH menolak karena host key berubah setelah container dibuat ulang:

```bash
ssh-keygen -R "[localhost]:2201"
```

Jika container tidak berjalan:

```bash
docker logs cloudbox-demo
```
