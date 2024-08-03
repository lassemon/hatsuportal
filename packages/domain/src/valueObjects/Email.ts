import ValueObject from './ValueObject'
import { InvalidEmailError } from '../errors/InvalidEmailError'
import validator from 'email-validator'
import { isNonStringOrEmpty } from '@hatsuportal/common'

export class Email extends ValueObject<string> {
  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value) || !validator.validate(_value)) throw new InvalidEmailError(`Value '${_value}' is not a valid email.`)

    this._value = _value
  }

  static canCreate(_value: string) {
    try {
      new Email(_value)
      return true
    } catch {
      return false
    }
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
