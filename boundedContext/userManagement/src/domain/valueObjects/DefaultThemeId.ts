import { ThemeId } from './ThemeId'

/**
 * Identifies the platform default theme row (`themes.id`).
 *
 * The default UUID matches the row inserted by `backend/seeds/001_bootstrap.sql`.
 */
export class DefaultThemeId extends ThemeId {
  constructor() {
    super('00000000-0000-0000-0000-000000000001')
  }
}
