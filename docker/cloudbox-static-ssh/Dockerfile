FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        openssh-server \
        nginx \
        nano \
        vim \
        curl \
        tree \
        procps \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash student \
    && echo "student:student123" | chpasswd \
    && mkdir -p /home/student/public_html /run/sshd /run/nginx \
    && chown -R student:student /home/student/public_html \
    && chmod 755 /home/student

RUN cat > /home/student/public_html/index.html <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>KloudBox</title>
  </head>
  <body>
    <h1>Welcome to KloudBox</h1>
    <p>Upload your static website to public_html.</p>
  </body>
</html>
EOF

RUN chown student:student /home/student/public_html/index.html \
    && rm -f /etc/nginx/sites-enabled/default

COPY nginx-default.conf /etc/nginx/sites-available/cloudbox-static
COPY entrypoint.sh /usr/local/bin/cloudbox-entrypoint

RUN ln -s /etc/nginx/sites-available/cloudbox-static /etc/nginx/sites-enabled/cloudbox-static \
    && chmod +x /usr/local/bin/cloudbox-entrypoint \
    && printf '\nPermitRootLogin no\nPasswordAuthentication yes\nUsePAM yes\n' >> /etc/ssh/sshd_config

EXPOSE 22 80

CMD ["/usr/local/bin/cloudbox-entrypoint"]
