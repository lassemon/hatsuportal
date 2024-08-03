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

INSERT INTO
  users (
    id,
    name,
    password,
    email,
    active,
    roles,
    created_at,
    updated_at
  )
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


-- Supertype: one row per post of any kind
CREATE TABLE IF NOT EXISTS posts (
  id               UUID PRIMARY KEY,
  post_type        post_type NOT NULL,
  created_by_id    UUID NOT NULL,
  created_at       BIGINT NOT NULL,
  updated_at       BIGINT NOT NULL,
  CONSTRAINT fk_posts_created_by
      FOREIGN KEY (created_by_id) REFERENCES users(id)
      ON DELETE RESTRICT,
  CONSTRAINT chk_posts_time_order
      CHECK (updated_at >= created_at)
);

CREATE INDEX IF NOT EXISTS index_posts_post_type ON posts (post_type);
CREATE INDEX IF NOT EXISTS index_posts_stories_only ON posts (id) WHERE post_type = 'story';
CREATE INDEX IF NOT EXISTS index_posts_created_by_id ON posts (created_by_id);
CREATE INDEX IF NOT EXISTS index_posts_updated ON posts (updated_at);

INSERT INTO
  posts (
    id,
    post_type,
    created_by_id,
    created_at,
    updated_at
  )
VALUES
  (
    '252a58d0-d2d3-4f08-9b1e-59322b5900ec',
    'story',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707508500,
    1707511590
  ),
  (
    '252a58d0-d2d3-4f08-9b2e-59322b5900ec',
    'story',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707508501,
    1707511591
  ),
  (
    '252a58d0-d2d3-4f08-9b3e-59322b5900ec',
    'story',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707508502,
    1707511592
  ),
  (
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'story',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707508503,
    1707511593
  ),
  (
    '252a58d0-d2d3-4f08-9b5e-59322b5900ec',
    'story',
    '5c66958c-a703-46d3-bab5-18d2eea1884d',
    1707508500,
    1707511590
  ),
  (
    '252a58d0-d2d3-4f08-9b6e-59322b5900ec',
    'story',
    '5c66958c-a703-46d3-bab5-18d2eea1884d',
    1707508501,
    1707511591
  ),
  (
    '252a58d0-d2d3-4f08-9b7e-59322b5900ec',
    'story',
    '5c66958c-a703-46d3-bab5-18d2eea1884d',
    1707508502,
    1707511592
  );


-- Story subtype: 1:1 with posts(id)
CREATE TABLE IF NOT EXISTS stories (
  id              UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  visibility      VARCHAR(255) NOT NULL,
  description     TEXT
);

CREATE INDEX IF NOT EXISTS index_stories_visibility ON stories (visibility);

INSERT INTO
  stories (
    id,
    name,
    visibility,
    description
  )
VALUES
  (
    '252a58d0-d2d3-4f08-9b1e-59322b5900ec',
    'Default Story',
    'public',
    'Default story description'
  ),
  (
    '252a58d0-d2d3-4f08-9b2e-59322b5900ec',
    'Private Story',
    'private',
    'This is an story visible only to its creator'
  ),
  (
    '252a58d0-d2d3-4f08-9b3e-59322b5900ec',
    'Logged In Story',
    'logged_in',
    'This story is only visible if youre logged in'
  ),
  (
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'Story With Image',
    'public',
    'This story has an image attached to it'
  ),
  (
    '252a58d0-d2d3-4f08-9b5e-59322b5900ec',
    'Test Users Public Story',
    'public',
    'This is an story created by the Test User that is visible to all'
  ),
  (
    '252a58d0-d2d3-4f08-9b6e-59322b5900ec',
    'Test Users Private Story',
    'private',
    'This is an story visible only to its creator'
  ),
  (
    '252a58d0-d2d3-4f08-9b7e-59322b5900ec',
    'Test Users Logged In Story',
    'logged_in',
    'This story is only visible if youre logged in'
  );

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
  ALTER TABLE image_versions
    ADD CONSTRAINT check_version_flags CHECK (NOT (is_current AND is_staged));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ensure current_version_id belongs to the same image (composite FK)
DO $$
BEGIN
  -- unique pair (image_id, id) to target
  ALTER TABLE image_versions
    ADD CONSTRAINT unique_image_versions_pair UNIQUE (image_id, id);
