# Fly.io Implementation Plan

> Companion to: `FlyIO_Study.md`
> Purpose: Step-by-step implementation checklist for deploying hatsuportal to fly.io with Tigris storage and a custom domain.

The plan is split into two sequential parts. **Part 1 must be fully complete before Part 2 begins.** Within each part, steps are ordered by dependency — a step should not be started until all steps it depends on are done.

---

## Part 1: Codebase Changes

### Group A — Backend Core

These changes make the backend production-capable. They are independent of each other and can be done in any order, but all must be complete before the Dockerfile is updated (Group C).

---

#### A1. Switch backend from HTTPS to HTTP

**Files:**

- `backend/src/server.ts`
- `frontend/vite.config.ts`

The backend currently creates an HTTPS server using self-signed certificate files. fly.io terminates TLS at its edge and forwards plain HTTP internally, so the backend must listen on plain HTTP. The Vite proxy must also be updated to match the new port and protocol, otherwise local development breaks after this change.

**`backend/src/server.ts` — before:**

```ts
import app from './app'
import swaggerUI from 'swagger-ui-express'
import fs from 'fs'
import https from 'https'

const HTTPS_PORT = '443'

const port = process.env.PORT || 443
const key = fs.readFileSync('./cert/server.key')
const cert = fs.readFileSync('./cert/server.cert')

;(async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Setting up swagger documentation to ${port === HTTPS_PORT ? 'https://localhost/docs' : `http://localhost:${port}/docs`}`)
    const swaggerDocument = require('../build/swagger.json')
    app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
  }

  const httpsServer = https.createServer({ key, cert }, app)
  httpsServer.listen(port, () => console.log(`App listening at ${port === HTTPS_PORT ? 'https://localhost' : `http://localhost:${port}`}`))
})()
```

**`backend/src/server.ts` — after:**

```ts
import app from './app'
import swaggerUI from 'swagger-ui-express'

const port = process.env.PORT || 8080

