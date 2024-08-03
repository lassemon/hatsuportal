import { FetchOptions, PreferencesResponse, UpdatePreferencesRequest } from '@hatsuportal/contracts'

export interface IPreferencesHttpClient {
  getPreferences(options?: FetchOptions): Promise<PreferencesResponse>
  updatePreferences(updateRequest: UpdatePreferencesRequest, options?: FetchOptions): Promise<PreferencesResponse>
}
