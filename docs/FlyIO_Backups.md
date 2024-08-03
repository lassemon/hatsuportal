# Fly.io Database Backups (Tigris)

Step-by-step guide for storing **hatsuportal** Postgres backups in a dedicated Tigris bucket (`hatsuportal-backups`), separate from the media bucket (`hatsuportal-media`).

**Why a separate bucket?**

- Media and backups have different lifecycles and access patterns.
- The app’s orphan-image cleaner only scans the `images/` prefix in the media bucket. Backups must not live in a bucket the app lists and deletes from.
- Backup credentials live only on the scheduled backup Machine — they do not replace the app’s media `AWS_*` / `BUCKET_NAME` secrets.

**Prerequisites**

- [Fly.io Implementation](./FlyIO_Implementation.md) Steps 2–7 completed (`hatsuportal` app deployed, Postgres attached).
- `flyctl` installed and authenticated (`fly auth login`).
- Media bucket `hatsuportal-media` already created via `fly storage create` (Implementation Step 5).

**Shell commands** use Git Bash on Windows. Prefix with `MSYS_NO_PATHCONV=1` so `/bin/sh` is not rewritten. On macOS or Linux, omit that prefix.

---

## Bucket layout

| Bucket                | Purpose                        | Used by                           |
| --------------------- | ------------------------------ | --------------------------------- |
| `hatsuportal-media`   | User uploads (`images/`, etc.) | App (`TigrisImageStorageService`) |
| `hatsuportal-backups` | Daily `pg_dump` archives       | Scheduled Fly Machine only        |

Backup objects use the `db-backups/` prefix:

```
db-backups/2026-07-20.sql.gz
db-backups/2026-07-21.sql.gz
```

---

## Important: credential env var names

The `hatsuportal` app already has **media** credentials as Fly secrets named `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. When you run a Machine on that app, Fly injects those secrets — they **override** any `--env AWS_ACCESS_KEY_ID=...` you pass on the command line.

For backup Machines, use **different env var names** and pass them inline to `aws`:

```
BACKUP_KEY=tid_...
BACKUP_SECRET=tsec_...
AWS_ACCESS_KEY_ID=$BACKUP_KEY AWS_SECRET_ACCESS_KEY=$BACKUP_SECRET aws s3 ...
```

Never rely on `$AWS_ACCESS_KEY_ID` inside the shell script on `--app hatsuportal`.

---

## Step 1 — Create the backup bucket

Fly’s `fly storage create` allows **one Tigris bucket per Fly app**. Since `hatsuportal` already has `hatsuportal-media`, create the backup bucket in the **Tigris console** instead.

1. Open [console.storage.dev](https://console.storage.dev) → **Sign in with Fly.io**.
2. Create a bucket named `hatsuportal-backups`.
3. Create an **access key** for that bucket with the **Editor** role (ReadOnly cannot upload).
4. Save the key ID (`tid_...`) and secret (`tsec_...`) — they are shown once.

S3 endpoint: `https://t3.storage.dev`, region: `auto`.

---

## Step 2 — Lifecycle rule (auto-expire old backups)

Daily backups accumulate quickly. Add a lifecycle rule so old dumps are removed automatically.

