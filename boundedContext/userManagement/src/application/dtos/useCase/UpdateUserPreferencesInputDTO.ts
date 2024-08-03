export interface UpdateUserPreferencesInputDTO {
  colorScheme?: string
  selectedThemeId?: string
  notificationSettings?: {
    emailNotifications?: boolean
    pushNotifications?: boolean
  }
}
