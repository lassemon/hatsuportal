import { UserRoleEnum } from '@hatsuportal/common'

/**
 * Row shape from `user_enriched_read_view`.
 * Structurally mirrors UserAggregateDatabaseSchema today; kept separate so view-only
 * columns can be added without affecting write-side hydration types.
 */
export interface UserReadDatabaseSchema {
  id: string
  name: string
  email: string
  roles: UserRoleEnum[]
  active: boolean | 0 | 1
  createdAt: number
  updatedAt: number
  profileImageId: string | null
  bio: string | null
  statusMessage: string | null
  colorScheme: string | null
  selectedThemeId: string | null
  notificationSettings: { emailNotifications: boolean; pushNotifications: boolean } | null
}
