import { FetchOptions, ThemeResponse, UpdateThemeRequest } from '@hatsuportal/contracts'
import { CreateThemeRequest } from '@hatsuportal/contracts'
import { IHttpClient, IThemeHttpClient } from 'application/interfaces'

export class ThemeHttpClient implements IThemeHttpClient {
  private readonly baseUrl = '/themes'

  constructor(private readonly httpClient: IHttpClient) {}

  async findAll(options?: FetchOptions): Promise<ThemeResponse[]> {
    return await this.httpClient.getJson<ThemeResponse[]>({ endpoint: this.baseUrl, ...options })
  }

  async create(createRequest: CreateThemeRequest, options?: FetchOptions): Promise<ThemeResponse> {
    return await this.httpClient.postJson<ThemeResponse, CreateThemeRequest>({ endpoint: this.baseUrl, payload: createRequest, ...options })
  }

  async update(themeId: string, updateRequest: UpdateThemeRequest, options?: FetchOptions): Promise<ThemeResponse> {
    return await this.httpClient.patchJson<ThemeResponse, UpdateThemeRequest>({
      endpoint: `${this.baseUrl}/${themeId}`,
      payload: updateRequest,
      ...options
    })
  }

  async delete(themeId: string, options?: FetchOptions): Promise<void> {
    return await this.httpClient.deleteJson<void>({
      endpoint: `${this.baseUrl}/${themeId}`,
      ...options
    })
  }
}
