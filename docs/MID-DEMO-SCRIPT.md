# CloudBox MID/UTS Demo Script

Script ini menjelaskan urutan demo fase MID/UTS. Fokus demo adalah REST API Xendit, environment `.env`, dashboard order, webhook, dan CLI check invoice. Jangan lanjut ke Docker, SSH container, Nginx, domain, Certbot, atau deployment UAS pada demo ini.

## 1. Jalankan Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run seed
npm start
```

Backend berjalan di:

```txt
http://localhost:5000
```

## 2. Jalankan Frontend

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

## 3. Buka Landing Page

Buka browser:

```txt
http://127.0.0.1:5173
```

Tunjukkan landing page CloudBox dan navbar.

## 4. Register Akun

Buka:

```txt
http://127.0.0.1:5173/register
```

Isi nama, email, dan password. Setelah register berhasil, user diarahkan ke dashboard.

## 5. Login

Logout jika perlu, lalu buka:

```txt
http://127.0.0.1:5173/login
```

Login memakai email dan password yang baru dibuat.

## 6. Buka Pricing

Buka:

```txt
http://127.0.0.1:5173/pricing
```

Tunjukkan paket `Student Box` dengan harga Rp5.000.

## 7. Klik Beli Student Box

Klik tombol `Beli Paket`. Frontend akan memanggil:

```txt
POST /api/orders
```

Backend membuat order lokal dan memanggil Xendit Invoice API.

## 8. Backend Membuat Invoice Xendit

Tunjukkan response berisi `invoice_url`. Jika Xendit test key valid, order akan menyimpan:

- `external_id`
- `xendit_invoice_id`
- `invoice_url`
- `amount`
- `status`

## 9. Buka Invoice URL

Klik link invoice Xendit yang tampil di frontend. Tunjukkan halaman checkout Xendit test mode/sandbox.

## 10. Simulasikan Webhook/Callback

Gunakan `external_id` dari order yang dibuat. Untuk testing lokal manual, kirim webhook dengan callback token yang sama seperti `XENDIT_CALLBACK_TOKEN`.

```bash
curl -X POST http://localhost:5000/api/xendit/webhook \
  -H "Content-Type: application/json" \
  -H "x-callback-token: development_callback_token" \
  -d '{
    "id": "inv_demo_mid",
    "external_id": "cloudbox-USERID-TIMESTAMP",
    "status": "PAID",
    "amount": 5000,
    "invoice_url": "https://checkout.xendit.co/web/inv_demo_mid"
  }'
```

Expected response:

```json
{
  "message": "Webhook received."
}
```

Webhook akan menyimpan payload ke `webhook_logs`, mengubah order menjadi `PAID`, dan memanggil stub `provisionCloudBoxAfterPayment(order)`.

## 11. Dashboard Menampilkan Status Order

Buka:

```txt
http://127.0.0.1:5173/dashboard
```

Klik `Refresh` dan tunjukkan status order.

## 12. Jalankan CLI Check Invoice

Gunakan invoice ID Xendit asli dari hasil create order:

```bash
cd backend
node scripts/check-xendit-invoice.js inv_xxx
```

Output yang ditunjukkan:

```txt
Invoice ID: inv_xxx
External ID: cloudbox-...
Amount: 5000
Status: PENDING/PAID/EXPIRED
Invoice URL: https://checkout.xendit.co/web/...
```

## 13. Tampilkan Perbedaan Environment

Development lokal:

```env
APP_ENV=development
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=file:./dev.db
XENDIT_SECRET_KEY=xnd_development_test_key
```

Contoh production server:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://cloudbox.example.online
FRONTEND_URL=https://cloudbox.example.online
DATABASE_URL=file:/var/www/cloudbox/backend/prisma/prod.db
XENDIT_SECRET_KEY=xnd_production_or_test_key_for_demo
```

Sensor semua nilai secret sebelum screenshot laporan.

## Curl Testing

### GET `/api/health`

```bash
curl http://localhost:5000/api/health
```

### POST `/api/auth/register`

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Student",
    "email": "demo.student@example.com",
    "password": "password123"
  }'
```

### POST `/api/auth/login`

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo.student@example.com",
    "password": "password123"
  }'
```

Simpan nilai `token` dari response login untuk request yang memakai JWT.

### GET `/api/packages`

```bash
curl http://localhost:5000/api/packages
```

### POST `/api/orders`

Ganti `JWT_TOKEN_HERE` dengan token login.

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKEN_HERE" \
  -d '{
    "packageId": 1
  }'
```

Request ini membutuhkan `XENDIT_SECRET_KEY` valid agar invoice benar-benar dibuat.

### POST `/api/xendit/webhook`

Ganti `cloudbox-USERID-TIMESTAMP` dengan `external_id` order yang ingin diuji.

```bash
curl -X POST http://localhost:5000/api/xendit/webhook \
  -H "Content-Type: application/json" \
  -H "x-callback-token: development_callback_token" \
  -d '{
    "id": "inv_demo_mid",
    "external_id": "cloudbox-USERID-TIMESTAMP",
    "status": "PAID",
    "amount": 5000,
    "invoice_url": "https://checkout.xendit.co/web/inv_demo_mid"
  }'
```

## Penutup Demo

Tutup demo dengan menunjukkan:

- `.gitignore` melindungi `.env`.
- `.env.example` tersedia untuk backend dan frontend.
- Provisioning masih stub untuk MID.
- Docker, SSH container, Nginx, domain, Certbot, dan deployment production belum dijalankan pada fase MID.
