DO $$ BEGIN
  CREATE TYPE post_type AS ENUM ('story', 'recipe', 'guide');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE image_role AS ENUM ('cover', 'recipe_step', 'thumbnail', 'profile_picture');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- migration like this:
-- ALTER TYPE image_role ADD VALUE 'gallery';
-- OR
-- ALTER TYPE post_type ADD VALUE 'review';

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

-- Supertype: one row per post of any kind
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


-- Story subtype: 1:1 with posts(id)
CREATE TABLE IF NOT EXISTS stories (
  id              UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  body            TEXT
);

/* ---------------------------------------------------------------
   TRIGGER: keep posts.search_vector current for stories

   Defined here — BEFORE the story seed-data inserts — so the
   trigger fires for every row inserted below and search_vector
   is populated for fresh installs without needing a separate
   backfill step.

   Two triggers are required because title lives on posts and
   body lives on stories.

   Trigger 1 (stories AFTER INSERT/UPDATE): looks up posts.title,
   then UPDATE posts SET search_vector = ...

   Trigger 2 (posts BEFORE UPDATE OF title): reads stories.body
   and sets NEW.search_vector inline (no extra UPDATE needed).

   A future recipe trigger would add its own weighted fields
   (ingredients, instructions, etc.) to posts.search_vector.
-----------------------------------------------------------------*/
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
  -- future: ELSIF NEW.post_type = 'recipe' THEN ... END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_post_title_update_search_vector
BEFORE UPDATE OF title ON posts
FOR EACH ROW EXECUTE FUNCTION update_post_title_search_vector();

-- images (nullable current_version_id; composite FK added later)
CREATE TABLE IF NOT EXISTS images (
    id                   UUID PRIMARY KEY,
    created_by_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at           BIGINT NOT NULL,
    current_version_id   UUID
  );

-- immutable versions
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

-- exactly one current version per image (at most):
CREATE UNIQUE INDEX IF NOT EXISTS unique_index_image_current_version
  ON image_versions(image_id)
  WHERE is_current;

-- a version cannot be both staged and current
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_version_flags'
      AND conrelid = 'image_versions'::regclass
  ) THEN
    ALTER TABLE image_versions
      ADD CONSTRAINT check_version_flags CHECK (NOT (is_current AND is_staged));
  END IF;
END $$;

-- ensure current_version_id belongs to the same image (composite FK)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_image_versions_pair'
      AND conrelid = 'image_versions'::regclass
  ) THEN
    ALTER TABLE image_versions
      ADD CONSTRAINT unique_image_versions_pair UNIQUE (image_id, id);
  END IF;
END $$;

-- Safe FK from images -> image_versions (no cascading delete)
-- Without this composite FK, you could accidentally set current_version_id to a version row
-- that actually belongs to some other image (its image_id would not match).
-- Example:
-- images:
--   A (id = A)
--   B (id = B)
-- image_versions:
--   v1 (id = v1, image_id = A)
--   v2 (id = v2, image_id = B)
--
-- Bad assignment: images(A).current_version_id = v2
-- Bad assignment is prevented by the composite FK
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_images_current_version_pair'
      AND conrelid = 'images'::regclass
  ) THEN
    ALTER TABLE images
      ADD CONSTRAINT fk_images_current_version_pair
      FOREIGN KEY (id, current_version_id)
      REFERENCES image_versions (image_id, id)
      ON DELETE SET NULL (current_version_id)
      DEFERRABLE INITIALLY DEFERRED;
  END IF;
END $$;


CREATE TABLE IF NOT EXISTS post_image_links (
    post_id           UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    role              image_role NOT NULL,
    image_id          UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    created_at        BIGINT NOT NULL,
    PRIMARY KEY (post_id, image_id)
  );

-- One cover image per story (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS unique_one_cover_per_post ON post_image_links (post_id)
WHERE
  role = 'cover';

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



-- There is no post_comment_links table, because comments are one-to-many unlike images and tags, which are many-to-many.
CREATE TABLE IF NOT EXISTS comments (
  id                    UUID PRIMARY KEY,
  post_id               UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body                  TEXT NOT NULL,
  parent_comment_id     UUID NULL, -- for comment threads
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


/* ---------------------------------------------------------------
   VIEW: story_enriched_view
   ---------------------------------------------------------------
   Purpose:
   Return every Story together with enriched data.
   This lets the client sort or filter by for example "created_by_name"
   without performing a manual join.
-----------------------------------------------------------------*/
CREATE OR REPLACE VIEW story_enriched_read_view AS
SELECT
    stories.id                    AS id,
    posts.title                   AS title,
    posts.visibility              AS visibility,
    stories.body                  AS body,
    posts.created_by_id           AS created_by_id,
    users.name                    AS created_by_name,
    post_image_links.image_id     AS cover_image_id, -- may be null
    array_remove(
        array_agg(DISTINCT post_tag_links.tag_id ORDER BY post_tag_links.tag_id),
        NULL
    )                       AS tag_ids,
    posts.created_at        AS created_at,
    posts.updated_at        AS updated_at
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