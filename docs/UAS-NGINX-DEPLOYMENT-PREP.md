# KloudBox UAS Tahap 3: Nginx Deployment Prep

## Tujuan Tahap 3

Tahap ini menyiapkan konfigurasi production untuk KloudBox tanpa benar-benar deploy ke VPS dan tanpa menjalankan Certbot. Fokusnya adalah Nginx reverse proxy, systemd backend service, firewall draft, dan dokumentasi deployment.

## Nginx Reverse Proxy

File utama:

```txt
deploy/nginx-cloudbox.conf
```

Nginx akan menerima traffic HTTP port 80 untuk domain placeholder:

```txt
kloudbox.my.id
www.kloudbox.my.id
```

Frontend React build disajikan dari:

```txt
/var/www/cloudbox/frontend/dist
```

## Routing `/api` ke Backend

Route:

```txt
/api/
```

Diproses oleh backend Express:

```txt
http://127.0.0.1:5000/api/
```

Contoh production check:

```bash
curl http://kloudbox.my.id/api/health
```

Header proxy standar yang dipakai:

- `Host`
- `X-Real-IP`
- `X-Forwarded-For`
- `X-Forwarded-Proto`

## Routing `/sites/riansyah/` ke Container

Route:

```txt
/sites/riansyah/
```

Diproxy ke container web port demo:

```txt
http://127.0.0.1:8081/
```

Dengan ini static website user bisa diakses lewat:

```txt
http://kloudbox.my.id/sites/riansyah/
```

Pada tahap HTTPS nanti URL akan menjadi:

```txt
https://kloudbox.my.id/sites/riansyah/
```

## React Router Fallback

Frontend memakai React Router. Karena itu route selain `/api/` dan `/sites/riansyah/` memakai:

```nginx
try_files $uri /index.html;
```

Ini membuat route seperti `/dashboard`, `/pricing`, dan `/login` tetap dibuka oleh frontend.

## Systemd Backend

File:

```txt
deploy/cloudbox-backend.service
```

Service menjalankan backend dari:

```txt
/var/www/cloudbox/backend
```

Environment diambil dari:

```txt
/var/www/cloudbox/backend/.env
```

Untuk MVP demo, service memakai `User=root` agar backend bisa memanggil Docker CLI. Untuk production serius, gunakan user khusus dengan permission Docker terbatas.

## Firewall

File:

```txt
deploy/firewall.md
```

Port yang dibuka:

- `OpenSSH` untuk admin VPS.
- `Nginx Full` untuk HTTP/HTTPS.
- `2201/tcp` untuk SSH container demo.

Jangan expose Docker daemon ke internet.

## Production Health Check

Backend lokal:

```bash
curl http://127.0.0.1:5000/api/health
```

Melalui Nginx:

```bash
curl http://localhost/api/health
```

Melalui domain:

```bash
curl http://kloudbox.my.id/api/health
```

## Screenshot Checklist Tahap 3

- [ ] File `deploy/nginx-cloudbox.conf`.
- [ ] File `deploy/cloudbox-backend.service`.
- [ ] File `deploy/firewall.md`.
- [ ] File `deploy/deployment-production.md`.
- [ ] File `deploy/env-production-example.md`.
- [ ] `nginx-cloudbox.conf` berisi server_name `kloudbox.my.id www.kloudbox.my.id`.
- [ ] Nginx config berisi root `/var/www/cloudbox/frontend/dist`.
- [ ] Nginx config berisi proxy `/api/` ke `127.0.0.1:5000`.
- [ ] Nginx config berisi proxy `/sites/riansyah/` ke `127.0.0.1:8081`.
- [ ] Nginx config berisi React Router fallback `try_files $uri /index.html`.
- [ ] Systemd service berisi `Requires=docker.service`.
- [ ] Systemd service berisi `EnvironmentFile=/var/www/cloudbox/backend/.env`.
- [ ] Dokumentasi firewall menampilkan `ufw status`.
- [ ] Dokumentasi deployment production tersedia.
- [ ] Backend lint PASS.
- [ ] Frontend lint/build PASS.
