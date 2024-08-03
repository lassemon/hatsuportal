import { IPreferencesHttpClient, IPreferencesService, IPreferencesViewModelMapper } from 'application/interfaces'
import { PreferencesViewModel } from 'ui/entities/user/model/PreferencesViewModel'

export class PreferencesService implements IPreferencesService {
  constructor(
    private readonly preferencesHttpClient: IPreferencesHttpClient,
    private readonly preferencesViewModelMapper: IPreferencesViewModelMapper
  ) {}

  async getPreferences(): Promise<PreferencesViewModel> {
    const response = await this.preferencesHttpClient.getPreferences()
    return this.preferencesViewModelMapper.toViewModel(response)
  }
}
