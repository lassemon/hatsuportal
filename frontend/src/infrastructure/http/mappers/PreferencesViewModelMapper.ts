import { PreferencesResponse } from '@hatsuportal/contracts'
import { PreferencesViewModel } from 'ui/entities/user/model/PreferencesViewModel'
import { IPreferencesViewModelMapper } from 'application/interfaces'

export class PreferencesViewModelMapper implements IPreferencesViewModelMapper {
  toViewModel(preferencesResponse: PreferencesResponse): PreferencesViewModel {
    return new PreferencesViewModel(preferencesResponse)
  }
}
