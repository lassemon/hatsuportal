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

  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value) || !validator.validate(_value)) throw new InvalidEmailError(`Value '${_value}' is not a valid email.`)

    this._value = _value
  }

  get value(): string {
    return this._value
  }

  equals(other: unknown): boolean {
    return other instanceof Email && this._value === other.value
  }

  toString(): string {
    return this._value
  }
}
