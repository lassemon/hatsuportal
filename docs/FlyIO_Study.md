# Fly.io Deployment Study

> Research date: 2026-05-02
> Purpose: Plan deployment of hatsuportal (React frontend + Node.js backend + PostgreSQL + file storage) to fly.io with a custom domain.

---

## Executive Summary

### App Context

Hatsuportal is a small private social app for a friend group. Target scale:

- ~20 concurrent users at peak, ~200 total registered users maximum
- Content has three visibility tiers: `private`, `logged_in`, `public` (public content viewable by friends/relatives of members)
- No revenue, no growth ambitions — running cost must be sustainable by a single person

### Recommended Deployment: Single Machine on fly.io

Run everything on **one `shared-cpu-1x` fly.io Machine** (1 GB RAM recommended — see memory note below):

- Express backend serves the compiled React SPA as static files (`express.static`) plus all API routes
- No separate frontend machine needed — same origin, no CORS required in production
- fly.io handles TLS at the edge; the app runs plain HTTP internally
- Fly Postgres (unmanaged) on a separate small machine for the database
- Tigris object storage for all media (images now, audio/video later)
- Scale-to-zero enabled: the machine stops when idle and restarts on first request (~3–5 second cold start, acceptable for a personal app)

### Estimated Monthly Cost

| Item                                         | Cost              |
| -------------------------------------------- | ----------------- |
| App machine (shared-cpu-1x, 1 GB RAM)        | ~$5–6             |
| Postgres machine + 3 GB volume               | ~$4–5             |
| Dedicated IPv4 (custom domain)               | $2                |
| Tigris media storage (within 5 GB free tier) | $0                |
| pg_dump backups in Tigris (~1 GB)            | ~$0.01            |
| **Total**                                    | **~$11–13/month** |

Storage costs scale gradually: 100 GB of media adds ~$2/month on Tigris.

### Code Changes Required Before Deploy

All changes are straightforward and confined to well-understood files:

| #   | File                                                           | Change                                                                                                 |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1   | `backend/src/server.ts`                                        | Switch from `https.createServer` to plain HTTP; read port from `PORT` env var                          |
| 2   | `backend/src/app.ts`                                           | Remove hardcoded CORS origin; add `express.static` to serve `frontend/build/` plus SPA catch-all route |
| 3   | `backend/src/infrastructure/dataAccess/database/connection.ts` | Parse `DATABASE_URL` when present (fly.io injects this on `postgres attach`)                           |
| 4   | `backend/src/infrastructure/services/OrphanImageCleaner.ts`    | Replace `fs.readdir` with `listAllStorageKeys()` on `IImageStorageService`                             |
| 5   | `entrypoint.sh`                                                | New production variant that runs `npm start --workspace=backend`                                       |
| 6   | `Dockerfile`                                                   | Multi-stage build (builder + lean runner); remove cert dependencies; use production entrypoint         |
| 7   | `backend/package.json`                                         | Update `db:migrate` script to drop `dotenv -e .env.dev` prefix (fly secrets inject vars directly)      |
| 8   | `boundedContext/mediaManagement/.../ImageStorageService.ts`    | Replace with `TigrisStorageService` implementing `IImageStorageService` via AWS S3 SDK                 |
| 9   | `IImageStorageService.ts`                                      | Add `listAllStorageKeys(): Promise<string[]>` method (needed for OrphanImageCleaner)                   |

### Feasibility Review

Every proposed change has been verified against the actual codebase:

**HTTP instead of HTTPS** — `server.ts` creates an HTTPS server using cert files from `./cert/`. Replacing with `app.listen(port)` (plain HTTP) is a 3-line change. fly.io terminates TLS at the edge so internal HTTP is correct. The frontend's HTTPS dev-server config in `vite.config.ts` is already commented out, confirming this direction was already anticipated.

**Single machine / serve frontend from backend** — The Vite build outputs to `frontend/build/`. The backend TypeScript compiles to `backend/build/`. These paths don't conflict inside the Docker container (`/app/frontend/build/` vs `/app/backend/build/`). Express can serve the frontend with `express.static` plus a catch-all `*` route returning `index.html` for React Router to handle client-side navigation. This is a standard, well-proven pattern.

