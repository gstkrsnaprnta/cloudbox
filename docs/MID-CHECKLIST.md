# KloudBox MID/UTS Checklist

Gunakan checklist ini sebagai daftar bukti screenshot untuk laporan MID/UTS. Sensor secret key, callback token, JWT, dan data sensitif lain sebelum dimasukkan ke laporan.

## Screenshot Aplikasi

- [ ] Landing page KloudBox tampil di `http://127.0.0.1:5173`.
- [ ] Navbar KloudBox tampil.
- [ ] Pricing page menampilkan paket `Student Box`.
- [ ] Form register user tampil.
- [ ] Register user berhasil.
- [ ] Form login user tampil.
- [ ] Login user berhasil.
- [ ] Dashboard user tampil.
- [ ] Dashboard order menampilkan daftar order dan status.

## Screenshot Xendit dan Order

- [ ] Klik `Beli Paket` pada Student Box.
- [ ] Backend membuat invoice Xendit.
- [ ] `invoice_url` berhasil dibuat dan tampil di frontend.
- [ ] Halaman invoice Xendit test mode/sandbox terbuka.
- [ ] Dashboard Xendit menunjukkan invoice test/sandbox.
- [ ] Data order tersimpan di database.
- [ ] Data order memiliki `external_id`.
- [ ] Data order memiliki `xendit_invoice_id`.
- [ ] Data order memiliki `invoice_url`.
- [ ] Data order memiliki `amount`.
- [ ] Data order memiliki `status`.

## Screenshot Webhook

- [ ] Endpoint webhook tersedia di `POST /api/xendit/webhook`.
- [ ] Header webhook memakai `x-callback-token`.
- [ ] Callback token divalidasi dari `XENDIT_CALLBACK_TOKEN`.
- [ ] Payload webhook tersimpan di tabel `webhook_logs`.
- [ ] Status order berubah menjadi `PAID` setelah webhook `PAID` atau `SETTLED`.

## Screenshot CLI dan Environment

- [ ] CLI `node scripts/check-xendit-invoice.js inv_xxx` berjalan.
- [ ] CLI menampilkan Invoice ID.
- [ ] CLI menampilkan External ID.
- [ ] CLI menampilkan Amount.
- [ ] CLI menampilkan Status.
- [ ] CLI menampilkan Invoice URL.
- [ ] `.env` development di laptop tersedia secara lokal dan tidak dicommit.
- [ ] Contoh `.env` production untuk server ditampilkan dengan secret disensor.
- [ ] `.gitignore` berisi `.env`.
- [ ] `.gitignore` berisi `.env.*`.
- [ ] `.gitignore` berisi `!.env.example`.
- [ ] `backend/.env.example` tersedia.
- [ ] `frontend/.env.example` tersedia.

## Screenshot Scope MID

- [ ] Bukti Xendit berjalan di test mode/sandbox.
- [ ] Bukti provisioning masih stub untuk MID.
- [ ] File `backend/src/services/provisioningService.js` berisi `provisionCloudBoxAfterPayment(order)`.
- [ ] Tidak ada Docker provisioning aktif pada fase MID.
- [ ] Tidak ada SSH container, Nginx, domain, Certbot, atau deployment UAS yang dijalankan pada fase MID.

## Catatan NPM Audit

Saat review MID, `npm audit` frontend menampilkan 2 moderate vulnerabilities dari rantai `vite -> esbuild` terkait dev server. Jangan menjalankan `npm audit fix --force` saat demo MID kecuali sudah diuji karena command tersebut dapat menaikkan Vite ke versi breaking.
