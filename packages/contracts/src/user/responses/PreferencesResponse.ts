import { ColorSchemeEnum } from '@hatsuportal/common'
import { ThemeResponse } from './ThemeResponse'

/**
 * NOTE: DO NOT USE PartialExceptFor or other type utils here, it will break the validation of the request
 * (TSOA route.js generation models.X.properties variable is not properly generated)
 */
export interface PreferencesResponse {
  colorScheme: `${ColorSchemeEnum}`
  selectedTheme: ThemeResponse
  notificationSettings: {
    emailNotifications: boolean
    pushNotifications: boolean
  }
}
