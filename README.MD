# Local testing

- install [Docker Desktop](https://docs.docker.com/desktop/)
- run `docker-compose up` in root folder
- NOTE: Starting the app can take some minutes, look for logs like "VITE v5.4.20 ready in xxx ms" for the frontend AND "App listening on port 8080" for the backend.
  **be patient.**
- after the docker is up, navigate to:
  - localhost:3000 for the UI
  - localhost/docs for the swagger documentation

# Development

- run `npm install` on the root
- run `npm run build` on the root
- open one shell and go to ./dev-db and run `docker-compose up`
- open a shell and run `npm run watch`

  you can also start backend and frontend separately with:
  - `npm run watch:backend`
  - `npm run watch:frontend`

# Running unit tests

- run all unit tests from root by `npm run test`
- run a single unit test from root by `npm run test -- --testNamePattern <pattern>`
- e.g. `npm run test -- --testNamePattern "can create user"`
- to run unit tests with coverage report, navigate to any npm workspace and run `npm run test -- --coverage`

# Database migrations

Migrations live in `backend/migrations/` and are managed with [node-pg-migrate](https://github.com/salsita/node-pg-migrate). Each migration is a plain `.sql` file prefixed with a Unix millisecond timestamp (e.g. `1775334940309_add_post_search_vector.sql`). The timestamp determines execution order and is generated automatically when creating migrations via the command below — do not write the filename by hand. Applied migrations are tracked in a `pgmigrations` table inside the database — already-applied migrations are always skipped automatically.

All migration commands are run from the **`backend`** workspace (or from root using `--workspace=backend`).

### Apply all pending migrations

```bash
npm run db:migrate:dev --workspace=backend
```

### Roll back the last migration

```bash
npm run db:migrate:down:dev --workspace=backend
```

### Preview what would run without touching the database

```bash
npm run db:migrate:dry-run --workspace=backend
```

### Mark all migrations as applied without running them

Use this after creating a fresh database from `dev-db/init.sql` (e.g. first time starting the dev Docker container). The schema is already up to date, so only the tracking table needs to be synced.

```bash
npm run db:migrate:fake --workspace=backend
```

### Adding a new migration

Use `node-pg-migrate create` to generate a correctly named file — this avoids warnings and ensures migrations run in the right order:

```bash
cd backend && npx node-pg-migrate create <short_description> -m migrations
```

For example: `npx node-pg-migrate create add_recipe_table -m migrations` produces a file like `1775334940309_add_recipe_table.sql`. Write idempotent SQL where possible (`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `CREATE OR REPLACE TRIGGER`, etc.), then apply it with `npm run db:migrate:dev`.

After adding schema changes to a migration, also update `dev-db/init.sql` to reflect the final schema state so fresh container boots remain up to date.

# Cleanup

- to delete the build folder and coverage reports run `npm run clean` on any workspace or root
- to run the aforementioned clean plus remove node_modules run `npm run reset` on any workspace or root.

# Local dev users credentials

- system:test
- test:test

# OPS — Deploy to fly.io

Production runs on [fly.io](https://fly.io) (app `hatsuportal`, region `arn`). Full first-time setup is documented in `docs/FlyIO_Implementation.md`. This section covers day-to-day deploy and the ops steps that are easy to miss.

## Prerequisites

- [flyctl](https://fly.io/docs/flyctl/install/) installed
- Access to the Fly org that owns `hatsuportal` (`fly auth login`, then `fly auth whoami`)
- Working tree that builds: `npm run build` and all tests pass `npm run test` locally before deploying if you changed code

## Day-to-day deploy

From the repo root:

```bash
fly deploy --app hatsuportal
```

This builds the Docker image, runs DB migrations via `release_command` in `fly.toml`, then starts/updates the app Machine.

Useful debug commands:

```bash
fly status --app hatsuportal
fly logs --app hatsuportal
fly secrets list --app hatsuportal
fly machines list --app hatsuportal
```

The app uses scale-to-zero (`min_machines_running = 0`). Machines may show as `stopped` when idle; the first request cold-starts them.
