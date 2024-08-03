import { CreateThemeRequest, FetchOptions, ThemeResponse, UpdateThemeRequest } from '@hatsuportal/contracts'

export interface IThemeHttpClient {
  findAll(options?: FetchOptions): Promise<ThemeResponse[]>
  create(createRequest: CreateThemeRequest, options?: FetchOptions): Promise<ThemeResponse>
  update(themeId: string, updateRequest: UpdateThemeRequest, options?: FetchOptions): Promise<ThemeResponse>
  delete(themeId: string, options?: FetchOptions): Promise<void>
}
