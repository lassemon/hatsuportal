import ValueObject from './ValueObject'
import { InvalidUserIdError } from '../errors/InvalidUserIdError'
import { isNonStringOrEmpty } from '@hatsuportal/common'

export class UserId extends ValueObject<string> {
  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value)) throw new InvalidUserIdError(`Value '${_value}' is not a valid post id.`)

    // 36 characters is the uuid v4 standard length
    if (_value.length < 36) throw new InvalidUserIdError(`Value '${_value}' is too short.`)

    this._value = _value
  }

  static canCreate(_value: string) {
    try {
      new UserId(_value)
      return true
    } catch {
      return false
    }
  }

  get value(): string {
    return this._value
  }

  equals(other: unknown): boolean {
    return other instanceof UserId && this._value === other.value
  }

  toString(): string {
    return this._value
  }
}
