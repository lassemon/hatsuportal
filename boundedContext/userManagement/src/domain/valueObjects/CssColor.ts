import { isString, parseCssColor } from '@hatsuportal/common'
import { ValueObject } from '@hatsuportal/shared-kernel'
import { InvalidCssColorError } from '../errors/InvalidCssColorError'

export class CssColor extends ValueObject<string> {
  static canCreate(value: string): boolean {
    try {
      CssColor.assertCanCreate(value)
      return true
    } catch {
      return false
    }
  }

  static assertCanCreate(value: string): void {
    new CssColor(value)
  }

  readonly value: string

  constructor(raw: string) {
    super()

    if (!isString(raw)) {
      throw new InvalidCssColorError(`Value '${String(raw)}' is not a valid CSS color.`)
    }

    this.value = CssColor.parse(raw)
  }

  static parse(raw: string): string {
    const result = parseCssColor(raw)
    if (!result.ok) {
      throw new InvalidCssColorError(result.message)
    }
    return result.value
  }

  equals(other: unknown): boolean {
    return other instanceof CssColor && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
