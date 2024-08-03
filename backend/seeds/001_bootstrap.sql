-- Bootstrap: system user, default theme, system profile, and system preferences.
-- Id values stay aligned with SystemUserId.DEFAULT and DefaultThemeId.DEFAULT.

INSERT INTO users (
  id,
  name,
  password,
  email,
  active,
  roles,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'System',
  '$2a$10$lZzKUHY5zCIbCcfKmv2RaOH412mNfemffeQUBKpGqsWOrsZZGsJmO',
  'system@hatsuportal.internal',
  TRUE,
  '["super_admin", "admin", "creator"]'::jsonb,
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO themes (
  id,
  name,
  light_colors,
  dark_colors,
  created_by_id,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default',
  '{"primary":"#0C2A28","backgroundPrimary":"#F8F4F2","backgroundSecondary":"#FFFFFF","callToAction":"#CD5B43"}'::jsonb,
  '{"primary":"#F1F3F5","backgroundPrimary":"#131D29","backgroundSecondary":"#21252A","callToAction":"#BFFA00"}'::jsonb,
  '00000000-0000-0000-0000-000000000001',
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (
  user_id,
  bio,
  status_message
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '',
  ''
)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_preferences (
  user_id,
  color_scheme,
  selected_theme_id,
  notification_settings
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'light',
  '00000000-0000-0000-0000-000000000001',
  '{"emailNotifications":true,"pushNotifications":true}'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;
