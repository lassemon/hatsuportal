import { Theme } from '../entities/Theme'
import { ThemeId } from '../valueObjects/ThemeId'

export interface IThemeRepository {
  findById(themeId: ThemeId): Promise<Theme | null>
  findByIdForUpdate(themeId: ThemeId): Promise<Theme | null>
  findAll(): Promise<Theme[]>
  insert(theme: Theme): Promise<Theme>
  update(theme: Theme): Promise<Theme>
  delete(theme: Theme): Promise<void>
}
