import ValueObject from './ValueObject'
import { InvalidUserNameError } from '../errors/InvalidUserNameError'
import { isNonStringOrEmpty } from '@hatsuportal/common'

export class UserName extends ValueObject<string> {
  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value)) throw new InvalidUserNameError(`Value '${_value}' is not a valid user name.`)

    this._value = _value
  }

  static canCreate(_value: string) {
    try {
      new UserName(_value)
      return true
    } catch {
      return false
    }
  }

  get value(): string {
    return this._value
  }

  equals(other: unknown): boolean {
    return other instanceof UserName && this._value === other.value
  }

  toString(): string {
    return this._value
  }
}
