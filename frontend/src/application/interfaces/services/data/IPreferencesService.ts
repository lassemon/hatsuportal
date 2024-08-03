import { PreferencesViewModel } from 'ui/entities/user/model/PreferencesViewModel'

export interface IPreferencesService {
  getPreferences(): Promise<PreferencesViewModel>
}
