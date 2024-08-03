-- Migration: 001_add_post_search_vector
-- Adds full-text search support to the posts master table.
--
-- Two triggers maintain search_vector going forward:
--   - trigger_story_update_search_vector: fires AFTER INSERT/UPDATE on stories
--     (handles new stories and body edits)
--   - trigger_post_title_update_search_vector: fires BEFORE UPDATE OF title on posts
--     (handles title edits without needing a second UPDATE statement)
--
-- The final UPDATE backfills search_vector for all rows that existed before
-- this migration was run — the triggers alone do not cover historical data.

ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS index_posts_search_vector ON posts USING GIN (search_vector);


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


-- Backfill: populate search_vector for all story rows that existed before this
-- migration ran. title is already on posts; body is on stories.
UPDATE posts p
SET search_vector = setweight(to_tsvector('english', COALESCE(p.title, '')), 'A')
                 || setweight(to_tsvector('english', COALESCE(s.body, '')), 'B')
FROM stories s
WHERE s.id = p.id;
