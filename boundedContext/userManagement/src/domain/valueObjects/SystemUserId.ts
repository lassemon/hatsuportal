import { UserId } from './UserId'

/**
 * Identifies the platform system user — a non-interactive principal used by
 * infrastructure (cron jobs, outbox handlers, etc.) when no human actor exists.
 *
 * The default UUID matches the row inserted by `backend/seeds/001_bootstrap.sql`.
 */
export class SystemUserId extends UserId {
  constructor() {
    super('00000000-0000-0000-0000-000000000001')
  }
}
