import { UserId } from './UserId'

/**
 * Identifies the platform system user — a non-interactive principal used by
 * infrastructure (cron jobs, outbox handlers, etc.) when no human actor exists.
 *
 * The default UUID matches the row inserted by the `seed_system_user` migration.
 * Runtime deployments may override the id via `SYSTEM_USER_ID`; validate and
 * construct instances at the composition root, never from environment here.
 */
export class SystemUserId extends UserId {
  static readonly DEFAULT = '00000000-0000-0000-0000-000000000001'

  static override canCreate(value: string): boolean {
    try {
      SystemUserId.assertCanCreate(value)
      return true
    } catch {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new SystemUserId(value)
  }

  static default(): SystemUserId {
    return new SystemUserId(SystemUserId.DEFAULT)
  }

  constructor(value: string) {
    super(value)
  }
}
