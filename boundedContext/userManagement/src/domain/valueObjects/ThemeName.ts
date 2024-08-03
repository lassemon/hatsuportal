import { isString } from '@hatsuportal/common'
import { ValueObject } from '../../../../shared-kernel/src/valueObjects/ValueObject'
import { InvalidThemeNameError } from '../errors/InvalidThemeNameError'

export class ThemeName extends ValueObject<string> {
  constructor(public readonly value: string) {
    super()

    if (!isString(value)) throw new InvalidThemeNameError(`Value '${value}' is not a valid theme name.`)

    const trimmed = value.trim()
    if (!trimmed) {
      throw new InvalidThemeNameError('Theme name must not be empty')
    }
    this.value = trimmed
  }

  equals(other: unknown): boolean {
    return other instanceof ThemeName && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