In the [Tigris console](https://console.storage.dev), open **hatsuportal-backups** and add a lifecycle rule:

- **Prefix:** `db-backups/`
- **Action:** expire objects after **14 days** (adjust retention to taste)

---

## Step 3 — Get the database connection URL

The backup Machine needs the full `DATABASE_URL`. Fly stores it as an app secret but does not let you read it back with `fly secrets list`. With scale-to-zero, the app may have no running Machine, so print it from a one-off Machine that inherits app secrets:

```sh
MSYS_NO_PATHCONV=1 fly machine run alpine:3 \
  --app hatsuportal \
  --region arn \
  --rm \
  --restart no \
  -- /bin/sh -c 'printenv DATABASE_URL'
```

Copy the full output line (starts with `postgres://`). It should look like:

```
postgres://hatsuportal:<password>@hatsuportal-db.flycast:5432/hatsuportal?sslmode=disable
```

Save it in a password manager. You will paste it into `--env DATABASE_URL='...'` in the next steps.

---

## Step 4 — Verify backup credentials (upload probe)

Run this once before creating the backup Machine. Replace `tid_...` and `tsec_...` with your backup bucket access key.

```sh
MSYS_NO_PATHCONV=1 fly machine run alpine:3.20 \
  --app hatsuportal \
  --region arn \
  --rm \
  --restart no \
  --env BACKUP_KEY='tid_...' \
  --env BACKUP_SECRET='tsec_...' \
  --env AWS_REGION=auto \
  --env BUCKET=hatsuportal-backups \
  -- /bin/sh -c 'apk add --no-cache aws-cli && echo hello | AWS_ACCESS_KEY_ID=$BACKUP_KEY AWS_SECRET_ACCESS_KEY=$BACKUP_SECRET AWS_DEFAULT_REGION=auto aws s3 cp - "s3://${BUCKET}/db-backups/_probe.txt" --endpoint-url https://t3.storage.dev && echo UPLOAD_OK'
```

Expect `UPLOAD_OK`. Confirm `_probe.txt` appears under `db-backups/` in [console.storage.dev](https://console.storage.dev).

---

## Step 5 — Verify with a one-off manual run

Run a full backup once before creating the scheduled Machine in Step 6:

```sh
MSYS_NO_PATHCONV=1 fly machine run postgres:18-alpine \
  --app hatsuportal \
  --region arn \
  --restart no \
  --rm \
  --env DATABASE_URL='postgres://hatsuportal:<password>@hatsuportal-db.flycast:5432/hatsuportal?sslmode=disable' \
  --env BACKUP_KEY='tid_...' \
  --env BACKUP_SECRET='tsec_...' \
  --env AWS_REGION='auto' \
  --env BUCKET='hatsuportal-backups' \
  -- /bin/sh -c 'apk add --no-cache aws-cli && pg_dump "$DATABASE_URL" | gzip | AWS_ACCESS_KEY_ID=$BACKUP_KEY AWS_SECRET_ACCESS_KEY=$BACKUP_SECRET AWS_DEFAULT_REGION=auto aws s3 cp - "s3://${BUCKET}/db-backups/$(date +%Y-%m-%d).sql.gz" --endpoint-url https://t3.storage.dev && echo BACKUP_OK'
```

Check logs for `BACKUP_OK`:

```sh
fly logs --app hatsuportal
```

Confirm the object in [console.storage.dev](https://console.storage.dev) under `hatsuportal-backups` → `db-backups/`.

---

## Step 6 — Create the daily scheduled backup Machine

After Step 5 succeeds, create the recurring Machine. It runs `pg_dump`, gzips, uploads to `s3://hatsuportal-backups/db-backups/YYYY-MM-DD.sql.gz`, then exits. `--schedule daily` recreates it each day.

```sh
MSYS_NO_PATHCONV=1 fly machine run postgres:18-alpine \
  --app hatsuportal \
  --region arn \
  --schedule daily \
  --restart no \
  --env DATABASE_URL='postgres://hatsuportal:<password>@hatsuportal-db.flycast:5432/hatsuportal?sslmode=disable' \
  --env BACKUP_KEY='tid_...' \
  --env BACKUP_SECRET='tsec_...' \
  --env AWS_REGION='auto' \
  --env BUCKET='hatsuportal-backups' \
  -- /bin/sh -c 'apk add --no-cache aws-cli && pg_dump "$DATABASE_URL" | gzip | AWS_ACCESS_KEY_ID=$BACKUP_KEY AWS_SECRET_ACCESS_KEY=$BACKUP_SECRET AWS_DEFAULT_REGION=auto aws s3 cp - "s3://${BUCKET}/db-backups/$(date +%Y-%m-%d).sql.gz" --endpoint-url https://t3.storage.dev && echo BACKUP_OK'
```

Use `postgres:18-alpine` to match Fly Postgres 17+/18. Backup credentials are Machine env vars only — they do not replace `BUCKET_NAME=hatsuportal-media` on the app.

---

## Step 7 — Restore from a backup

Download the archive from [console.storage.dev](https://console.storage.dev) (`hatsuportal-backups` → `db-backups/`), gunzip locally, then restore into Fly Postgres (destructive — replaces current data):

```sh
gunzip restore.sql.gz
fly postgres connect -a hatsuportal-db
# In psql: drop/recreate database or use a fresh cluster for safety, then load restore.sql
```

Test restores periodically on a clone or local Docker Postgres to validate backup integrity.

---

## Troubleshooting

| Symptom                                                          | Likely cause                                                                    | Fix                                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `A Tigris project named … already exists for app hatsuportal`    | Second `fly storage create` for the same app                                    | Create `hatsuportal-backups` via Tigris console, not `fly storage create`                                    |
| `AccessDenied` on `PutObject` with backup key                    | Access key is **ReadOnly**, or media app secrets are used instead of backup key | Use **Editor** role on the backup key; use `BACKUP_KEY` / `BACKUP_SECRET` env names, not `AWS_ACCESS_KEY_ID` |
| Git Bash: `exec: "C:/Program Files/git/usr/bin/sh": stat failed` | Path conversion                                                                 | Prefix with `MSYS_NO_PATHCONV=1` and use `-- /bin/sh -c '...'`                                               |
| `pg_dump: server version mismatch`                               | Wrong Postgres client image                                                     | Use `postgres:18-alpine`                                                                                     |
| Backup Machine exits immediately, no upload                      | Default `postgres` CMD used instead of shell script                             | Pass script after `--` as shown in Step 6                                                                    |

---

---

## Related documentation

- [FlyIO_Implementation.md](./FlyIO_Implementation.md) — main deploy guide (media bucket, app secrets, first deploy).
