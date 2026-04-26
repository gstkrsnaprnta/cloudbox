# KloudBox

KloudBox adalah SaaS simulasi VPS mini. Implementasi saat ini sengaja fokus pada fase MID/UTS: REST API Xendit, simulasi environment lewat `.env`, dashboard order, webhook payment, dan CLI untuk cek invoice.

Fitur Docker provisioning, SSH container, Nginx production, Certbot, dan deployment penuh disiapkan sebagai target fase UAS. Pada fase ini provisioning hanya berupa stub `provisionCloudBoxAfterPayment(order)`.

## Struktur

```txt
cloudbox/
├── backend/   # Express, Prisma SQLite, JWT, Xendit
├── frontend/  # React + Vite dashboard
├── docs/      # Panduan testing MID/UTS
└── README.md
```

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:migrate
npm run seed
npm run dev
```

Backend berjalan di `http://localhost:5000`.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

## CLI Xendit

```bash
cd backend
node scripts/check-xendit-invoice.js inv_xxx
```

## Endpoint Utama

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/packages`
- `GET /api/orders`
- `POST /api/orders`
- `POST /api/xendit/webhook`

## Environment

File `.env` tidak boleh dicommit. Gunakan `.env.example` sebagai template untuk development dan production.

## Dokumentasi MID/UTS

- `docs/MID-TESTING.md`
- `docs/MID-CHECKLIST.md`
- `docs/MID-DEMO-SCRIPT.md`
- `docs/UAS-DOCKER-TESTING.md`
- `docs/UAS-BACKEND-PROVISIONING.md`
- `docs/UAS-NGINX-DEPLOYMENT-PREP.md`
- `docs/UAS-DEPLOYMENT-PREFLIGHT.md`
- `docs/UAS-DEPLOYMENT-COMMANDS.md`
- `docs/UAS-VPS-DEPLOYMENT-RUNBOOK.md`

## Catatan Audit Dependency

Saat review MID, `npm audit` frontend melaporkan 2 moderate vulnerabilities dari rantai `vite -> esbuild` terkait dev server. NPM menawarkan `npm audit fix --force`, tetapi itu dapat menaikkan Vite ke versi breaking. Untuk fase MID, catat sebagai risiko dependency development dan upgrade setelah diuji terpisah.
