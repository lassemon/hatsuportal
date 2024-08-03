export interface UserPreferencesDatabaseSchema {
  userId: string
  colorScheme: string
  selectedThemeId: string
  notificationSettings: {
    emailNotifications: boolean
    pushNotifications: boolean
  }
}
