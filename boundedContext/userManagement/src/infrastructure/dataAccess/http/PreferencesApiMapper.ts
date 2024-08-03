import { PreferencesResponse, UpdatePreferencesRequest } from '@hatsuportal/contracts'
import { PreferencesDTO, UpdateUserPreferencesInputDTO } from '../../../application/dtos'
import { IPreferencesApiMapper } from '../../../application/dataAccess/http/IPreferencesApiMapper'

export class PreferencesApiMapper implements IPreferencesApiMapper {
  toResponse(preferences: PreferencesDTO): PreferencesResponse {
    return {
      colorScheme: preferences.colorScheme,
      selectedThemeId: preferences.selectedThemeId,
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