;(async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Setting up swagger documentation to http://localhost:${port}/docs`)
    const swaggerDocument = require('../build/swagger.json')
    app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
  }

  app.listen(port, () => console.log(`App listening on port ${port}`))
})()
```

The `./cert/` directory and its contents are now unused and can be deleted.

---

**`frontend/vite.config.ts` — before (proxy section):**

```ts
proxy: {
  '/api/v1': {
    target: 'https://localhost:443',
    changeOrigin: true,
    secure: false,
    headers: {
      credentials: 'include'
    }
  }
}
```

**`frontend/vite.config.ts` — after (proxy section):**

```ts
proxy: {
  '/api/v1': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

`secure: false` and the `headers` block are removed — they were only needed to bypass the self-signed HTTPS cert.

---

#### A2. Remove CORS and add frontend static file serving

**File:** `backend/src/app.ts`

**Depends on:** A1

**Why CORS can be removed entirely:** The frontend `HttpClient` uses a relative `API_ROOT = '/api/v1'`. In dev, the browser sends requests to `http://localhost:3000/api/v1/...` and Vite's proxy silently forwards them to the backend — the browser never sees a cross-origin request. In production, frontend and backend share the same origin, so CORS is never triggered in either environment. The existing `cors()` call is already redundant and can be deleted.

**`backend/src/app.ts` — before:**

```ts
import 'reflect-metadata'
import express, { json, urlencoded } from 'express'
import cors from 'cors'

import { init } from './compositionRoot'
const tsyringeContainer = init()
import { RegisterRoutes } from './routes'
import cookieParser from 'cookie-parser'
import { createErrorMiddleware } from './infrastructure/middlewares/errorMiddleware'
import { IAuthentication } from './infrastructure/auth/IAuthentication'
import { initializeCronJobs } from './cronJobs'
import { ICronJob, IHttpErrorMapper } from '@hatsuportal/platform'

const app = express()

app.use(urlencoded({ extended: true }))
app.use(json({ limit: '50mb' }))
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)
app.use(cookieParser())
app.use(tsyringeContainer.resolve<IAuthentication>('IAuthentication').initialize())

initializeCronJobs(tsyringeContainer.resolveAll<ICronJob>('ICronJob'))

RegisterRoutes(app)

app.use(createErrorMiddleware(tsyringeContainer.resolve<IHttpErrorMapper>('IHttpErrorMapper')))

export default app
```

**`backend/src/app.ts` — after:**

```ts
import 'reflect-metadata'
import express, { json, urlencoded } from 'express'
import path from 'path'

import { init } from './compositionRoot'
const tsyringeContainer = init()
import { RegisterRoutes } from './routes'
import cookieParser from 'cookie-parser'
import { createErrorMiddleware } from './infrastructure/middlewares/errorMiddleware'
import { IAuthentication } from './infrastructure/auth/IAuthentication'
import { initializeCronJobs } from './cronJobs'
import { ICronJob, IHttpErrorMapper } from '@hatsuportal/platform'

const app = express()

app.use(urlencoded({ extended: true }))
app.use(json({ limit: '50mb' }))
app.use(cookieParser())
app.use(tsyringeContainer.resolve<IAuthentication>('IAuthentication').initialize())

// Serve compiled React SPA — __dirname is backend/build/ at runtime, so ../../frontend/build resolves to frontend/build/
app.use(express.static(path.join(__dirname, '../../frontend/build')))

initializeCronJobs(tsyringeContainer.resolveAll<ICronJob>('ICronJob'))

RegisterRoutes(app)

// Catch-all: return the SPA shell for any route not handled by the API.
// Must be after RegisterRoutes so API routes take priority.
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'))
})

app.use(createErrorMiddleware(tsyringeContainer.resolve<IHttpErrorMapper>('IHttpErrorMapper')))

export default app
```

The `cors` import and its `app.use(cors(...))` call are removed entirely. The `path` import is added. `express.static` is placed before `RegisterRoutes` so static assets are served without route overhead. The catch-all `GET *` is placed after `RegisterRoutes` so API routes always take priority.

---

#### A3. Support `DATABASE_URL` in the database connection

**File:** `backend/src/infrastructure/dataAccess/database/connection.ts`

**Depends on:** nothing — standalone change

`fly postgres attach` injects a single `DATABASE_URL` secret. The current code reads four separate env vars. When `DATABASE_URL` is present it takes priority; otherwise the existing individual vars are used, preserving local dev behaviour unchanged.

**`connection.ts` — before (the `build()` method inside the `Connection` class):**

```ts
private static build(): Knex {
  const connectionOptions = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'development',
    password: process.env.DATABASE_PASSWORD || 'development123',
    database: process.env.DATABASE_SCHEMA || 'hatsuportal'
  }
  const knexConnection = knex({
    client: 'postgres',
    debug: process.env.LOG_LEVEL === 'TRACE',
    connection: connectionOptions,
    pool: { min: 2, max: 10 },
    ...knexSnakeCaseMappers()
  })

  return knexConnection
}
```

**`connection.ts` — after:**

```ts
private static buildConnectionOptions() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL)
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1) // strip leading /
    }
  }
  return {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'development',
    password: process.env.DATABASE_PASSWORD || 'development123',
    database: process.env.DATABASE_SCHEMA || 'hatsuportal'
  }
}

private static build(): Knex {
  const knexConnection = knex({
    client: 'postgres',
    debug: process.env.LOG_LEVEL === 'TRACE',
    connection: Connection.buildConnectionOptions(),
    pool: { min: 2, max: 10 },
    ...knexSnakeCaseMappers()
  })

  return knexConnection
}
```

---

#### A4. Fix the `db:migrate` script and move `node-pg-migrate` to production dependencies

**File:** `backend/package.json`

**Depends on:** A3

Two changes are required:

**1. Move `node-pg-migrate` from `devDependencies` to `dependencies`.**

`node-pg-migrate` is currently under `devDependencies`. The fly.io `release_command` runs in the production image after `npm prune --production` has removed all dev deps — meaning `node-pg-migrate` would not be available. It must be a production dependency.

```json
// before — in devDependencies:
"devDependencies": {
  "node-pg-migrate": "^8.0.4",
  ...
}

// after — move to dependencies:
"dependencies": {
  "node-pg-migrate": "^8.0.4",
  ...
}
```

**2. Split the migrate script into a production script and a dev script.**

The current `db:migrate` script uses `dotenv -e .env.dev` which loads the local env file. In production, env vars are injected directly by fly.io secrets — there is no `.env.dev` file. Rename the current script to `db:migrate:dev` and add a plain `db:migrate` for production.

```json
// before:
"scripts": {
  "db:migrate": "dotenv -e .env.dev -- node-pg-migrate up -m migrations",
  "db:migrate:down": "dotenv -e .env.dev -- node-pg-migrate down -m migrations",
  ...
}

// after:
"scripts": {
  "db:migrate": "node-pg-migrate up -m migrations",
  "db:migrate:dev": "dotenv -e .env.dev -- node-pg-migrate up -m migrations",
  "db:migrate:down": "node-pg-migrate down -m migrations",
  "db:migrate:down:dev": "dotenv -e .env.dev -- node-pg-migrate down -m migrations",
  ...
}
```

Use `npm run db:migrate:dev --workspace=backend` for local development going forward.

---

#### A5. Create the initial schema migration

**File:** `backend/migrations/0000000000000_initial_schema.sql` _(new file)_

**Depends on:** nothing — standalone

There is currently only one migration file (`1775334940309_add_post_search_vector.sql`), which runs `ALTER TABLE posts ADD COLUMN search_vector`. On a fresh production database this migration fails immediately — `posts` does not exist yet. The `dev-db/init.sql` Docker init script is the source of truth for the full schema but is not a migration file; it also contains test-data INSERT statements that must not reach production.

The fix: create a migration that covers the entire initial schema. `node-pg-migrate` sorts migration files by their numeric prefix, so `0000000000000` runs first unconditionally. All DDL in the subsequent search-vector migration uses `ADD COLUMN IF NOT EXISTS` and `CREATE OR REPLACE`, so it becomes a harmless no-op on a fresh install.

**Create `backend/migrations/0000000000000_initial_schema.sql`** — copy from `dev-db/init.sql`, removing every `INSERT INTO` block:

```sql
DO $$ BEGIN
  CREATE TYPE post_type AS ENUM ('story', 'recipe', 'guide');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE image_role AS ENUM ('cover', 'recipe_step', 'thumbnail', 'profile_picture');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    password      VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    active        BOOLEAN NOT NULL,
    roles         JSONB NOT NULL,
    created_at    BIGINT NOT NULL,
    updated_at    BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS index_users_name ON users (name);

CREATE TABLE IF NOT EXISTS posts (
  id               UUID PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  visibility       VARCHAR(255) NOT NULL,
  post_type        post_type NOT NULL,
  created_by_id    UUID NOT NULL,
  search_vector    tsvector,
  created_at       BIGINT NOT NULL,
  updated_at       BIGINT NOT NULL,
  CONSTRAINT fk_posts_created_by
      FOREIGN KEY (created_by_id) REFERENCES users(id)
      ON DELETE RESTRICT,
  CONSTRAINT chk_posts_time_order
      CHECK (updated_at >= created_at)
);

CREATE INDEX IF NOT EXISTS index_posts_post_type ON posts (post_type);
CREATE INDEX IF NOT EXISTS index_posts_visibility ON posts (visibility);
CREATE INDEX IF NOT EXISTS index_posts_search_vector ON posts USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS index_posts_stories_only ON posts (id) WHERE post_type = 'story';
CREATE INDEX IF NOT EXISTS index_posts_created_by_id ON posts (created_by_id);
CREATE INDEX IF NOT EXISTS index_posts_updated ON posts (updated_at);

CREATE TABLE IF NOT EXISTS stories (
  id              UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  body            TEXT
);

CREATE OR REPLACE FUNCTION update_story_search_vector()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_title VARCHAR(255);
BEGIN
  SELECT title INTO v_title FROM posts WHERE id = NEW.id;
  UPDATE posts
  SET search_vector = setweight(to_tsvector('english', COALESCE(v_title, '')), 'A')
                   || setweight(to_tsvector('english', COALESCE(NEW.body, '')), 'B')
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_story_update_search_vector
AFTER INSERT OR UPDATE ON stories
FOR EACH ROW EXECUTE FUNCTION update_story_search_vector();

CREATE OR REPLACE FUNCTION update_post_title_search_vector()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_body TEXT;
BEGIN
  IF NEW.post_type = 'story' THEN
    SELECT body INTO v_body FROM stories WHERE id = NEW.id;
    NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A')
                      || setweight(to_tsvector('english', COALESCE(v_body, '')), 'B');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_post_title_update_search_vector
BEFORE UPDATE OF title ON posts
FOR EACH ROW EXECUTE FUNCTION update_post_title_search_vector();

CREATE TABLE IF NOT EXISTS images (
    id                   UUID PRIMARY KEY,
    created_by_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at           BIGINT NOT NULL,
    current_version_id   UUID
);

CREATE TABLE IF NOT EXISTS image_versions (
    id              UUID PRIMARY KEY,
    image_id        UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    storage_key     TEXT NOT NULL UNIQUE,
    mime_type       VARCHAR(255) NOT NULL,
    size            BIGINT NOT NULL,
    is_current      BOOLEAN NOT NULL DEFAULT FALSE,
    is_staged       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS index_image_versions_image_id ON image_versions(image_id);

CREATE UNIQUE INDEX IF NOT EXISTS unique_index_image_current_version
  ON image_versions(image_id)
  WHERE is_current;

DO $$
BEGIN
  ALTER TABLE image_versions
    ADD CONSTRAINT check_version_flags CHECK (NOT (is_current AND is_staged));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE image_versions
    ADD CONSTRAINT unique_image_versions_pair UNIQUE (image_id, id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE images
    ADD CONSTRAINT fk_images_current_version_pair
    FOREIGN KEY (id, current_version_id)
    REFERENCES image_versions (image_id, id)
    ON DELETE SET NULL (current_version_id)
    DEFERRABLE INITIALLY DEFERRED;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS post_image_links (
    post_id           UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    role              image_role NOT NULL,
    image_id          UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    created_at        BIGINT NOT NULL,
    PRIMARY KEY (post_id, image_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_one_cover_per_post ON post_image_links (post_id)
WHERE role = 'cover';

CREATE INDEX IF NOT EXISTS index_post_image_links_post_id_role
  ON post_image_links (post_id, role);

CREATE TABLE IF NOT EXISTS tags (
    id              UUID PRIMARY KEY,
    slug            CITEXT NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    created_by_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      BIGINT NOT NULL,
    updated_at      BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS post_tag_links (
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at      BIGINT NOT NULL,
    PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS index_post_tag_links_tag_id ON post_tag_links (tag_id);

CREATE TABLE IF NOT EXISTS comments (
  id                    UUID PRIMARY KEY,
  post_id               UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body                  TEXT NOT NULL,
  parent_comment_id     UUID NULL,
  is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            BIGINT NOT NULL,
  updated_at            BIGINT NOT NULL,
  CONSTRAINT fk_comments_parent
      FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
);

CREATE INDEX IF NOT EXISTS index_comments_post_created ON comments (post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS index_comments_parent_created ON comments (parent_comment_id, created_at DESC);

CREATE OR REPLACE FUNCTION enforce_same_post_for_replies()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.parent_comment_id IS NOT NULL THEN
    PERFORM 1
    FROM comments p
    WHERE p.id = NEW.parent_comment_id
      AND p.post_id = NEW.post_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Parent comment must belong to the same post';
    END IF;
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trigger_comments_same_post ON comments;
CREATE TRIGGER trigger_comments_same_post
BEFORE INSERT OR UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION enforce_same_post_for_replies();

CREATE OR REPLACE VIEW story_enriched_read_view AS
SELECT
    stories.id                    AS id,
    posts.title                   AS title,
    posts.visibility              AS visibility,
    stories.body                  AS body,
    posts.created_by_id           AS created_by_id,
    users.name                    AS created_by_name,
    post_image_links.image_id     AS cover_image_id,
    array_remove(
        array_agg(DISTINCT post_tag_links.tag_id ORDER BY post_tag_links.tag_id),
        NULL
    )                             AS tag_ids,
    posts.created_at              AS created_at,
    posts.updated_at              AS updated_at
FROM stories
INNER JOIN posts
  ON posts.id = stories.id
  AND posts.post_type = 'story'
INNER JOIN users
  ON users.id = posts.created_by_id
LEFT JOIN post_image_links
  ON post_image_links.post_id = posts.id
  AND post_image_links.role = 'cover'
LEFT JOIN post_tag_links
  ON post_tag_links.post_id = posts.id
GROUP BY
    stories.id,
    posts.title,
    posts.visibility,
    stories.body,
    posts.created_by_id,
    users.name,
    post_image_links.image_id,
    posts.created_at,
    posts.updated_at;

CREATE TABLE IF NOT EXISTS domain_event_outbox (
    id                    UUID PRIMARY KEY,
    event_type            VARCHAR(255) NOT NULL,
    serialized_event_data TEXT NOT NULL,
    occurred_on           BIGINT NOT NULL,
    published_on          BIGINT
);

CREATE INDEX IF NOT EXISTS index_domain_event_outbox_unpublished
  ON domain_event_outbox (occurred_on)
  WHERE published_on IS NULL;
```

**Note on local dev:** If you already have a local database populated by the Docker `init.sql`, running `db:migrate:dev` after adding this file will attempt to re-create the schema. All statements use `IF NOT EXISTS` or `CREATE OR REPLACE`, so it will succeed without modifying existing data.

---

#### A5a. Unify the dev Docker setup with the migrations folder

**Files:**

- `dev-db/seed.sql` _(new file)_
- `dev-db/init-dev.sh` _(new file)_
- `dev-db/docker-compose.yml` _(update)_
- `dev-db/init.sql` _(delete)_

**Depends on:** A5

`dev-db/init.sql` is now a second copy of the schema that will silently diverge from `backend/migrations/` every time a new migration is added. Replace it with a shell script that runs all migrations then seeds dev data. Going forward, adding a file to `backend/migrations/` is all that's needed — the dev Docker setup picks it up automatically.

**Step 1 — Create `dev-db/seed.sql`** (extract every INSERT/UPDATE from the old `init.sql`, no DDL):

```sql
INSERT INTO
  users (id, name, password, email, active, roles, created_at, updated_at)
VALUES
  (
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'system',
    '$2a$10$lZzKUHY5zCIbCcfKmv2RaOH412mNfemffeQUBKpGqsWOrsZZGsJmO',
    'admin@admin.com',
    TRUE,
    '["super_admin","admin","creator"]'::jsonb,
    1707508500,
    1707511589
  ),
  (
    '5c66958c-a703-46d3-bab5-18d2eea1884d',
    'test',
    '$2a$10$lZzKUHY5zCIbCcfKmv2RaOH412mNfemffeQUBKpGqsWOrsZZGsJmO',
    'test@example.com',
    TRUE,
    '["admin","creator"]'::jsonb,
    1707508500,
    1707511589
  );

INSERT INTO
  posts (id, title, visibility, post_type, created_by_id, created_at, updated_at)
VALUES
  ('252a58d0-d2d3-4f08-9b1e-59322b5900ec', 'Default Story',            'public',     'story', 'a979c61f-9780-4a98-83ce-c933490c925f', 1707508500, 1707511590),
  ('252a58d0-d2d3-4f08-9b2e-59322b5900ec', 'Private Story',            'private',    'story', 'a979c61f-9780-4a98-83ce-c933490c925f', 1707508501, 1707511591),
  ('252a58d0-d2d3-4f08-9b3e-59322b5900ec', 'Logged In Story',          'logged_in',  'story', 'a979c61f-9780-4a98-83ce-c933490c925f', 1707508502, 1707511592),
  ('252a58d0-d2d3-4f08-9b4e-59322b5900ec', 'Story With Image',         'public',     'story', 'a979c61f-9780-4a98-83ce-c933490c925f', 1707508503, 1707511593),
  ('252a58d0-d2d3-4f08-9b5e-59322b5900ec', 'Test Users Public Story',  'public',     'story', '5c66958c-a703-46d3-bab5-18d2eea1884d', 1707508500, 1707511590),
  ('252a58d0-d2d3-4f08-9b6e-59322b5900ec', 'Test Users Private Story', 'private',    'story', '5c66958c-a703-46d3-bab5-18d2eea1884d', 1707508501, 1707511591),
  ('252a58d0-d2d3-4f08-9b7e-59322b5900ec', 'Test Users Logged In Story','logged_in', 'story', '5c66958c-a703-46d3-bab5-18d2eea1884d', 1707508502, 1707511592);

INSERT INTO
  stories (id, body)
VALUES
  ('252a58d0-d2d3-4f08-9b1e-59322b5900ec', 'Default story description'),
  ('252a58d0-d2d3-4f08-9b2e-59322b5900ec', 'This is an story visible only to its creator'),
  ('252a58d0-d2d3-4f08-9b3e-59322b5900ec', 'This story is only visible if youre logged in'),
  ('252a58d0-d2d3-4f08-9b4e-59322b5900ec', 'This story has an image attached to it'),
  ('252a58d0-d2d3-4f08-9b5e-59322b5900ec', 'This is an story created by the Test User that is visible to all'),
  ('252a58d0-d2d3-4f08-9b6e-59322b5900ec', 'This is an story visible only to its creator'),
  ('252a58d0-d2d3-4f08-9b7e-59322b5900ec', 'This story is only visible if youre logged in');

INSERT INTO
  images (id, created_by_id, created_at)
VALUES
  ('66403c46-97db-45ba-a646-5e10f229f490', 'a979c61f-9780-4a98-83ce-c933490c925f', 1707499636)
ON CONFLICT (id) DO NOTHING;

INSERT INTO
  image_versions (id, image_id, storage_key, mime_type, size, is_current, is_staged, created_at)
VALUES
  (
    '77403c46-97db-45ba-a646-5e10f229f490',
    '66403c46-97db-45ba-a646-5e10f229f490',
    'story_cover_66403c46-97db-45ba-a646-5e10f229f490_77403c46-97db-45ba-a646-5e10f229f490_a979c61f-9780-4a98-83ce-c933490c925f.png',
    'image/png',
    1537565,
    TRUE,
    FALSE,
    1707506272
  )
ON CONFLICT (id) DO NOTHING;

UPDATE images
SET current_version_id = '77403c46-97db-45ba-a646-5e10f229f490'
WHERE id = '66403c46-97db-45ba-a646-5e10f229f490';

INSERT INTO
  post_image_links (post_id, role, image_id, created_at)
VALUES
  ('252a58d0-d2d3-4f08-9b4e-59322b5900ec', 'cover', '66403c46-97db-45ba-a646-5e10f229f490', 1707499636);

INSERT INTO
  tags (id, slug, name, created_by_id, created_at, updated_at)
VALUES
  ('421a58d0-d2d3-4f08-9b1e-59322b5900ec', 'recipe',              'Recipe',              'a979c61f-9780-4a98-83ce-c933490c925f', 1707499636, 1707499736),
  ('421a58d0-d2d3-4f08-9b2e-59322b5900ec', 'diary',               'Diary',               'a979c61f-9780-4a98-83ce-c933490c925f', 1707499636, 1707499736),
  ('421a58d0-d2d3-4f08-9b3e-59322b5900ec', 'chicken-recipe',      'Chicken Recipe',      'a979c61f-9780-4a98-83ce-c933490c925f', 1707499636, 1707499736),
  ('421a58d0-d2d3-4f08-9b4e-59322b5900ec', 'no-bullshit-recipe',  'No Bullshit Recipe',  'a979c61f-9780-4a98-83ce-c933490c925f', 1707499636, 1707499736),
  ('421a58d0-d2d3-4f08-9b5e-59322b5900ec', 'fine-dine-bullshit',  'Fine Dine Bullshit',  'a979c61f-9780-4a98-83ce-c933490c925f', 1707499636, 1707499736);

INSERT INTO
  post_tag_links (post_id, tag_id, created_at)
VALUES
  ('252a58d0-d2d3-4f08-9b4e-59322b5900ec', '421a58d0-d2d3-4f08-9b2e-59322b5900ec', 1707499636),
  ('252a58d0-d2d3-4f08-9b4e-59322b5900ec', '421a58d0-d2d3-4f08-9b1e-59322b5900ec', 1707499636),
  ('252a58d0-d2d3-4f08-9b4e-59322b5900ec', '421a58d0-d2d3-4f08-9b3e-59322b5900ec', 1707499636);

INSERT INTO
  comments (id, post_id, author_id, body, parent_comment_id, created_at, updated_at)
VALUES
  ('123e4567-e89b-12d3-a456-426614174000', '252a58d0-d2d3-4f08-9b4e-59322b5900ec', 'a979c61f-9780-4a98-83ce-c933490c925f', 'This is a test comment',   NULL,                                        1707499636, 1707499736),
  ('123e4567-e89b-12d3-a456-426614174001', '252a58d0-d2d3-4f08-9b4e-59322b5900ec', 'a979c61f-9780-4a98-83ce-c933490c925f', 'This is a test reply',    '123e4567-e89b-12d3-a456-426614174000', 1707499637, 1707499736),
  ('123e4567-e89b-12d3-a456-426614174002', '252a58d0-d2d3-4f08-9b4e-59322b5900ec', 'a979c61f-9780-4a98-83ce-c933490c925f', 'This is a test reply #2', '123e4567-e89b-12d3-a456-426614174000', 1707499638, 1707499736),
  ('123e4567-e89b-12d3-a456-426614174003', '252a58d0-d2d3-4f08-9b4e-59322b5900ec', 'a979c61f-9780-4a98-83ce-c933490c925f', 'This is a test reply #3', '123e4567-e89b-12d3-a456-426614174000', 1707499639, 1707499736),
  ('123e4567-e89b-12d3-a456-426614174004', '252a58d0-d2d3-4f08-9b4e-59322b5900ec', 'a979c61f-9780-4a98-83ce-c933490c925f', 'This is a test reply #4', '123e4567-e89b-12d3-a456-426614174000', 1707499640, 1707499736),
  ('123e4567-e89b-12d3-a456-426614174005', '252a58d0-d2d3-4f08-9b4e-59322b5900ec', 'a979c61f-9780-4a98-83ce-c933490c925f', 'This is a test reply #5', '123e4567-e89b-12d3-a456-426614174000', 1707499641, 1707499736);
```

**Step 2 — Create `dev-db/init-dev.sh`:**

```sh
#!/bin/bash
set -e

for sql_file in /migrations/*.sql; do
  echo "Applying migration: $(basename "$sql_file")"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$sql_file"
done

echo "Seeding development data..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /seed.sql
```

Make it executable:

```sh
chmod +x dev-db/init-dev.sh
```

The postgres Docker image only executes `.sh` files in `docker-entrypoint-initdb.d` if they have the execute bit set. The glob `/migrations/*.sql` expands in lexicographic order, so migration files run in the same order as `node-pg-migrate` would use them.

**Step 3 — Update `dev-db/docker-compose.yml`:**

```yaml
# before:
volumes:
  - hatsuportal_data:/var/lib/postgresql/data
  - ./init.sql:/docker-entrypoint-initdb.d/init.sql

# after:
volumes:
  - hatsuportal_data:/var/lib/postgresql/data
  - ../backend/migrations:/migrations:ro
  - ./seed.sql:/seed.sql:ro
  - ./init-dev.sh:/docker-entrypoint-initdb.d/init-dev.sh
```

**Step 4 — Delete `dev-db/init.sql`.**

**Step 5 — Recreate the dev database** (the `docker-entrypoint-initdb.d` scripts only run on first init with an empty volume):

```sh
docker compose -f dev-db/docker-compose.yml down -v
docker compose -f dev-db/docker-compose.yml up -d
```

After this, the only places the schema is defined are the files in `backend/migrations/`. When you add a new migration, the dev Docker setup picks it up automatically on next volume reset.

---

### Group B — Storage Service

These changes replace local filesystem image storage with Tigris. The steps are strictly ordered — each one depends on the previous.

---

#### B1. Add `listAllStorageKeys()` to `IImageStorageService`

**File:** `boundedContext/mediaManagement/src/application/services/IImageStorageService.ts`

**Depends on:** nothing — first step in this chain

`OrphanImageCleaner` (step B4) needs to list all objects in storage to find orphans. This method is added to the interface so both the local filesystem implementation and the Tigris implementation satisfy it.

**Before:**

```ts
import { NonEmptyString } from '@hatsuportal/shared-kernel'

export interface IImageStorageService {
  writeImageBufferToFile(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<void>
  getImageFromFileSystem(storageKey: NonEmptyString): Promise<string>
  copyImage(sourceStorageKey: NonEmptyString, destinationStorageKey: NonEmptyString): Promise<void>
  deleteImageFromFileSystem(storageKey: NonEmptyString): Promise<void>
}
```

**After:**

```ts
import { NonEmptyString } from '@hatsuportal/shared-kernel'

export type StorageKeyEntry = {
  key: string
  lastModified: Date
}

export interface IImageStorageService {
  writeImageBufferToFile(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<void>
  getImageFromFileSystem(storageKey: NonEmptyString): Promise<string>
  copyImage(sourceStorageKey: NonEmptyString, destinationStorageKey: NonEmptyString): Promise<void>
  deleteImageFromFileSystem(storageKey: NonEmptyString): Promise<void>
  listAllStorageKeys(): Promise<StorageKeyEntry[]>
}
```

Also export `StorageKeyEntry` from the package index (`boundedContext/mediaManagement/src/index.ts`) so the backend can import it:

```ts
export { StorageKeyEntry } from './application/services/IImageStorageService'
```

---

#### B2. Implement `listAllStorageKeys()` in `ImageStorageService`

**File:** `boundedContext/mediaManagement/src/infrastructure/services/ImageStorageService.ts`

**Depends on:** B1

Add the method to the existing class. The implementation reads the local image directory and returns all filenames. The existing `imagesBasePath` module-level constant is already available.

Import `StorageKeyEntry` at the top of the file alongside `IImageStorageService`:

```ts
import { IImageStorageService, StorageKeyEntry } from '../../application/services/IImageStorageService'
```

**Add this method to the `ImageStorageService` class:**

```ts
async listAllStorageKeys(): Promise<StorageKeyEntry[]> {
  try {
    const entries = await fs.readdir(imagesBasePath)
    const results: StorageKeyEntry[] = []
    for (const entry of entries) {
      const stat = await fs.stat(path.join(imagesBasePath, entry))
      if (stat.isFile()) results.push({ key: entry, lastModified: stat.mtime })
    }
    return results
  } catch (error) {
    throw new DataPersistenceError({ message: 'Error listing files from the filesystem', cause: error })
  }
}
```

Also add a test case to `ImageStorageService.test.ts` covering this method, using the existing `vol` / `memfs` setup already in the test file.

---

#### B3. Create `TigrisStorageService`

**File:** `boundedContext/mediaManagement/src/infrastructure/services/TigrisStorageService.ts` _(new file)_

**Depends on:** B1

**First, install the AWS S3 SDK:**

```sh
npm install @aws-sdk/client-s3 --workspace=@hatsuportal/media-management
```

Then create the file. The Tigris endpoint is S3-compatible, so the standard `@aws-sdk/client-s3` package works without modification.

```ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import { IImageStorageService, StorageKeyEntry } from '../../application/services/IImageStorageService'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { BASE64_PNG_PREFIX, DataPersistenceError, NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('TigrisStorageService')

export class TigrisStorageService implements IImageStorageService {
  private readonly client: S3Client
  private readonly bucket: string

  constructor() {
    this.bucket = process.env.BUCKET_NAME || ''
    this.client = new S3Client({
      endpoint: process.env.AWS_ENDPOINT_URL_S3 || 'https://t3.storage.dev',
      region: process.env.AWS_REGION || 'auto',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    })
  }

  async writeImageBufferToFile(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<void> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: storageKey.value,
          Body: imageBuffer
        })
      )
    } catch (error) {
      throw new DataPersistenceError({ message: `Error uploading ${storageKey} to Tigris`, cause: error })
    }
  }

  async getImageFromFileSystem(storageKey: NonEmptyString): Promise<string> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: storageKey.value
        })
      )
      const buffer = Buffer.from(await streamToBuffer(response.Body as Readable))
      let imageBase64 = buffer.toString('base64')
      if (!imageBase64.startsWith(BASE64_PNG_PREFIX)) imageBase64 = `${BASE64_PNG_PREFIX},${imageBase64}`
      return imageBase64
    } catch (error: unknown) {
      if (isS3NotFound(error)) {
        throw new NotFoundError({ message: `Object ${storageKey} not found in Tigris`, cause: error })
      }
      throw new DataPersistenceError({ message: `Error downloading ${storageKey} from Tigris`, cause: error })
    }
  }

  async copyImage(sourceStorageKey: NonEmptyString, destinationStorageKey: NonEmptyString): Promise<void> {
    try {
      await this.client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${sourceStorageKey.value}`,
          Key: destinationStorageKey.value
        })
      )
    } catch (error) {
      throw new DataPersistenceError({
        message: `Error copying ${sourceStorageKey} to ${destinationStorageKey} in Tigris`,
        cause: error
      })
    }
  }

  async deleteImageFromFileSystem(storageKey: NonEmptyString): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: storageKey.value
        })
      )
      logger.debug('Object removed from Tigris', storageKey.value)
    } catch (error) {
      throw new DataPersistenceError({ message: `Error deleting ${storageKey} from Tigris`, cause: error })
    }
  }

  async listAllStorageKeys(): Promise<StorageKeyEntry[]> {
    const entries: StorageKeyEntry[] = []
    let continuationToken: string | undefined

    try {
      do {
        const response = await this.client.send(
          new ListObjectsV2Command({
            Bucket: this.bucket,
            ContinuationToken: continuationToken
          })
        )
        for (const obj of response.Contents ?? []) {
          if (obj.Key) entries.push({ key: obj.Key, lastModified: obj.LastModified ?? new Date() })
        }
        continuationToken = response.NextContinuationToken
      } while (continuationToken)
    } catch (error) {
      throw new DataPersistenceError({ message: 'Error listing objects in Tigris bucket', cause: error })
    }

    return entries
  }
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

