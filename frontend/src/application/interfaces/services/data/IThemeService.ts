import { CreateThemeRequest, FetchOptions, UpdateThemeRequest } from '@hatsuportal/contracts'
import { ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'

export interface IThemeService {
  findAll(options?: FetchOptions): Promise<ThemeViewModel[]>
  create(createRequest: CreateThemeRequest, options?: FetchOptions): Promise<ThemeViewModel>
  update(themeId: string, updateRequest: UpdateThemeRequest, options?: FetchOptions): Promise<ThemeViewModel>
  delete(themeId: string, options?: FetchOptions): Promise<void>
}
