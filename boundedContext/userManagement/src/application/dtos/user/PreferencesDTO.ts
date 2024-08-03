export interface PreferencesDTO {
  colorScheme: string
  selectedThemeId: string
  notificationSettings: {
    emailNotifications: boolean
    pushNotifications: boolean
  }
}