function isS3NotFound(error: unknown): boolean {
  return error instanceof Error && 'name' in error && (error.name === 'NoSuchKey' || error.name === 'NotFound')
}
```

**Also export `TigrisStorageService` from the media-management package index:**

**File:** `boundedContext/mediaManagement/src/index.ts`

Add to the infrastructure services exports (alongside `ImageStorageService`):

```ts
export { TigrisStorageService } from './infrastructure/services/TigrisStorageService'
```

---

#### B4. Update `OrphanImageCleaner` to use `IImageStorageService`

**File:** `backend/src/infrastructure/services/OrphanImageCleaner.ts`

**Depends on:** B1, B2

`OrphanImageCleaner` currently reads the local image directory directly with `fs.readdir`. This must be replaced with `imageStorageService.listAllStorageKeys()`. The age-based check (`maxOrphanAgeMs`) is also removed: `listAllStorageKeys()` returns only keys (not upload timestamps), adding timestamp support would require an interface change. Removing the age check is safe — the orphan job runs every 15 minutes and the window between a storage write and its DB commit is milliseconds.

**Before:**

```ts
import { promises as fs } from 'node:fs'
import path from 'path'
import { IImageRepository } from '@hatsuportal/media-management'
import { Logger } from '@hatsuportal/common'
import { IAdvisoryLock } from '@hatsuportal/platform'

