import ValueObject from './ValueObject'
import { InvalidPositiveIntegerError } from '../errors/InvalidPositiveIntegerError'

export class PositiveInteger extends ValueObject<number> {
  static canCreate(value: number): boolean {
    try {
      PositiveInteger.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: number): void {
    new PositiveInteger(value)
  }

  constructor(public readonly value: number) {
    super()

    if (value <= 0) throw new InvalidPositiveIntegerError(`Value '${value}' is not a valid positive integer.`)
  }

  equals(other: unknown): boolean {
    return other instanceof PositiveInteger && this.value === other.value
  }

  toString(): string {
    return this.value.toString()
  }
}
