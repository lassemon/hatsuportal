import validator from 'email-validator' // external library dependency that we shall accept, let's consider this a basic utility
import { InvalidEmailError } from '../errors/InvalidEmailError'
import { isNonStringOrEmpty } from '@hatsuportal/common'
import { ValueObject } from '@hatsuportal/shared-kernel'

export class Email extends ValueObject<string> {
  static canCreate(value: string): boolean {
    try {
      Email.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: string): void {
    new Email(value)
  }

  constructor(public readonly value: string) {
    super()

    if (isNonStringOrEmpty(value) || !validator.validate(value)) throw new InvalidEmailError(`Value '${value}' is not a valid email.`)
  }

  equals(other: unknown): boolean {
    return other instanceof Email && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
