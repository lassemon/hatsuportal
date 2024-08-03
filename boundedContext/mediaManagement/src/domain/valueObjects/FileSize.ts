import { isNumber } from '@hatsuportal/common'
import ValueObject from './ValueObject'
import { InvalidFileSizeError } from '../errors/InvalidFileSizeError'

export class FileSize extends ValueObject<number> {
  static canCreate(value: number): boolean {
    try {
      FileSize.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: number): void {
    new FileSize(value)
  }

  constructor(public readonly value: number) {
    super()

    if (!isNumber(value) || !value || value <= 0) throw new InvalidFileSizeError(`Value '${value}' is not a valid file size.`)
  }

  equals(other: unknown): boolean {
    return other instanceof FileSize && this.value === other.value
  }

  toString(): string {
    return this.value.toString()
  }
}
