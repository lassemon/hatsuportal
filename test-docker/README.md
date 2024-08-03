# Test Postgres for BC integration/system tests

Shared Postgres **17.5** on port **5433**, database `hatsuportal_test`. All three bounded contexts use this instance — run BC integration/system tests **sequentially**, not in parallel.

## Start (manual — no npm scripts)

```bash
docker compose -f test-docker/docker-compose.yml up -d
```

Wait until Postgres is ready, then run BC tests:

```bash
npm run test:integration -w @hatsuportal/post-management
npm run test:system -w @hatsuportal/post-management
```

## Fresh schema after migration changes

```bash
docker compose -f test-docker/docker-compose.yml down -v
docker compose -f test-docker/docker-compose.yml up -d
```

## Environment

```
TEST_DATABASE_URL=postgres://test:test@localhost:5433/hatsuportal_test
```

Vitest `setup.db.ts` uses `TEST_DATABASE_URL` and sets `DATABASE_URL` for Knex.

## What gets applied

`init-test.sh` runs `backend/migrations/*.sql` then `backend/seeds/*.sql` in filename order. Migrations are schema-only; reference data (system user) lives in seeds.

## Root orchestrators

```bash
npm run test:contexts:integration   # chains user → media → post sequentially
npm run test:contexts:system
```
