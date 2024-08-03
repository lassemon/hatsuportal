import { CreateThemeRequest, FetchOptions, UpdateThemeRequest } from '@hatsuportal/contracts'
import { IThemeHttpClient, IThemeService, IThemeViewModelMapper } from 'application/interfaces'
import { ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'

export class ThemeService implements IThemeService {
  constructor(
    private readonly themeHttpClient: IThemeHttpClient,
    private readonly themeViewModelMapper: IThemeViewModelMapper
  ) {}

  async findAll(options?: FetchOptions): Promise<ThemeViewModel[]> {
    const findAllThemeResponse = await this.themeHttpClient.findAll(options)
    return findAllThemeResponse
      .map((theme) => this.themeViewModelMapper.toViewModel(theme))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }

  async create(createRequest: CreateThemeRequest, options?: FetchOptions): Promise<ThemeViewModel> {
    const createThemeResponse = await this.themeHttpClient.create(createRequest, options)
    return this.themeViewModelMapper.toViewModel(createThemeResponse)
  }

  async update(themeId: string, updateRequest: UpdateThemeRequest, options?: FetchOptions): Promise<ThemeViewModel> {
    const updateThemeResponse = await this.themeHttpClient.update(themeId, updateRequest, options)
    return this.themeViewModelMapper.toViewModel(updateThemeResponse)
  }

  async delete(themeId: string, options?: FetchOptions): Promise<void> {
    return await this.themeHttpClient.delete(themeId, options)
  }
}