const logger = new Logger('OrphanImageCleaner')

export class OrphanImageCleaner {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imagesBasePath: string,
    private readonly maxOrphanAgeMs: number,
    private readonly cleanupLock: IAdvisoryLock
  ) {}

  async cleanOrphanImages(): Promise<void> {
    const acquired = await this.cleanupLock.tryAcquire()
    if (!acquired) {
      logger.debug('Skipping orphan image cleanup — another instance holds the lock')
      return
    }

    try {
      const knownKeys = new Set(await this.imageRepository.findAllStorageKeys())
      const filesOnDisk = await this.listImageFiles()

      const now = Date.now()
      let deletedCount = 0

      for (const file of filesOnDisk) {
        if (knownKeys.has(file.name)) continue

        const ageMs = now - file.mtimeMs
        if (ageMs < this.maxOrphanAgeMs) continue

        logger.debug(`Deleting orphan image file: ${file.name}`)

        try {
          await fs.unlink(path.join(this.imagesBasePath, file.name))
          deletedCount++
          logger.debug(`Deleted orphan image file: ${file.name}`)
        } catch (error) {
          logger.warn(`Failed to delete orphan image file: ${file.name}`, error)
        }
      }

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} orphan image file(s)`)
      } else {
        logger.debug('No orphan image files found')
      }
    } finally {
      await this.cleanupLock.release()
    }
  }

  private async listImageFiles(): Promise<Array<{ name: string; mtimeMs: number }>> {
    try {
      const entries = await fs.readdir(this.imagesBasePath)
      const results: Array<{ name: string; mtimeMs: number }> = []
      for (const entry of entries) {
        try {
          const stat = await fs.stat(path.join(this.imagesBasePath, entry))
          if (stat.isFile()) results.push({ name: entry, mtimeMs: stat.mtimeMs })
        } catch {
          /* file may have been deleted between readdir and stat */
        }
      }
      return results
    } catch (error) {
      logger.error('Failed to list image directory', error)
      return []
    }
  }
}
```

**After:**

```ts
import { IImageRepository, IImageStorageService } from '@hatsuportal/media-management'
import { Logger } from '@hatsuportal/common'
import { IAdvisoryLock } from '@hatsuportal/platform'

const logger = new Logger('OrphanImageCleaner')

export class OrphanImageCleaner {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageStorageService: IImageStorageService,
    private readonly maxOrphanAgeMs: number,
    private readonly cleanupLock: IAdvisoryLock
  ) {}

  async cleanOrphanImages(): Promise<void> {
    const acquired = await this.cleanupLock.tryAcquire()
    if (!acquired) {
      logger.debug('Skipping orphan image cleanup — another instance holds the lock')
      return
    }

    try {
      const knownKeys = new Set(await this.imageRepository.findAllStorageKeys())
      const storageEntries = await this.imageStorageService.listAllStorageKeys()

      const now = Date.now()
      let deletedCount = 0

      for (const entry of storageEntries) {
        if (knownKeys.has(entry.key)) continue

        const ageMs = now - entry.lastModified.getTime()
        if (ageMs < this.maxOrphanAgeMs) continue

        logger.debug(`Deleting orphan image: ${entry.key}`)

        try {
          await this.imageStorageService.deleteImageFromFileSystem({ value: entry.key } as any)
          deletedCount++
          logger.debug(`Deleted orphan image: ${entry.key}`)
        } catch (error) {
          logger.warn(`Failed to delete orphan image: ${entry.key}`, error)
        }
      }

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} orphan image(s)`)
      } else {
        logger.debug('No orphan images found')
      }
    } finally {
      await this.cleanupLock.release()
    }
  }
}
```

Changes: `imagesBasePath` removed; `imageStorageService: IImageStorageService` added; `maxOrphanAgeMs` retained (now compares against `entry.lastModified`); `listImageFiles()` method deleted; deletion now goes through `imageStorageService` instead of `fs.unlink`.

---

#### B5. Wire up `TigrisStorageService` in `compositionRoot.ts`

**File:** `backend/src/compositionRoot.ts`

**Depends on:** B2, B3, B4

Three targeted changes in this file:

**1. Add `TigrisStorageService` to the media-management import block** (alongside `ImageStorageService`):

```ts
// before:
import {
  ...
  ImageStorageService,
  ...
} from '@hatsuportal/media-management'

