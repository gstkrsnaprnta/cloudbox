# KloudBox Firewall Setup

Gunakan UFW untuk membuka akses minimum yang dibutuhkan KloudBox MVP.

## Commands

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 2201/tcp
sudo ufw enable
sudo ufw status
```

## Notes

- `OpenSSH` menjaga akses admin ke VPS utama.
- `Nginx Full` membuka HTTP dan HTTPS untuk aplikasi KloudBox.
- `2201/tcp` membuka SSH container demo `Student Box`.
- Untuk user/container tambahan, tambahkan port SSH mapping lain secara eksplisit.
- Jangan membuka port Docker daemon ke internet.
