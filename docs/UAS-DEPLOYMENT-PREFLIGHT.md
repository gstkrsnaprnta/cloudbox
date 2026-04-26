# KloudBox UAS Tahap 4A: Deployment Preflight

Tahap ini memastikan repository dan dokumen deployment siap sebelum deploy sungguhan ke Tencent VPS. Jangan menjalankan command ke VPS, Certbot, DNS production, atau deployment real pada tahap ini.

## Scope Status

- MID/UTS backend, frontend, Xendit flow, dan CLI: PASS.
- UAS Tahap 1 Docker image user container: PASS.
- UAS Tahap 2 backend provisioning dan dashboard control: PASS.
- UAS Tahap 3 Nginx production routing preparation: PASS.
- Belum dilakukan: deploy VPS, domain DNS final, Certbot HTTPS.

## Repository Preflight

- [ ] Git repository sudah dibuat.
- [ ] Remote GitHub sudah ditambahkan.
- [ ] Project sudah dipush ke GitHub.
- [ ] `.gitignore` melindungi file lokal dan secret.
- [ ] Tidak ada `.env` asli di repository.
- [ ] Tidak ada database SQLite lokal di repository.
- [ ] Tidak ada `node_modules` atau `dist` yang dicommit.

## Gitignore Checklist

Pastikan `.gitignore` berisi:

```gitignore
.env
.env.*
!.env.example
node_modules
dist
*.db
*.sqlite
```

## Secret Checklist

Pastikan semua nilai berikut tidak muncul sebagai secret asli di repo:

- [ ] `JWT_SECRET`
- [ ] `XENDIT_SECRET_KEY`
- [ ] `XENDIT_CALLBACK_TOKEN`
- [ ] Token login/JWT asli.
- [ ] Password production asli.
- [ ] File `.env` asli.

Nilai demo seperti `student123`, `password123`, `development_callback_token`, dan `xnd_development_test_key` hanya boleh dipakai sebagai placeholder/test value di dokumentasi atau `.env.example`.

## Production Path Checklist

Semua instruksi production harus memakai path:

```txt
/var/www/cloudbox
```

Path penting:

- [ ] Backend: `/var/www/cloudbox/backend`
- [ ] Frontend build: `/var/www/cloudbox/frontend/dist`
- [ ] Docker image folder: `/var/www/cloudbox/docker/cloudbox-static-ssh`
- [ ] Backend `.env`: `/var/www/cloudbox/backend/.env`
- [ ] SQLite production draft: `/var/www/cloudbox/backend/prisma/prod.db`

## Domain Placeholder Checklist

Domain masih placeholder sampai DNS sungguhan siap:

- [ ] `kloudbox.my.id`
- [ ] `www.kloudbox.my.id`

Jangan mengganti domain placeholder di repo kecuali domain final sudah diputuskan.

## VPS Preflight

- [ ] VPS Tencent sudah aktif.
- [ ] IP publik VPS sudah diketahui.
- [ ] Bisa SSH ke VPS sebagai admin.
- [ ] OS server Ubuntu 22.04 LTS atau 24.04 LTS.
- [ ] Resource server cukup untuk demo: minimal 2GB RAM dan 40GB storage.

## Domain dan DNS Preflight

- [ ] Domain `.online` sudah dibeli.
- [ ] DNS A record `@` diarahkan ke IP publik VPS.
- [ ] DNS A record `www` diarahkan ke IP publik VPS.
- [ ] DNS sudah resolve ke IP VPS sebelum Certbot dijalankan.

Contoh cek DNS:

```bash
dig kloudbox.my.id
dig www.kloudbox.my.id
```

## Environment Production Preflight

- [ ] Backend `.env` production sudah disiapkan di server.
- [ ] `APP_ENV=production`.
- [ ] `APP_DEBUG=false`.
- [ ] `APP_URL=https://kloudbox.my.id`.
- [ ] `FRONTEND_URL=https://kloudbox.my.id`.
- [ ] `DATABASE_URL=file:/var/www/cloudbox/backend/prisma/prod.db`.
- [ ] `JWT_SECRET` diganti random string panjang.
- [ ] `XENDIT_SECRET_KEY` valid sudah disiapkan.
- [ ] `XENDIT_CALLBACK_TOKEN` valid sudah disiapkan.

Untuk production demo, Xendit boleh tetap memakai test key/sandbox agar tidak menggunakan uang asli.

## Docker Preflight

- [ ] Docker daemon akan diinstall dan dijalankan di server.
- [ ] Docker image `cloudbox-static-ssh` akan dibuild di server.
- [ ] Port container demo `2201` siap digunakan.
- [ ] Port web container demo `8081` hanya dipakai lokal oleh Nginx reverse proxy.
- [ ] Tidak ada container lama yang memakai port `2201` atau `8081`.

## Port Preflight

- [ ] Port `22` siap untuk SSH admin VPS.
- [ ] Port `80` siap untuk HTTP/Nginx.
- [ ] Port `443` disiapkan untuk HTTPS/Certbot tahap berikutnya.
- [ ] Port `2201` siap untuk SSH container demo.

## Certbot Preflight

- [ ] Certbot hanya dijalankan setelah DNS domain resolve ke IP VPS.
- [ ] Port `80` sudah terbuka.
- [ ] Nginx HTTP config sudah valid dengan `sudo nginx -t`.
- [ ] Aplikasi bisa diakses lewat HTTP sebelum HTTPS dibuat.

## Final Go/No-Go

Aman lanjut deploy ke VPS jika:

- [ ] Repo sudah push ke GitHub.
- [ ] Tidak ada secret asli di repo.
- [ ] Dokumen deployment memakai `/var/www/cloudbox`.
- [ ] Domain masih placeholder atau sudah diganti secara sadar ke domain final.
- [ ] Backend lint PASS.
- [ ] Frontend lint PASS.
- [ ] Frontend build PASS.
- [ ] Xendit key test/sandbox valid tersedia untuk demo.
