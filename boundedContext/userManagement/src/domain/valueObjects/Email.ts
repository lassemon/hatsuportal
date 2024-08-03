import validator from 'email-validator' // external library dependency that we shall accept, let's consider this a basic utility
import { InvalidEmailError } from '../errors/InvalidEmailError'
import { isNonStringOrEmpty, isString } from '@hatsuportal/common'
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

  readonly value: string

  constructor(raw: string) {
    super()

    if (!isString(raw)) throw new InvalidEmailError(`Value '${raw}' is not a valid email.`)

    const trimmed = raw.trim()
    if (isNonStringOrEmpty(trimmed) || !validator.validate(trimmed)) throw new InvalidEmailError(`Value '${trimmed}' is not a valid email.`)

    this.value = trimmed
  }

  equals(other: unknown): boolean {
    return other instanceof Email && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
