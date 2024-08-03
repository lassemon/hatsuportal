DO $$
BEGIN
  CREATE TYPE color_scheme AS ENUM ('light', 'dark');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS themes (
  id              UUID PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  light_colors    JSONB NOT NULL,
  dark_colors     JSONB NOT NULL,
  created_by_id   UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'
    REFERENCES users(id) ON DELETE SET DEFAULT,
  created_at      BIGINT NOT NULL,
  updated_at      BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS index_themes_created_by_id ON themes (created_by_id);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio             TEXT NOT NULL DEFAULT '',
  status_message  TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  color_scheme          color_scheme NOT NULL DEFAULT 'light',
  selected_theme_id     UUID NOT NULL REFERENCES themes(id) ON DELETE RESTRICT,
  notification_settings JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS index_user_preferences_selected_theme_id ON user_preferences (selected_theme_id);

CREATE TABLE IF NOT EXISTS user_image_links (
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            image_role NOT NULL,
  image_id        UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, image_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_one_profile_picture_per_user ON user_image_links (user_id)
WHERE
  role = 'profile_picture';

CREATE INDEX IF NOT EXISTS index_user_image_links_user_id_role ON user_image_links (user_id, role);

CREATE INDEX IF NOT EXISTS index_user_image_links_image_id_role ON user_image_links (image_id, role);

CREATE OR REPLACE VIEW user_enriched_read_view AS
SELECT
  users.id,
  users.name,
  users.email,
  users.roles,
  users.active,
  users.created_at,
  users.updated_at,
  user_profiles.bio,
  user_profiles.status_message,
  user_preferences.color_scheme,
  user_preferences.selected_theme_id,
  user_preferences.notification_settings,
  user_image_links.image_id AS profile_image_id
FROM users
LEFT JOIN user_profiles ON user_profiles.user_id = users.id
LEFT JOIN user_preferences ON user_preferences.user_id = users.id
LEFT JOIN user_image_links
  ON user_image_links.user_id = users.id
 AND user_image_links.role = 'profile_picture';
