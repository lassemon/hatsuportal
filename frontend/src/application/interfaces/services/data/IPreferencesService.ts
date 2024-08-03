import { FetchOptions, UpdatePreferencesRequest } from '@hatsuportal/contracts'
import { PreferencesViewModel } from 'ui/entities/user/model/PreferencesViewModel'

export interface IPreferencesService {
  getPreferences(options?: FetchOptions): Promise<PreferencesViewModel>
  updatePreferences(updateRequest: UpdatePreferencesRequest, options?: FetchOptions): Promise<PreferencesViewModel>
}
