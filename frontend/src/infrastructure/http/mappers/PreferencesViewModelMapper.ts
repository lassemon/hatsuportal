import { PreferencesResponse } from '@hatsuportal/contracts'
import { PreferencesViewModel } from 'ui/entities/user/model/PreferencesViewModel'
import { IPreferencesViewModelMapper, IThemeViewModelMapper } from 'application/interfaces'

export class PreferencesViewModelMapper implements IPreferencesViewModelMapper {
  constructor(private readonly themeViewModelMapper: IThemeViewModelMapper) {}
  toViewModel(preferencesResponse: PreferencesResponse): PreferencesViewModel {
    return new PreferencesViewModel({
      colorScheme: preferencesResponse.colorScheme,
      selectedTheme: this.themeViewModelMapper.toDTO(preferencesResponse.selectedTheme),
      notificationSettings: {
        emailNotifications: preferencesResponse.notificationSettings.emailNotifications,
        pushNotifications: preferencesResponse.notificationSettings.pushNotifications
      }
    })
  }
}