**CORS removal** — With frontend and backend on the same origin (same domain, same port), browser same-origin policy means CORS headers are not needed for the frontend at all. The `cors()` middleware call in `app.ts` can be removed or restricted to just the custom domain. Either way this is a 1-line change.

**Multi-stage Dockerfile** — The monorepo build compiles each bounded context package into `node_modules` via npm workspaces. The builder stage handles the full `npm run build`. The runner stage copies `backend/build/`, `frontend/build/`, and the `node_modules` tree (workspaces keep production deps resolvable from the root). This is more involved than a single-package Dockerfile but fully standard for npm workspace monorepos. The existing `dotenvx ext prebuild` step can be dropped in the production Dockerfile since fly.io manages secrets natively.

**DATABASE_URL** — `connection.ts` currently reads four separate env vars. Adding `DATABASE_URL` parsing as a primary path (falling back to individual vars for local dev) is ~10 lines using Node's built-in `URL` class. `node-pg-migrate` already reads `DATABASE_URL` natively, so migrations also work without changes.

**Memory — use 1 GB, not 512 MB** — The backend accepts image uploads up to 50 MB as base64 JSON (`json({ limit: '50mb' })`). A 50 MB base64 payload decodes to ~37 MB, which the image processing pipeline then manipulates in memory (resize, mime-type detection). Combined with Node.js runtime overhead and background cron jobs, peak memory during a concurrent upload on a 512 MB machine is risky. `shared-cpu-1x` with **1 GB RAM** is recommended (~$5–6/month) and is still well within budget. If the 50 MB limit is lowered in the future, 512 MB becomes safe again.

**Scale-to-zero** — With `auto_stop_machines = "stop"` and `min_machines_running = 0`, the machine hibernates when idle. Cold starts on fly.io are typically 3–8 seconds. For a small friend group using a personal app, this is a non-issue. If it ever becomes annoying, setting `min_machines_running = 1` keeps one machine always warm for an extra ~$5/month.

---

## What Is fly.io?

fly.io is a platform that runs application containers (via Docker) as fast-launching VMs ("Machines") close to users across 16+ global regions. It is pay-as-you-go with no upfront costs. It handles networking, SSL, private VPCs, and has native add-on services for databases and object storage.

---

## Compute (Machines)

Machines are the VMs that run your app. Priced per hour while running.

| Machine Type    | RAM    | Price/month (approx.) |
| --------------- | ------ | --------------------- |
| shared-cpu-1x   | 256 MB | ~$2.02                |
| shared-cpu-1x   | 512 MB | ~$3–4                 |
| shared-cpu-2x   | 512 MB | ~$4–5                 |
| performance-1x  | 2 GB   | ~$32.19               |
| performance-16x | 128 GB | ~$1,013               |

- Stopped machines cost **$0.15/GB of root filesystem/month**
- **40% discount** available with yearly reservations

**Recommendation for this app:** Two machines minimum — one for the Node.js backend, one optionally for the React frontend (or serve the frontend as static files from the backend to save cost). `shared-cpu-1x` 512MB should be sufficient to start.

---

## Custom Domains & SSL

