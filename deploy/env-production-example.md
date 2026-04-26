# CloudBox Production `.env` Example

Contoh ini aman untuk dokumentasi karena secret disensor. Jangan commit `.env` asli.

```env
APP_NAME=CloudBox
APP_ENV=production
APP_DEBUG=false
APP_URL=https://cloudbox.online
FRONTEND_URL=https://cloudbox.online
PORT=5000
DATABASE_URL=file:/var/www/cloudbox/backend/prisma/prod.db
JWT_SECRET=********
XENDIT_SECRET_KEY=********
XENDIT_CALLBACK_TOKEN=********
XENDIT_SUCCESS_REDIRECT_URL=https://cloudbox.online/dashboard?payment=success
XENDIT_FAILURE_REDIRECT_URL=https://cloudbox.online/pricing?payment=failed
DOCKER_IMAGE=cloudbox-static-ssh
SSH_HOST=cloudbox.online
SSH_PORT_START=2201
WEB_PORT_START=8081
DEFAULT_BOX_USERNAME=student
DEFAULT_BOX_PASSWORD=student123
BOX_MEMORY_MB=128
BOX_CPU_LIMIT=0.2
BOX_PIDS_LIMIT=64
BOX_DURATION_DAYS=7
```

## Production Notes

- Ganti `JWT_SECRET` dengan random string panjang.
- Gunakan Xendit key dan callback token sesuai mode demo/live yang dipakai.
- Untuk demo UAS, `DEFAULT_BOX_PASSWORD=student123` masih boleh. Untuk production serius, generate password unik per user.
- `DATABASE_URL` memakai SQLite production path. Jika traffic bertambah, migrasikan ke PostgreSQL.
