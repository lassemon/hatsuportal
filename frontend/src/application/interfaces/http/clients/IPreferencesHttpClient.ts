import { FetchOptions, PreferencesResponse } from '@hatsuportal/contracts'

export interface IPreferencesHttpClient {
  getPreferences(options?: FetchOptions): Promise<PreferencesResponse>
}
