import ValueObject from './ValueObject'
import { InvalidNonEmptyStringError } from '../errors/InvalidNonEmptyStringError'
import { isNonStringOrEmpty } from '@hatsuportal/common'

export class NonEmptyString extends ValueObject<string> {
  static canCreate(value: string): boolean {
    try {
      NonEmptyString.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: string): void {
    new NonEmptyString(value)
  }

  constructor(public readonly value: string) {
    super()

    if (isNonStringOrEmpty(value)) throw new InvalidNonEmptyStringError(`Value '${value}' is not a valid non empty string.`)
  }

  equals(other: unknown): boolean {
    return other instanceof NonEmptyString && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
