# KloudBox MID/UTS Testing Guide

Panduan ini fokus untuk kebutuhan MID/UTS: Xendit REST API, environment `.env`, dashboard order, webhook, dan CLI check invoice.

## 1. Install Backend

```bash
cd backend
npm install
```

## 2. Setup `.env` Development Backend

```bash
cd backend
cp .env.example .env
```

Isi `XENDIT_SECRET_KEY` dengan test secret key dari dashboard Xendit dan samakan `XENDIT_CALLBACK_TOKEN` dengan callback token webhook Xendit.

## 3. Jalankan Migration Prisma

```bash
cd backend
npm run prisma:migrate
npm run seed
```

`npm run seed` membuat paket aktif `Student Box` seharga Rp5.000.

## 4. Jalankan Backend

```bash
cd backend
npm run dev
```

Cek health endpoint:

```bash
curl http://localhost:5000/api/health
```

## 5. Install Frontend

```bash
cd frontend
npm install
```

## 6. Setup `.env` Development Frontend

```bash
cd frontend
cp .env.example .env
```

Pastikan value berikut mengarah ke backend lokal:

```env
VITE_API_URL=http://localhost:5000/api
```

## 7. Jalankan Frontend

```bash
cd frontend
npm run dev
```

Buka `http://localhost:5173`.

## 8. Membuat Invoice Xendit dari Dashboard

1. Buka `http://localhost:5173/register`.
2. Register user baru.
3. Buka halaman `Pricing`.
4. Klik `Beli Paket` pada Student Box.
5. Backend membuat order `PENDING` dan memanggil Xendit Invoice API.
6. Frontend menampilkan `invoice_url`.
7. Klik link invoice untuk membuka halaman pembayaran Xendit.
8. Buka `Dashboard` untuk melihat order dan statusnya.

## 9. Webhook Xendit

Endpoint webhook:

```txt
POST http://localhost:5000/api/xendit/webhook
```

Header wajib:

```txt
x-callback-token: development_callback_token
```

Jika payload webhook memiliki status `PAID` atau `SETTLED`, backend mengubah order menjadi `PAID`, menyimpan payload ke tabel `webhook_logs`, dan menjalankan stub `provisionCloudBoxAfterPayment(order)`.

Untuk testing lokal dari Xendit, gunakan tunnel seperti Ngrok dan arahkan webhook Xendit ke:

```txt
https://your-ngrok-url/api/xendit/webhook
```

## 10. CLI Check Invoice

```bash
cd backend
node scripts/check-xendit-invoice.js inv_xxx
```

Output yang harus tampil:

```txt
Invoice ID: inv_xxx
External ID: cloudbox-...
Amount: 5000
Status: PENDING/PAID/EXPIRED
Invoice URL: https://checkout.xendit.co/web/...
```

## 11. Screenshot untuk Laporan MID/UTS

- Landing page KloudBox.
- Pricing page dengan Student Box.
- Register/login berhasil.
- Dashboard order.
- Invoice URL tampil setelah klik beli paket.
- Halaman invoice Xendit sandbox/test.
- Database/order berisi `external_id`, `xendit_invoice_id`, `invoice_url`, `amount`, dan `status`.
- Webhook Xendit berhasil diterima atau payload webhook tersimpan di `webhook_logs`.
- CLI `node scripts/check-xendit-invoice.js inv_xxx` menampilkan detail invoice.
- `.gitignore` berisi aturan `.env`, `.env.*`, `!.env.example`, `node_modules`, `dist`, `*.db`, dan `*.sqlite`.
- `backend/.env.example` dan `frontend/.env.example` tersedia.
- Contoh perbedaan `.env` development dan production dengan secret disensor.

## 12. Verifikasi Dasar

```bash
cd backend
npm run lint

cd ../frontend
npm run lint
npm run build
```
