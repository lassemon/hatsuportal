import { FetchOptions, UpdatePreferencesRequest } from '@hatsuportal/contracts'
import { IPreferencesHttpClient, IPreferencesService, IPreferencesViewModelMapper } from 'application/interfaces'
import { PreferencesViewModel } from 'ui/entities/user/model/PreferencesViewModel'

export class PreferencesService implements IPreferencesService {
  constructor(
    private readonly preferencesHttpClient: IPreferencesHttpClient,
    private readonly preferencesViewModelMapper: IPreferencesViewModelMapper
  ) {}

  async getPreferences(options?: FetchOptions): Promise<PreferencesViewModel> {
    const response = await this.preferencesHttpClient.getPreferences(options)
    return this.preferencesViewModelMapper.toViewModel(response)
  }

  async updatePreferences(updateRequest: UpdatePreferencesRequest, options?: FetchOptions): Promise<PreferencesViewModel> {
    const response = await this.preferencesHttpClient.updatePreferences(updateRequest, options)
    return this.preferencesViewModelMapper.toViewModel(response)
  }
}
