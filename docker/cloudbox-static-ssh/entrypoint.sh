#!/usr/bin/env bash
set -euo pipefail

mkdir -p /run/sshd /run/nginx
chown -R student:student /home/student/public_html

nginx
exec /usr/sbin/sshd -D -e
