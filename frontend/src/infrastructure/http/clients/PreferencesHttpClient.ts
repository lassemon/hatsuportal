import { FetchOptions, PreferencesResponse, UpdatePreferencesRequest } from '@hatsuportal/contracts'
import { IHttpClient, IPreferencesHttpClient } from 'application/interfaces'

export class PreferencesHttpClient implements IPreferencesHttpClient {
  private readonly baseUrl = '/users/me/preferences'
  constructor(private readonly httpClient: IHttpClient) {}

  async getPreferences(options?: FetchOptions): Promise<PreferencesResponse> {
    return await this.httpClient.getJson<PreferencesResponse>({ endpoint: this.baseUrl, ...options })
  }

  async updatePreferences(updateRequest: UpdatePreferencesRequest, options?: FetchOptions): Promise<PreferencesResponse> {
    return await this.httpClient.patchJson<PreferencesResponse, UpdatePreferencesRequest>({
      endpoint: this.baseUrl, // '/users/me/preferences' — same as GET
      payload: updateRequest,
      ...options
    })
  }
}
