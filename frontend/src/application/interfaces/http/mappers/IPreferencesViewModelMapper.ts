import { PreferencesViewModel } from 'ui/entities/user/model/PreferencesViewModel'
import { PreferencesResponse } from '@hatsuportal/contracts'

export interface IPreferencesViewModelMapper {
  toViewModel(preferencesResponse: PreferencesResponse): PreferencesViewModel
}
