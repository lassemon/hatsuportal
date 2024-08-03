import { InvalidPasswordError } from '../errors/InvalidPasswordError'
import { isNonStringOrEmpty } from '@hatsuportal/common'
import { ValueObject } from '@hatsuportal/shared-kernel'

/**
 * Represents an unencrypted password domain value object
 */
export class Password extends ValueObject<string> {
  static canCreate(value: string): boolean {
    try {
      Password.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: string): void {
    Password.create(value)
  }

  static create(value: string): Password {
    if (isNonStringOrEmpty(value)) {
      throw new InvalidPasswordError(`'${value}' Password is not valid.`)
    }

    return new Password(value)
  }

  private constructor(public readonly value: string) {
    super()
  }

  equals(other: unknown): boolean {
    return other instanceof Password && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
