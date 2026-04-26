# CloudBox Static SSH Image

Ubuntu 22.04 image for UAS tahap 1. It runs SSH for the `student` user and serves `/home/student/public_html` through nginx on port 80.

Default demo credentials:

```txt
username: student
password: student123
```

Build:

```bash
docker build -t cloudbox-static-ssh .
```
