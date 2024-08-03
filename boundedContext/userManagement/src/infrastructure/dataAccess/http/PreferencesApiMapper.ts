import { PreferencesResponse, UpdatePreferencesRequest } from '@hatsuportal/contracts'
import { PreferencesDTOWithTheme, UpdateUserPreferencesInputDTO } from '../../../application/dtos'
import { IPreferencesApiMapper } from '../../../application/dataAccess/http/IPreferencesApiMapper'
import { IThemeApiMapper } from '../../../application/dataAccess/http/IThemeApiMapper'

export class PreferencesApiMapper implements IPreferencesApiMapper {
  constructor(private readonly themeApiMapper: IThemeApiMapper) {}

  toResponse(preferences: PreferencesDTOWithTheme): PreferencesResponse {
    return {
      colorScheme: preferences.colorScheme,
      selectedTheme: this.themeApiMapper.toResponse(preferences.selectedTheme),
      notificationSettings: {
        emailNotifications: preferences.notificationSettings.emailNotifications,
        pushNotifications: preferences.notificationSettings.pushNotifications
      }
    }
  }

  toUpdateUserPreferencesInputDTO(updatePreferencesRequest: UpdatePreferencesRequest): UpdateUserPreferencesInputDTO {
    return {
      colorScheme: updatePreferencesRequest.colorScheme,
      selectedThemeId: updatePreferencesRequest.selectedThemeId,
      notificationSettings: updatePreferencesRequest.notificationSettings
    }
  }
}
