import { InvalidThemeIdError } from '../errors/InvalidThemeIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

export class ThemeId extends UniqueId {
  static override canCreate(value: string): boolean {
    try {
      ThemeId.assertCanCreate(value)
      return true
    } catch {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new ThemeId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidThemeIdError(error)
    }
  }
}