EXCEPTION WHEN duplicate_object THEN NULL;
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
  ALTER TABLE images
    ADD CONSTRAINT fk_images_current_version_pair
    FOREIGN KEY (id, current_version_id)
    REFERENCES image_versions (image_id, id)
    ON DELETE SET NULL
    DEFERRABLE INITIALLY DEFERRED;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO
  images (
    id,
    created_by_id,
    created_at
  )
VALUES
  (
    '66403c46-97db-45ba-a646-5e10f229f490',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707499636
  )
ON CONFLICT (id) DO NOTHING;


INSERT INTO
  image_versions (
    id, image_id, storage_key, mime_type, size, is_current, is_staged, created_at)
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

INSERT INTO
  post_image_links (post_id, role, image_id, created_at)
VALUES
  (
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'cover',
    '66403c46-97db-45ba-a646-5e10f229f490',
    1707499636
  );

CREATE TABLE IF NOT EXISTS tags (
    id              UUID PRIMARY KEY,
    slug            CITEXT NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    created_by_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      BIGINT NOT NULL,
    updated_at      BIGINT NOT NULL
  );

INSERT INTO
  tags (id, slug, name, created_by_id, created_at, updated_at)
VALUES
  (
    '421a58d0-d2d3-4f08-9b1e-59322b5900ec',
    'recipe',
    'Recipe',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707499636,
    1707499736
  ),
  (
    '421a58d0-d2d3-4f08-9b2e-59322b5900ec',
    'diary',
    'Diary',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707499636,
    1707499736
  ),
  (
    '421a58d0-d2d3-4f08-9b3e-59322b5900ec',
    'chicken-recipe',
    'Chicken Recipe',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707499636,
    1707499736
  ),
  (
    '421a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'no-bullshit-recipe',
    'No Bullshit Recipe',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707499636,
    1707499736
  ),
  (
    '421a58d0-d2d3-4f08-9b5e-59322b5900ec',
    'fine-dine-bullshit',
    'Fine Dine Bullshit',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707499636,
    1707499736
  );


CREATE TABLE IF NOT EXISTS post_tag_links (
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at      BIGINT NOT NULL,
    PRIMARY KEY (post_id, tag_id)
  );

CREATE INDEX IF NOT EXISTS index_post_tag_links_tag_id ON post_tag_links (tag_id);

INSERT INTO
  post_tag_links (post_id, tag_id, created_at)
VALUES
  (
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    '421a58d0-d2d3-4f08-9b2e-59322b5900ec',
    1707499636
  ),
  (
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    '421a58d0-d2d3-4f08-9b1e-59322b5900ec',
    1707499636
  ),
  (
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    '421a58d0-d2d3-4f08-9b3e-59322b5900ec',
    1707499636
  );


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

INSERT INTO
  comments (id, post_id, author_id, body, parent_comment_id, created_at, updated_at)
VALUES
  (
    '123e4567-e89b-12d3-a456-426614174000',
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'This is a test comment',
    NULL,
    1707499636,
    1707499736
  ),
  (
    '123e4567-e89b-12d3-a456-426614174001',
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'This is a test reply',
    '123e4567-e89b-12d3-a456-426614174000',
    1707499637,
    1707499736
  ),
  (
    '123e4567-e89b-12d3-a456-426614174002',
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'This is a test reply #2',
    '123e4567-e89b-12d3-a456-426614174000',
    1707499638,
    1707499736
  ),
  (
    '123e4567-e89b-12d3-a456-426614174003',
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'This is a test reply #3',
    '123e4567-e89b-12d3-a456-426614174000',
    1707499639,
    1707499736
  ),
  (
    '123e4567-e89b-12d3-a456-426614174004',
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'This is a test reply #4',
    '123e4567-e89b-12d3-a456-426614174000',
    1707499640,
    1707499736
  ),
  (
    '123e4567-e89b-12d3-a456-426614174005',
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'This is a test reply #5',
    '123e4567-e89b-12d3-a456-426614174000',
    1707499641,
    1707499736
  );

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
    stories.name                  AS name,
    stories.visibility            AS visibility,
    stories.description           AS description,
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
    stories.name,
    stories.visibility,
    stories.description,
    posts.created_by_id,
    users.name,
    post_image_links.image_id,
    posts.created_at,
    posts.updated_at;