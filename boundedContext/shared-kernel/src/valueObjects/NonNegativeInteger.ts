import ValueObject from './ValueObject'
import { InvalidNonNegativeIntegerError } from '../errors/InvalidNonNegativeIntegerError'

export class NonNegativeInteger extends ValueObject<number> {
  static canCreate(value: number): boolean {
    try {
      NonNegativeInteger.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: number): void {
    new NonNegativeInteger(value)
  }

  constructor(public readonly value: number) {
    super()

    if (value < 0) throw new InvalidNonNegativeIntegerError(`Value '${value}' is not a valid non negative integer.`)
  }

  equals(other: unknown): boolean {
    return other instanceof NonNegativeInteger && this.value === other.value
  }

  toString(): string {
    return this.value.toString()
  }
}
