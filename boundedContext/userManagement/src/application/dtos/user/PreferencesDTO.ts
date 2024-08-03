import { ColorSchemeEnum } from '@hatsuportal/common'
import { ThemeDTO } from '../theme/ThemeDTO'

export interface PreferencesDTO {
  colorScheme: ColorSchemeEnum
  selectedThemeId: string
  notificationSettings: {
    emailNotifications: boolean
    pushNotifications: boolean
  }
}

export interface PreferencesDTOWithTheme extends PreferencesDTO {
  selectedTheme: ThemeDTO
}
