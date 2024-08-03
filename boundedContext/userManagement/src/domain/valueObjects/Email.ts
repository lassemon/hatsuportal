import { isNonStringOrEmpty, Logger } from '@hatsuportal/common'
import validator from 'email-validator'
import { InvalidEmailError } from '../errors/InvalidEmailError'
import { ValueObject } from '@hatsuportal/common-bounded-context'

const logger = new Logger('Email')
export class Email extends ValueObject<string> {
  static canCreate(value: string) {
    try {
      new Email(value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
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
