-- Migration: seed_system_user
-- Inserts the platform system user used by infrastructure actors (cron cleanup, etc.).
-- Id must stay aligned with SystemUserId.DEFAULT and SYSTEM_USER_ID config default.

-- Up Migration
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
  '[]'::jsonb,
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
)
ON CONFLICT (id) DO NOTHING;

-- Down Migration
DELETE FROM users
WHERE id = '00000000-0000-0000-0000-000000000001';
