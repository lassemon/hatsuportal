import { UserRoleEnum } from '@hatsuportal/common'

/** Row shape for the `users` table only. */
export interface UserDatabaseSchema {
  id: string
  name: string
  password: string
  email: string
  roles: UserRoleEnum[] // postgre allows us to store json
  active: boolean | 0 | 1
  createdAt: number
  updatedAt: number
}

/**
 * Write-side hydrated row from users + user_profiles + user_preferences + user_image_links.
 * Used by UserWriteRepository to reconstruct the User aggregate (no password).
 */
export interface UserAggregateDatabaseSchema extends Omit<UserDatabaseSchema, 'password'> {
  // profileImageId lives in user_image_links linking table but only the UserWriteRepository must know about the linking table
  profileImageId: string | null
  // bio and statusMessage live in user_profiles but only the UserWriteRepository must know about the linking table
  bio: string | null
  statusMessage: string | null
  // colorScheme, selectedThemeId, and notificationSettings live in user_preferences but only the UserWriteRepository must know about the linking table
  colorScheme: string | null
  selectedThemeId: string | null
  notificationSettings: { emailNotifications: boolean; pushNotifications: boolean } | null
}
