-- Bootstrap: system user, default theme, system profile, and system preferences.
-- Id values stay aligned with SystemUserId.DEFAULT and DefaultThemeId.DEFAULT.
-- Default theme light/dark colors must match packages/contracts DEFAULT_THEME_DISPLAY_COLORS.

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
  1700000000,
  1700000000
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
  '{"primary":"#0C2A28","backgroundPrimary":"#F5F5F5","backgroundSecondary":"#EDE6D6","callToAction":"#CD5B43"}'::jsonb,
  '{"primary":"#F1F3F5","backgroundPrimary":"#21252A","backgroundSecondary":"#131D29","callToAction":"#BFFA00"}'::jsonb,
  '00000000-0000-0000-0000-000000000001',
  1700000000,
  1700000000
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