- Attach a custom domain with: `fly certs add yourdomain.com`
- **SSL/TLS certificates**: First 10 single-hostname certs are **free** (auto-provisioned via Let's Encrypt). Wildcard certs cost **$1/month**.
- **Dedicated IPv4**: **$2/month** — required for proper custom domain routing.
- Custom domains themselves have no additional fee.

**Bottom line:** Custom domain + SSL is effectively free (just the $2/mo IPv4 cost).

---

## PostgreSQL

Fly.io offers two paths for PostgreSQL:

### Option A: Unmanaged Fly Postgres (cheapest)

- Deployed as a regular fly.io Machine — you pay only for the machine + attached volume
- Estimated cost: **~$4–6/month** (shared-cpu-1x + 1–3 GB volume)
- fly.io provides: provisioning tooling, daily snapshots (5-day retention), metrics
- **You are responsible for**: upgrades, backups, outage recovery, tuning, scaling
- fly.io explicitly states: _"This is not a managed database. If Postgres crashes because it ran out of memory or disk space, you'll need to do a little work to get it back."_

### Option B: Managed Postgres (production-grade)

| Plan    | CPU            | RAM   | Monthly Cost |
| ------- | -------------- | ----- | ------------ |
| Basic   | Shared-2x      | 1 GB  | $38          |
| Starter | Shared-2x      | 2 GB  | $72          |
| Launch  | Performance-2x | 8 GB  | $282         |
| Scale   | Performance-4x | 32 GB | $962         |

- Storage: **$0.28/GB/month** (replicated across all cluster nodes), max 1 TB
- Includes: HA, automatic failover, backups, connection pooling, 24/7 support

**Recommendation:** For a self-funded personal project, unmanaged Fly Postgres is fine. Take manual backups and keep the machine monitored.

---

## Volumes (Persistent Local Disk)

- NVMe-based persistent storage attached to a single Machine in a single region
- **$0.15/GB/month**
- Snapshots: $0.08/GB/month (first 10 GB free)
- Max size: 500 GB

**Not suitable for user-uploaded media** (images, audio, video) because:

- One volume can only attach to one Machine at a time
- No replication, no CDN, no global distribution
- fly.io themselves recommend object storage for media

Primary use for volumes: attach one to the Postgres machine as the database data directory.

---

## Object Storage: Tigris (fly.io Native — Recommended)

Tigris is fly.io's native globally-distributed, S3-compatible object storage service. It is the **recommended replacement** for the current local `ImageStorageService`.

### Key Features

- **S3-compatible API** — works with any AWS SDK out of the box
- Supports **any file type**: images, audio, video, documents — no restrictions
- **Global replication** built-in — objects are stored near write location, replicated on demand; no separate CDN needed
- Public and private bucket support with presigned URLs
- Zero-downtime migration from S3, Cloudflare R2, GCS via "shadow buckets"
- Billed on your regular fly.io invoice

### Pricing

| Storage Tier      | Cost/GB/month |
| ----------------- | ------------- |
| Standard          | $0.02         |
| Infrequent Access | $0.01         |
| Archive           | $0.004        |

| Request Type                    | Cost              |
| ------------------------------- | ----------------- |
| Class A (PUT, COPY, POST, LIST) | $0.005 per 1,000  |
| Class B (GET, HEAD)             | $0.0005 per 1,000 |
| DELETE                          | Free              |

**Egress: $0 — zero egress fees for all transfers (regional, inter-region, outbound).**

### Free Tier (per month)

- 5 GB standard storage
- 10,000 Class A requests
- 100,000 Class B requests

### Calculator Tiers (from fly.io calculator)

| Tier   | Storage | Price        |
| ------ | ------- | ------------ |
| Small  | 5 GB    | **Free**     |
| Medium | 1 TB    | $20/month    |
| Large  | 100 TB  | $2,000/month |

---

## Networking / Egress

- Egress from fly.io Machines (not Tigris): **$0.02/GB** (North America & Europe), $0.04/GB (APAC/Oceania/South America), $0.12/GB (Africa/India)
- Private networking between Machines on the same fly.io org: **free**
- **Tigris egress is always free** regardless of region — a major advantage over serving files directly from a Machine

---

## What fly.io Provides Out of the Box

| Feature                             | Included?                       |
| ----------------------------------- | ------------------------------- |
| Docker-based deployment             | Yes                             |
| Custom domains                      | Yes (free)                      |
| Auto SSL/TLS (Let's Encrypt)        | Yes (first 10 free)             |
| Private networking between services | Yes (free)                      |
| Health checks                       | Yes                             |
| Auto-restart on crash               | Yes                             |
| Global anycast routing              | Yes                             |
| Metrics & basic monitoring          | Yes                             |
| CI/CD integration                   | Yes (via `flyctl` in pipelines) |
| Multiple regions/geo-distribution   | Yes (opt-in)                    |

---

## What You Need to Handle Outside fly.io

| Requirement                     | Solution                                                                    |
| ------------------------------- | --------------------------------------------------------------------------- |
| Domain registration             | External registrar (Namecheap, Cloudflare Registrar, etc.)                  |
| DNS management                  | Either your registrar's DNS or Cloudflare DNS (point A record to fly.io IP) |
| File storage for media          | **Tigris** (fly.io native) — replace `ImageStorageService`                  |
| Database backups (if unmanaged) | Manual or scripted via `flyctl` snapshots                                   |
| Email (transactional)           | External service (Resend, Postmark, SendGrid)                               |
| CDN (if not using Tigris)       | External (Cloudflare) — Tigris makes this unnecessary for media             |

---

## Recommended Architecture

```
[Custom Domain] ──DNS──> [fly.io anycast IP]
                                │
                    ┌───────────┴───────────┐
                    │     fly.io private    │
                    │       network         │
                    │                       │
            [Node.js Backend]      [Fly Postgres]
            (serves React SPA      (unmanaged,
             + REST/GraphQL API)    attached volume)
                    │
                    └──────> [Tigris Object Storage]
                              (images, audio, video)
                              S3-compatible, zero egress
```

- The React SPA can be built and served as static files directly from the Node.js backend (Express `static` middleware) to avoid needing a separate Machine for the frontend.
- All media (images now, audio/video later) goes through Tigris via the S3 SDK, replacing the local `ImageStorageService`.

---

## Estimated Minimum Monthly Cost

| Item                                                       | Cost              |
| ---------------------------------------------------------- | ----------------- |
| Backend Machine (shared-cpu-1x 512MB, serves frontend too) | ~$3–4             |
| Fly Postgres Machine + 3 GB Volume                         | ~$5–6             |
| Tigris file storage (within free 5 GB tier)                | $0                |
| Dedicated IPv4 (for custom domain)                         | $2                |
| SSL certificate                                            | $0 (free tier)    |
| **Total**                                                  | **~$10–12/month** |

Once storage exceeds 5 GB, add $0.02/GB/month. 100 GB of media = $2/month extra.

---

## Next Steps (Not Yet Researched)

---

## Database Strategy

### Decision: Unmanaged Fly Postgres

Managed Postgres starts at $38/month. Unmanaged Fly Postgres (a regular Machine + a Volume) costs ~$4–6/month. The trade-off is that you own operational concerns: upgrades, monitoring, and recovery if the machine crashes. For a self-funded personal project this is the right call.

**Setup command:**

```sh
fly postgres create \
  --name hatsuportal-db \
  --region arn \
  --initial-cluster-size 1 \
  --vm-size shared-cpu-1x \
  --volume-size 3
```

`--initial-cluster-size 1` = single-node, no HA replica. Cheapest option. Data lives on one NVMe Volume in the `arn` region.

---

### Backup Strategy: Two Layers

#### Layer 1 — fly.io Built-in Volume Snapshots (free, automatic)

Fly.io automatically takes a daily snapshot of every Volume and retains the last **5 days** of snapshots. This is included in the volume cost ($0.15/GB/month) with no extra charge for the first 10 GB of snapshot storage.

Restoring from a snapshot creates a whole new Fly Postgres app from the snapshot, then you reattach:

```sh
# List available snapshots
fly volumes snapshots list <volume-id>

# Restore into a new postgres app
fly postgres create --snapshot-id <snapshot-id> --name hatsuportal-db-restored --region arn

# Reattach the main app to the restored cluster
fly postgres detach hatsuportal-db --app hatsuportal
fly postgres attach hatsuportal-db-restored --app hatsuportal
```

**Limitation:** 5-day retention window only. If data corruption goes unnoticed for more than 5 days, the snapshot is gone. This is why a second backup layer is needed.

---

#### Layer 2 — Scheduled `pg_dump` to Tigris (cheap, long-retention)

A scheduled fly.io Machine runs `pg_dump` daily, compresses the output, and uploads it to the Tigris bucket. The machine runs for a few seconds, then exits and is destroyed. You only pay for the seconds of compute time — essentially free.

**The time-based trigger: `fly machine run --schedule`**

fly.io supports a `--schedule` flag on `fly machine run` that accepts `hourly`, `daily`, `weekly`, or `monthly`. The machine starts on that schedule, runs its command, exits, and is destroyed (`--rm`). No extra service, no always-on process.

**How it works:**

A small shell script in a Docker image (or inline command) does three things:

1. `pg_dump` the database via the internal `.internal` hostname (private network, no extra cost)
2. Gzip the dump
3. Upload to Tigris using the AWS CLI (Tigris is S3-compatible)

Example command structure:

```sh
fly machine run postgres:17-alpine \
  --schedule=daily \
  --rm \
  --region arn \
  --env DATABASE_URL="<internal-connection-string>" \
  --env AWS_ACCESS_KEY_ID="<tigris-key>" \
  --env AWS_SECRET_ACCESS_KEY="<tigris-secret>" \
  --env BUCKET="hatsuportal-media" \
  --command "sh -c 'pg_dump $DATABASE_URL | gzip | aws s3 cp - s3://$BUCKET/backups/$(date +%Y-%m-%d).sql.gz --endpoint-url https://t3.storage.dev'"
```

Secrets can be passed via `--file-secret` or set as fly secrets on the backup machine's app. The exact command is refined during implementation — this illustrates the approach.

**Backup storage cost on Tigris:**

A `pg_dump` of a small-to-medium Postgres database gzipped is typically 1–50 MB. Keeping 30 daily backups = 30–1,500 MB at most. At Tigris Infrequent Access tier ($0.01/GB/month), 1.5 GB of backups costs **~$0.015/month** — effectively zero.

**Retention:** Unlike the 5-day volume snapshot window, backups stored in Tigris can be kept indefinitely. A simple naming convention (`backups/YYYY-MM-DD.sql.gz`) makes restoring a specific date trivial.

**Restoring from a `pg_dump` backup:**

```sh
# Download from Tigris
aws s3 cp s3://hatsuportal-media/backups/2026-05-01.sql.gz ./restore.sql.gz --endpoint-url https://t3.storage.dev

# Decompress and restore
gunzip -c restore.sql.gz | psql <DATABASE_URL>
```

---

### Alternative: Internal Cron in the Backend

The backend already has an established cron infrastructure (`cron` package, `ProcessDomainEventsJob`, `CleanupOrphanImagesJob`, etc.). A `BackupDatabaseJob` could be added to this system instead of using a separate scheduled machine.

The backend would shell out to `pg_dump` and upload to Tigris via the S3 SDK.

| Approach                     | Pros                                                                      | Cons                                                                         |
| ---------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `fly machine run --schedule` | Independent of app uptime; uses tiny postgres image; no app changes       | Slightly more setup; credentials need wiring to the backup machine           |
| Internal backend cron        | Uses existing cron infrastructure; no new machine; S3 SDK already planned | Requires `pg_dump` in the backend container; backup fails if backend is down |

For a personal project, either works. The internal cron approach reuses what's already there. The scheduled machine approach is more resilient and keeps concerns separate.

---

### Summary: Total Database Cost

| Item                                        | Cost/month            |
| ------------------------------------------- | --------------------- |
| Fly Postgres Machine (shared-cpu-1x 512MB)  | ~$3–4                 |
| Volume 3 GB @ $0.15/GB                      | ~$0.45                |
| Volume snapshots (first 10 GB free)         | $0                    |
| `pg_dump` backups in Tigris (~1 GB IA tier) | ~$0.01                |
| Backup machine runtime (seconds/day)        | ~$0.00                |
| **Total**                                   | **~$3.50–4.50/month** |

---

## flyctl Deployment Plan

### Overview of the Deployment Process

1. Install `flyctl` CLI and run `fly auth login`
2. Run `fly launch` in the project root — generates `fly.toml` and optionally provisions a Postgres app
3. Set all required secrets with `fly secrets set`
4. Attach Postgres with `fly postgres attach`
5. Run `fly deploy` to build the Docker image and deploy

fly.io builds the app using the existing `Dockerfile` by default. No separate build service is needed.

---

### Current App Issues That Must Be Fixed Before Deployment

The existing Dockerfile and entrypoint are development-only. Several changes are required before the app is production-ready on fly.io.

#### 1. Backend runs HTTPS with self-signed certificates

`backend/src/server.ts` reads `./cert/server.key` and `./cert/server.cert` and creates an HTTPS server. **fly.io terminates TLS at its edge** and forwards plain HTTP to the app internally. The backend must be changed to listen on plain HTTP. The `https.createServer(...)` call must be replaced with `http.createServer(app)` (or just `app.listen(...)`). The self-signed cert files and `./cert/` directory become unnecessary.

#### 2. `entrypoint.sh` runs the dev watcher, not the production server

The current `entrypoint.sh` runs `npm run watch`, which starts `nodemon` and TypeScript compilation in watch mode. For production, the entrypoint must run `npm start` in the `backend` workspace, which executes `node build/server.js` against the already-compiled output. A separate production entrypoint script is needed.

#### 3. CORS origin is hardcoded to `http://localhost:3000`

`backend/src/app.ts` hardcodes the CORS allowed origin. In production, the frontend is served from the same origin as the backend (once static file serving is added), so CORS can be restricted to the production domain. The origin should be read from an env var (`CORS_ORIGIN` or `IDENTIFIER`).

#### 4. Frontend is not served by the backend

Currently the React frontend runs as a separate Vite dev server on port 3000. For production, the frontend must be built (`npm run build:frontend`) and its output served as static files by the Express backend. This avoids needing a second fly.io Machine for the frontend.

This requires adding an `express.static` call in `app.ts` pointing at the frontend build output directory, and updating the Vite build output path so Express can find it.

#### 5. Dockerfile needs a production entrypoint and multi-stage build

The current Dockerfile is a single-stage build that installs all dependencies (including devDependencies) and runs `npm run build`. For production:

- A **multi-stage Dockerfile** should be used: a `builder` stage that compiles everything, then a lean `runner` stage that copies only compiled output and production dependencies. This significantly reduces image size and attack surface.
- The `ENTRYPOINT` must call the production start command, not the dev watcher.

#### 6. Database connection uses individual env vars; migrations need updating

`connection.ts` reads `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_SCHEMA` separately. `fly postgres attach` injects a single `DATABASE_URL` secret instead. Two options:

- **Option A (preferred):** Update `connection.ts` to parse `DATABASE_URL` when present (and fall back to individual vars for local dev). `node-pg-migrate` also natively reads `DATABASE_URL`, so migrations work without changes to the migration script.
- **Option B:** Skip `fly postgres attach` and manually set the four individual env vars as fly secrets pointing at the Postgres internal hostname.

Option A is cleaner. The Fly Postgres internal hostname format is: `postgres://<user>:<password>@<pg-app-name>.internal:5432/<dbname>`.

---

### `fly.toml` Configuration

This is the configuration file fly.io expects at the project root. It does not exist yet — `fly launch` generates it, but here is the planned content:

```toml
app = "hatsuportal"
primary_region = "arn"  # Stockholm — closest to Finland

[build]
  dockerfile = "Dockerfile"

[deploy]
  # Runs before new machines are deployed. Has access to secrets but no volumes.
  # Requires DATABASE_URL (or individual DB vars) to be set as a secret.
  release_command = "node -e \"require('child_process').execSync('npm run db:migrate --workspace=backend', {stdio:'inherit'})\""

[env]
  NODE_ENV = "prod"
  PORT = "8080"

[http_service]
  internal_port = 8080        # backend must listen on this port
  force_https = true          # fly.io redirects HTTP → HTTPS at the edge
  auto_stop_machines = "stop" # stop machine when idle to save cost
  auto_start_machines = true  # restart on first incoming request
  min_machines_running = 0    # allow full scale-to-zero (cheapest)

  [http_service.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20

  [[http_service.checks]]
    grace_period = "15s"
    interval = "30s"
    method = "GET"
    timeout = "5s"
    path = "/ping"            # PingController already serves GET /ping → { ping: 'pong' }

[[vm]]
  size = "shared-cpu-1x"
  memory = "512mb"
```

**Region:** `arn` is Stockholm, the closest fly.io region to Finland. Alternatives: `fra` (Frankfurt), `ams` (Amsterdam).

**`auto_stop_machines = "stop"` and `min_machines_running = 0`:** This enables scale-to-zero — the machine stops when idle and restarts on the first request (cold start is a few seconds). This is the cheapest possible option for low-traffic apps. If cold starts are unacceptable, set `min_machines_running = 1` to keep one machine always running (~$3–4/month).

**`release_command`:** Runs database migrations before the new version of the app starts serving traffic. It runs in a temporary machine with access to all secrets. The exact command needs to be adapted once the `db:migrate` script is updated to work without `dotenv -e .env.dev` (since in production, env vars come from fly secrets directly).

---

### Secrets to Set

Secrets are set via `fly secrets set KEY=value` and are injected as environment variables at machine startup. They are encrypted at rest and never exposed via `fly secrets list` (only the key names are shown).

```sh
# Required — app will crash without these
fly secrets set JWT_SECRET="<strong-random-string>"
fly secrets set REFRESH_TOKEN_SECRET="<strong-random-string>"

# Database — set automatically by fly postgres attach if using DATABASE_URL approach
fly secrets set DATABASE_URL="postgres://user:password@hatsuportal-db.internal:5432/hatsuportal"

# OR individual vars if keeping the current connection.ts approach:
fly secrets set DATABASE_HOST="hatsuportal-db.internal"
fly secrets set DATABASE_USER="hatsuportal"
fly secrets set DATABASE_PASSWORD="<generated-by-fly-attach>"
fly secrets set DATABASE_SCHEMA="hatsuportal"

# Optional
fly secrets set API_KEY="<api-key-for-internal-use>"
fly secrets set IDENTIFIER="yourdomain.com"   # used in JWT issuer field

# Future — Tigris storage (added once TigrisStorageService is implemented)
fly secrets set AWS_ACCESS_KEY_ID="..."
fly secrets set AWS_SECRET_ACCESS_KEY="..."
fly secrets set BUCKET_NAME="hatsuportal-media"
```

---

### Postgres Setup

```sh
# Create a Fly Postgres app (unmanaged)
fly postgres create --name hatsuportal-db --region arn --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 3

# Attach it to the main app — injects DATABASE_URL secret automatically
fly postgres attach hatsuportal-db --app hatsuportal
```

The `--initial-cluster-size 1` flag creates a single-node (non-HA) Postgres instance — cheapest option, suitable for a personal project.

---

### Custom Domain Setup

```sh
# After deploying, allocate a dedicated IPv4 ($2/month)
fly ips allocate-v4 --app hatsuportal

# Add your custom domain (auto-provisions free Let's Encrypt cert)
fly certs add yourdomain.com
fly certs add www.yourdomain.com

# fly certs show yourdomain.com will display the A record IP to set at your registrar
```

Then at your domain registrar, create an `A` record pointing `yourdomain.com` to the IP returned by `fly ips list`.

---

### Tigris Object Storage Setup

```sh
# Create a Tigris bucket (automatically sets AWS_* env vars in the app)
fly storage create --name hatsuportal-media --app hatsuportal
```

This injects `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, and `BUCKET_NAME` as secrets automatically. The exact var names should be verified against the Tigris fly.io docs when implementing.

---

### Full Deployment Command Sequence (First Deploy)

```sh
# 1. Authenticate
fly auth login

# 2. Launch app (generates fly.toml, skips Postgres/Redis prompts if already planned)
fly launch --name hatsuportal --region arn --no-deploy

# 3. Create and attach Postgres
fly postgres create --name hatsuportal-db --region arn --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 3
fly postgres attach hatsuportal-db --app hatsuportal

# 4. Create Tigris bucket
fly storage create --name hatsuportal-media --app hatsuportal

# 5. Set remaining secrets
fly secrets set JWT_SECRET="..." REFRESH_TOKEN_SECRET="..." IDENTIFIER="yourdomain.com"

# 6. Deploy (builds Docker image, runs release_command for migrations, starts machine)
fly deploy

# 7. Set up custom domain
fly ips allocate-v4 --app hatsuportal
fly certs add yourdomain.com
```

---

### Summary of Code Changes Required Before Deployment

| File                                                           | Change needed                                                                           |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `backend/src/server.ts`                                        | Switch from HTTPS to HTTP; listen on `PORT` env var (default 8080)                      |
| `backend/src/app.ts`                                           | Make CORS origin configurable via env var; add `express.static` to serve built frontend |
| `backend/src/infrastructure/dataAccess/database/connection.ts` | Support `DATABASE_URL` env var (parse and use if present)                               |
| `entrypoint.sh`                                                | Create a production variant that runs `npm start --workspace=backend`                   |
| `Dockerfile`                                                   | Multi-stage build; use production entrypoint; remove cert dependencies                  |
| `backend/package.json`                                         | Update `db:migrate` script to work without `dotenv -e .env.dev`                         |
| `boundedContext/mediaManagement/.../ImageStorageService`       | Replace with `TigrisStorageService` (see Storage Service Design section)                |

---

## Storage Service Design: Replacing `ImageStorageService` with Tigris

### Current Architecture

The local filesystem storage is wired up in `backend/src/compositionRoot.ts` (`createServices()`):

```ts
const imageStorageService = new ImageStorageService()
const imageFileService = new ImageFileService(imageProcessingService, imageStorageService)
```

`ImageFileService` implements `IImageFileService` and delegates all storage operations to `IImageStorageService`. This is the correct seam — swapping the storage backend only requires a new implementation of `IImageStorageService` and changing the one line in `compositionRoot.ts`.

### What Needs to Change

#### 1. New class: `TigrisStorageService`

Location: `boundedContext/mediaManagement/src/infrastructure/services/TigrisStorageService.ts`

Implements the existing `IImageStorageService` interface using the AWS S3 SDK (Tigris is fully S3-compatible). No changes to the interface or any consumers.

S3 operation mapping:

| `IImageStorageService` method         | S3 operation                                                      |
| ------------------------------------- | ----------------------------------------------------------------- |
| `writeImageBufferToFile(buffer, key)` | `PutObjectCommand`                                                |
| `getImageFromFileSystem(key)`         | `GetObjectCommand` → stream → Buffer → base64 string              |
| `copyImage(sourceKey, destKey)`       | `CopyObjectCommand` (promotion copies staged → permanent; source deleted separately) |
| `deleteImageFromFileSystem(key)`      | `DeleteObjectCommand`                                             |

The `getImageFromFileSystem` method must still return a base64-encoded image string (matching the current interface contract), so the Tigris implementation downloads the object body and encodes it — the same as the local implementation does, just the source is the S3 bucket instead of disk.

Required environment variables:

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
BUCKET_NAME=
```

Credentials are obtained when you create a Tigris bucket via `flyctl storage create`.

#### 2. `OrphanImageCleaner` — also touches the filesystem directly

`backend/src/infrastructure/services/OrphanImageCleaner.ts` currently lists files in `imagesBasePath` on disk using `fs.readdir` + `fs.stat` and compares them against DB storage keys to find orphans.

With Tigris this needs to change because there is no local directory to read. Two options:

**Option A (preferred):** Add a `listAllStorageKeys(): Promise<string[]>` method to `IImageStorageService`. The local `ImageStorageService` implements it with `fs.readdir`; `TigrisStorageService` implements it with `ListObjectsV2Command`. `OrphanImageCleaner` calls this method instead of reading the directory directly.

**Option B:** Pass an `IObjectStorageLister` as a separate dependency to `OrphanImageCleaner`. More correct DDD-wise but adds a second interface just for one method.

Option A is simpler and keeps the interface cohesive.

#### 3. `compositionRoot.ts` — swap the implementation

```ts
// Before
const imageStorageService = new ImageStorageService()

// After (prod)
const imageStorageService = new TigrisStorageService()

// Or: environment-based selection
const imageStorageService = process.env.NODE_ENV === 'prod' ? new TigrisStorageService() : new ImageStorageService()
```

The `OrphanImageCleaner` is constructed later in `createCronJobs()` and currently receives `config.images.basePath` as a string. After Option A, it would instead receive the `imageStorageService` instance and call `listAllStorageKeys()` on it. The `imagesBasePath` argument can be removed from its constructor.

### Local Development Strategy

Keep using `ImageStorageService` (local filesystem) during development — it has no external dependencies and its test suite uses `memfs` (in-memory virtual filesystem). Switch to `TigrisStorageService` only in production via the environment-based selection above.

Alternatively, Tigris can be used locally too since Tigris has a free tier and `flyctl` can create a bucket for you. Both approaches are valid.

### Future Consideration: Return URLs Instead of Base64

The current `getImageFromFileSystem` interface method returns a base64-encoded image string. This means every image fetch causes the backend to:

1. Download the full file from Tigris
2. Base64-encode it
3. Transmit it to the client inside a JSON response

This works fine for images but becomes expensive for audio and video files. When audio/video support is added, this should be revisited in favour of returning a **presigned URL** from Tigris, letting the client fetch the media directly from Tigris (bypassing the backend entirely). This would require changing `IImageStorageService` and `IImageFileService` and their consumers, but Tigris's zero-egress-fee model makes direct client-to-Tigris access cost-free.
