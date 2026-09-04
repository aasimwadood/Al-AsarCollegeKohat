# Deploying to a rented dedicated server (Ultahost) — runbook

This covers moving `jmckohat` off `localhost` onto a real Ultahost dedicated server, running both the Next.js app and a self-hosted Supabase stack on one box, serving `jmckohat.edu.pk`.

Written as a literal step-by-step you can follow with the server's root SSH credentials in hand. Commands assume Ubuntu 22.04/24.04 (Ultahost's usual default) — adjust package manager commands if you picked something else.

## 0. Before you start

- [ ] Ultahost server provisioned, with its public IP and root SSH access
- [ ] `jmckohat.edu.pk` registered and you control its DNS
- [ ] The current Supabase Cloud project's DB password on hand (Project Settings → Database)
- [ ] A real SMTP provider account (Resend recommended) for production auth emails

## 1. Initial server hardening

```bash
ssh root@<server-ip>

apt update && apt upgrade -y

# Non-root user for day-to-day work
adduser deploy
usermod -aG sudo deploy

# Basic firewall — only what's actually needed
apt install -y ufw
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Disable root SSH login once `deploy` works (do this AFTER confirming you can `ssh deploy@<ip>`)
# In /etc/ssh/sshd_config: PermitRootLogin no, then: systemctl restart ssh
```

## 2. Install Docker, Node.js, Nginx

```bash
# Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy

# Node.js 20 (matches this project's engine)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Process manager for the Next.js app
npm install -g pm2

# Reverse proxy
apt install -y nginx certbot python3-certbot-nginx
```

## 3. Self-hosted Supabase

Run Supabase's own maintained Docker Compose setup — don't hand-roll this, the services (Kong, GoTrue, PostgREST, Realtime, Storage, postgres-meta) are interdependent in ways that are easy to get subtly wrong by reinventing.

```bash
su - deploy
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
```

Edit `.env` and replace **every** secret — the shipped example values are public and well-known:

- `POSTGRES_PASSWORD` — generate a new strong one (`openssl rand -base64 32`)
- `JWT_SECRET` — generate fresh (`openssl rand -base64 40`), at least 32 chars
- `ANON_KEY` / `SERVICE_ROLE_KEY` — regenerate from the new `JWT_SECRET` using Supabase's key generator (their docs link a script for this — do not reuse the example keys)
- `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` — real credentials for the Studio UI
- `SITE_URL` → `https://jmckohat.edu.pk`
- `SMTP_*` settings → your Resend (or other) SMTP credentials, so auth emails actually send at production volume (the project has already hit Supabase Cloud's default email rate limit once in testing — self-hosted needs its own real SMTP from day one)

```bash
docker compose pull
docker compose up -d
docker compose ps   # confirm all services are healthy before moving on
```

By default this exposes the API on port 8000 — Nginx will front it on a subdomain (step 6).

## 4. Migrate the real data from Supabase Cloud

The current Supabase Cloud project (`bulqjxqdbfjbefbofzrd`) has real, live data — 12 departments, 141+ staff records, the full HED hierarchy, the admission policy document, everything built across this project's history. This is a real migration, not a config change.

**From your own machine** (not the server — this needs the Cloud project's DB password, which shouldn't touch the new server until it's ready):

```bash
pg_dump "postgresql://postgres:<CLOUD_DB_PASSWORD>@db.bulqjxqdbfjbefbofzrd.supabase.co:5432/postgres" \
  --no-owner --no-privileges -f jmckohat_backup.sql
```

If direct connection doesn't resolve, use the pooler connection string from Supabase Dashboard → Project Settings → Database → Connection Pooling instead.

Then, copy the dump to the server and restore into the new self-hosted Postgres:

```bash
scp jmckohat_backup.sql deploy@<server-ip>:~
ssh deploy@<server-ip>
psql "postgresql://postgres:<NEW_SELF_HOSTED_PASSWORD>@localhost:5432/postgres" -f jmckohat_backup.sql
```

**Storage objects** (faculty photos, the admission policy document, avatars, course materials, etc.) live in Supabase Storage buckets, not the Postgres dump — these need to be downloaded from the Cloud project and re-uploaded to the self-hosted Storage API separately. Supabase's CLI (`supabase storage`) or a small script against both projects' Storage APIs can do this bucket-by-bucket; there isn't a single built-in "migrate storage" command.

**Verify before cutting over**: query a few real tables (`profiles`, `faculty_directory`, `colleges`) against the new self-hosted instance and confirm row counts match the Cloud project, the same way every phase of this project's original build was verified against live data — don't just trust that the restore ran without errors.

## 5. Deploy the Next.js app

```bash
git clone https://github.com/aasimwadood/jmckohat.git
cd jmckohat
npm ci
```

Create `.env.production` with the **new self-hosted** Supabase values (not the old Cloud ones):

```
NEXT_PUBLIC_SUPABASE_URL=https://api.jmckohat.edu.pk
NEXT_PUBLIC_SUPABASE_ANON_KEY=<the new ANON_KEY from step 3>
SUPABASE_SERVICE_ROLE_KEY=<the new SERVICE_ROLE_KEY from step 3>
NEXT_PUBLIC_SITE_URL=https://jmckohat.edu.pk
```

```bash
npm run build
pm2 start npm --name jmckohat -- start
pm2 save
pm2 startup   # follow the printed instructions so it survives reboots
```

## 6. Nginx + HTTPS for both the app and the Supabase API

Two server blocks — the app on the main domain, Supabase's Kong gateway on an API subdomain:

```nginx
# /etc/nginx/sites-available/jmckohat.edu.pk
server {
    server_name jmckohat.edu.pk www.jmckohat.edu.pk;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    server_name api.jmckohat.edu.pk;
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/jmckohat.edu.pk /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d jmckohat.edu.pk -d www.jmckohat.edu.pk -d api.jmckohat.edu.pk
```

## 7. DNS

At your domain registrar/DNS provider, point these A records at the server's IP:

| Host | Type | Value |
|---|---|---|
| `@` (jmckohat.edu.pk) | A | `<server-ip>` |
| `www` | A | `<server-ip>` |
| `api` | A | `<server-ip>` |

## 8. Backups and monitoring — do this before calling it done

- **Automated backups**: a cron job running `pg_dump` on a schedule, copied off-server (e.g., to object storage or a second machine) — a backup that only lives on the same box it's backing up isn't a real backup.
- **Actually test a restore** once, on a throwaway database, before trusting the backup process.
- **Uptime monitoring**: something like Uptime Kuma (self-hosted) or a free tier of an external service (UptimeRobot) watching `https://jmckohat.edu.pk` and `https://api.jmckohat.edu.pk` from outside the server.
- **OS/Docker image updates**: a recurring reminder (not automatic — test updates before applying to a production system with real student/staff data).

## 9. Final smoke test

- [ ] Public site loads over HTTPS on the real domain
- [ ] Login works (username and email both, per this project's auth setup)
- [ ] A staff invite email actually arrives (tests the new SMTP config end to end)
- [ ] Faculty photos and the admission policy document load (tests Storage migration)
- [ ] Each of the 8 role dashboards + the 4 HED-hierarchy dashboards load without the icon-serialization error class of bug (§10.17 in MIGRATION_PLAN.md) — this is exactly the kind of thing that only surfaces on a real page load, not a database check