// after:
import {
  ...
  ImageStorageService,
  TigrisStorageService,
  ...
} from '@hatsuportal/media-management'
```

**2. In `createServices()`, select the storage implementation based on environment:**

```ts
// before:
const imageStorageService = new ImageStorageService()

// after:
const imageStorageService = process.env.NODE_ENV === 'prod' ? new TigrisStorageService() : new ImageStorageService()
```

**3. Update `createCronJobs()` to accept and pass `imageStorageService`:**

```ts
// before — function signature:
function createCronJobs(
  domainEventRepository: DomainEventRepository,
  mappers: MapperInstances,
  eventDispatcher: IDomainEventDispatcher<UnixTimestamp>,
  repositories: RepositoryInstances
): CronJobs {

// after — add imageStorageService parameter:
function createCronJobs(
  domainEventRepository: DomainEventRepository,
  mappers: MapperInstances,
  eventDispatcher: IDomainEventDispatcher<UnixTimestamp>,
  repositories: RepositoryInstances,
  imageStorageService: IImageStorageService
): CronJobs {
```

```ts
// before — OrphanImageCleaner construction inside createCronJobs():
const orphanImageCleaner = new OrphanImageCleaner(repositories.image, config.images.basePath, config.images.orphanMaxAgeMs, cleanupLock)

// after — imagesBasePath removed, imageStorageService replaces it; maxOrphanAgeMs stays:
const orphanImageCleaner = new OrphanImageCleaner(repositories.image, imageStorageService, config.images.orphanMaxAgeMs, cleanupLock)
```

```ts
// before — createCronJobs() call inside createInstances():
const cronJobs = createCronJobs(repositories.domainEvent, mappers, dataAccess.eventDispatcher, repositories)

// after — pass services.imageStorage:
const cronJobs = createCronJobs(repositories.domainEvent, mappers, dataAccess.eventDispatcher, repositories, services.imageStorage)
```

---

### Group C — Production Packaging

These steps package everything into a deployable Docker image. They must come after all Group A and Group B changes are complete and working locally.

---

#### C1. Replace `entrypoint.sh` with a production script

**File:** `entrypoint.sh` (replace full contents)

**Depends on:** A1, A4

The current script runs `npm run watch` (dev mode with nodemon). Replace it entirely with a production script that runs the pre-compiled backend.

**Full new contents of `entrypoint.sh`:**

```sh
#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/backend && node_modules/.bin/node-pg-migrate up -m migrations

echo "Starting server..."
exec node /app/backend/build/server.js
```

`set -e` causes the script to abort if migrations fail, preventing a broken server from starting. `exec` replaces the shell process with Node so signals (SIGTERM from fly.io during deploys) are delivered directly to the Node process.

The migrations step here is a secondary safety net. The primary migration trigger is the `release_command` in `fly.toml` which runs before any new machine starts.

---

#### C2. Rewrite the `Dockerfile` as a multi-stage build

**Files:**

- `Dockerfile` (full rewrite)
- `.dockerignore` (new file)

**Depends on:** A1–A4, B1–B5, C1

**First, create `.dockerignore` at the project root** to prevent sensitive and unnecessary files from entering the build context:

```
# .dockerignore
.git
**/node_modules
**/.env*
backend/cert
**/coverage
**/build
**/dist
**/*.log
docs
```

Note: `build` and `dist` are excluded from the build context because they are generated inside the container. `node_modules` is excluded because they are installed inside the container by `npm ci`.

**Full new `Dockerfile`:**

```dockerfile
# ---- Stage 1: Build ----
FROM node:18-alpine AS builder
WORKDIR /app

# Copy all package manifests first to leverage layer caching
COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/
COPY boundedContext/mediaManagement/package*.json boundedContext/mediaManagement/
COPY boundedContext/postManagement/package*.json boundedContext/postManagement/
COPY boundedContext/userManagement/package*.json boundedContext/userManagement/
COPY boundedContext/shared-kernel/package*.json boundedContext/shared-kernel/
COPY packages/bounded-context-service-contracts/package*.json packages/bounded-context-service-contracts/
COPY packages/contracts/package*.json packages/contracts/
COPY packages/platform/package*.json packages/platform/
COPY packages/common/package*.json packages/common/

# Install all dependencies (including devDependencies needed for the build)
RUN npm ci

# Copy source
COPY . .

# Compile everything: shared-kernel, bounded contexts, packages, backend TS, frontend Vite
RUN npm run build

# Remove dev dependencies — production deps only remain in node_modules
RUN npm prune --production

# ---- Stage 2: Runner ----
FROM node:18-alpine AS runner
WORKDIR /app

# Copy the entire pruned workspace from the builder.
# Source files are present but harmless — only compiled build/ and dist/ directories execute.
COPY --from=builder /app .

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENV NODE_ENV=prod
ENV PORT=8080

# Install dotenvx and verify no plaintext .env files were accidentally included.
# .dockerignore is the first gate; this is the second — it fails the build if any .env file slipped through.
RUN npm install -g @dotenvx/dotenvx && dotenvx ext prebuild

ENTRYPOINT ["/app/entrypoint.sh"]
```

**Verify the build locally before proceeding to Part 2:**

```sh
docker build -t hatsuportal-prod .

docker run --rm -p 8080:8080 \
  -e NODE_ENV=prod \
  -e PORT=8080 \
  -e DATABASE_URL="postgres://development:development123@host.docker.internal:5432/hatsuportal" \
  -e JWT_SECRET="test-secret-at-least-32-characters-long" \
  -e REFRESH_TOKEN_SECRET="test-refresh-secret-at-least-32-chars" \
  -e AWS_ACCESS_KEY_ID="placeholder" \
  -e AWS_SECRET_ACCESS_KEY="placeholder" \
  -e AWS_ENDPOINT_URL_S3="https://t3.storage.dev" \
  -e AWS_REGION="auto" \
  -e BUCKET_NAME="placeholder" \
  hatsuportal-prod
```

The app should start and `GET http://localhost:8080/ping` should return `{ "ping": "pong" }`. The React frontend should load at `http://localhost:8080`.

---

#### C3. Create `fly.toml`

**File:** `fly.toml` _(new file at project root)_

**Depends on:** C2

Create this file manually at the project root. When `fly launch` is run in Part 2 Step 3, pass `--no-deploy` and decline any offer to overwrite this file.

```toml
app = "hatsuportal"
primary_region = "arn"

[build]
  dockerfile = "Dockerfile"

[deploy]
  release_command = "sh -c 'npm run db:migrate --workspace=backend'"

[env]
  NODE_ENV = "prod"
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

  [http_service.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20

  [[http_service.checks]]
    grace_period = "15s"
    interval = "30s"
    method = "GET"
    timeout = "5s"
    path = "/ping"

[[vm]]
  size = "shared-cpu-1x"
  memory = "1gb"
```

- `primary_region = "arn"` — Stockholm, closest fly.io region to Finland
- `memory = "1gb"` — required due to the 50 MB image upload JSON limit; peak memory during uploads can exceed 512 MB
- `min_machines_running = 0` — scale-to-zero; the machine hibernates when idle and wakes on first request (~3–8 s cold start, acceptable for a personal app)
- `release_command` — runs DB migrations in a temporary machine before any new app machine starts; requires `DATABASE_URL` to already be set as a secret

---

## Part 2: Hosting Service Setup

All steps are performed via the `flyctl` CLI or your domain registrar. **Do not begin Part 2 until the Docker image from C2 builds and runs successfully on your local machine.**

---

#### Step 1 — Register a domain

**Depends on:** nothing — start this as early as possible

Domain propagation can take up to 48 hours. Register the domain now so you are not waiting for DNS at the end.

- Register at any registrar. Cloudflare Registrar (`cloudflare.com/products/registrar`) is recommended: at-cost pricing (no markup) and Cloudflare DNS is the easiest to configure later.
- You do not need to configure DNS records yet — just own the domain.

---

#### Step 2 — Install `flyctl` and authenticate

**Depends on:** Step 1 can run in parallel; flyctl is required for all remaining steps

```sh
# Windows (PowerShell with scoop)
scoop install flyctl

# Authenticate
fly auth login
```

---

#### Step 3 — Create the fly.io app

**Depends on:** Step 2, C3 (`fly.toml` must exist at the project root)

```sh
fly launch --name hatsuportal --region arn --no-deploy
```

`--no-deploy` prevents an immediate deploy attempt before secrets and the database are ready. fly.io will detect the existing `fly.toml`. If it offers to generate a new one or overwrite, decline and keep the manually created file.

---

#### Step 4 — Create and attach the Fly Postgres database

**Depends on:** Step 3

```sh
fly postgres create \
  --name hatsuportal-db \
  --region arn \
  --initial-cluster-size 1 \
  --vm-size shared-cpu-1x \
  --volume-size 3

fly postgres attach hatsuportal-db --app hatsuportal
```

`--initial-cluster-size 1` = single-node, no replica. fly.io creates a dedicated database user and database named after the app and automatically injects `DATABASE_URL` as a secret.

Verify: `fly secrets list --app hatsuportal` should now show `DATABASE_URL`.

---

#### Step 5 — Create the Tigris storage bucket

**Depends on:** Step 3

```sh
fly storage create --name hatsuportal-media --app hatsuportal
```

This creates the bucket and automatically injects Tigris credentials as secrets. After this command, run `fly secrets list --app hatsuportal` and note the exact names of the injected Tigris variables. Cross-check them against the env var names used in `TigrisStorageService` (B3) and update the constructor if needed before deploying.

---

#### Step 6 — Set remaining secrets

**Depends on:** Steps 4 and 5

```sh
fly secrets set \
  JWT_SECRET="<strong-random-string-min-32-chars>" \
  REFRESH_TOKEN_SECRET="<strong-random-string-min-32-chars>" \
  IDENTIFIER="yourdomain.com" \
  API_KEY="<optional-internal-api-key>" \
  --app hatsuportal
```

Generate secure values with:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run this twice — once for `JWT_SECRET`, once for `REFRESH_TOKEN_SECRET`.

After this step, `fly secrets list --app hatsuportal` should show:

- `DATABASE_URL`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `BUCKET_NAME` (exact names from Step 5)
- `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `IDENTIFIER`, `API_KEY`

---

#### Step 7 — First deploy

**Depends on:** Steps 3–6 (all secrets set), C2 (Dockerfile verified locally)

```sh
fly deploy --app hatsuportal
```

fly.io will:

1. Build the Docker image using the multi-stage Dockerfile
2. Run the `release_command` (DB migrations) in a temporary machine
3. Start the app machine
4. Run health checks against `GET /ping`

If the release command or health check fails, the deploy is automatically rolled back.

**Smoke test:**

```sh
fly open --app hatsuportal
# Browser should load the React frontend

curl https://hatsuportal.fly.dev/ping
# Expected: { "ping": "pong" }
```

---

#### Step 8 — Set up the custom domain

**Depends on:** Step 7 (app confirmed working), Step 1 (domain registered)

```sh
# Allocate a dedicated IPv4 address ($2/month — required for custom domain)
fly ips allocate-v4 --app hatsuportal

# Get the allocated IP address
fly ips list --app hatsuportal

# Add SSL certificates (free via Let's Encrypt, auto-renewed)
fly certs add yourdomain.com --app hatsuportal
fly certs add www.yourdomain.com --app hatsuportal
```

At your domain registrar (or Cloudflare DNS), create:

- `A` record: `yourdomain.com` → the IPv4 from `fly ips list`
- `A` record: `www.yourdomain.com` → same IPv4
- (Free) `AAAA` record for IPv6: run `fly ips allocate-v6 --app hatsuportal` to get a free IPv6 address

DNS propagates in minutes with Cloudflare, up to 48 hours with other registrars.

Confirm the certificate is ready:

```sh
fly certs show yourdomain.com --app hatsuportal
# Status should read: "Issued"
```

---

#### Step 9 — Set up scheduled database backups

**Depends on:** Steps 4 (Postgres exists), 5 (Tigris credentials known), 7 (app deployed)

This creates a scheduled machine that runs `pg_dump` daily, gzips the output, and uploads it to the Tigris bucket. The machine runs for seconds then destroys itself — cost is negligible.

```sh
$cmd = 'apk add --no-cache aws-cli && pg_dump "$DATABASE_URL" | gzip | aws s3 cp - "s3://${BUCKET}/backups/$(date +%Y-%m-%d).sql.gz" --endpoint-url https://t3.storage.dev'
fly machine run postgres:17-alpine `
  --app hatsuportal `
  --region arn `
  --schedule daily `
  --restart no `
  --entrypoint /bin/sh `
  --command "-c" `
  --command $cmd `
  --env "DATABASE_URL=postgres://hatsuportal:***@hatsuportal-db.flycast:5432/hatsuportal?sslmode=disable" `
  --env "AWS_ACCESS_KEY_ID=***" `
  --env "AWS_SECRET_ACCESS_KEY=***" `
  --env "BUCKET=hatsuportal-media"
```

**Verify by triggering a manual one-off run** (same command without `--schedule`):

```sh
fly machine run postgres:17-alpine \
  --app hatsuportal \
  --rm \
  --region arn \
  --env DATABASE_URL="<DATABASE_URL secret value>" \
  --env AWS_ACCESS_KEY_ID="<AWS_ACCESS_KEY_ID secret value>" \
  --env AWS_SECRET_ACCESS_KEY="<AWS_SECRET_ACCESS_KEY secret value>" \
  --env BUCKET="hatsuportal-media" \
  --command "sh -c 'apk add --no-cache aws-cli && pg_dump \$DATABASE_URL | gzip | aws s3 cp - s3://\$BUCKET/backups/\$(date +%Y-%m-%d).sql.gz --endpoint-url https://t3.storage.dev'"
```

Then confirm the backup was written:

```sh
aws s3 ls s3://hatsuportal-media/backups/ --endpoint-url https://t3.storage.dev
# Should list a .sql.gz file dated today
```

---

#### Step 10 — Final verification

**Depends on:** Steps 7–9

- [ ] `https://yourdomain.com` loads the React frontend with a valid SSL certificate
- [ ] `https://yourdomain.com/ping` returns `{ "ping": "pong" }`
- [ ] User registration and login work end-to-end
- [ ] Image upload stores successfully to Tigris (confirm object appears in `fly storage dashboard` or via `aws s3 ls`)
- [ ] `fly logs --app hatsuportal` shows no startup errors
- [ ] `fly volumes list` shows the Postgres volume is healthy
- [ ] A daily backup `.sql.gz` appears in the Tigris `backups/` prefix the following day

---

## Dependency Summary

```
Part 1
  A1 — server.ts (HTTP) + vite.config.ts (proxy target)
  A2 — app.ts (remove CORS, add static serving)          ← A1
  A3 — connection.ts (DATABASE_URL support)
  A4 — package.json (node-pg-migrate to deps, split migrate scripts)  ← A3
  A5 — initial schema migration (0000000000000_initial_schema.sql)
  A5a — unify dev Docker (seed.sql + init-dev.sh, delete init.sql)      ← A5
  B1 — IImageStorageService (add listAllStorageKeys)
  B2 — ImageStorageService (implement listAllStorageKeys)  ← B1
  B3 — TigrisStorageService (new file) + index.ts export  ← B1, npm install @aws-sdk/client-s3
  B4 — OrphanImageCleaner (replace fs.readdir with IImageStorageService)  ← B1, B2
  B5 — compositionRoot.ts (wire TigrisStorageService + update OrphanImageCleaner)  ← B2, B3, B4
  C1 — entrypoint.sh (production script)                  ← A1, A4
  C2 — Dockerfile (multi-stage) + .dockerignore           ← A1–A5, B1–B5, C1
                                                           ← verify: local docker build + run
  C3 — fly.toml                                           ← C2

Part 2
  Step 1  — domain registration                           ← start early, no code dep
  Step 2  — flyctl install + auth
  Step 3  — fly launch (create app)                       ← Step 2, C3
  Step 4  — Fly Postgres create + attach                  ← Step 3
  Step 5  — Tigris bucket create                          ← Step 3
  Step 6  — remaining secrets                             ← Steps 4, 5
  Step 7  — fly deploy (first deploy)                     ← Steps 3–6, C2
  Step 8  — custom domain + DNS                           ← Step 7, Step 1
  Step 9  — scheduled backups                             ← Steps 4, 5, 7
  Step 10 — final verification                            ← Steps 7–9
```
