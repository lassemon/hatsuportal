import { isNonStringOrEmpty, Logger } from '@hatsuportal/common'
import { InvalidUserNameError } from '../errors/InvalidUserNameError'
import { ValueObject } from '@hatsuportal/common-bounded-context'

const logger = new Logger('UserName')

export class UserName extends ValueObject<string> {
  static canCreate(value: string) {
    try {
      new UserName(value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value)) throw new InvalidUserNameError(`Value '${_value}' is not a valid user name.`)

    this._value = _value
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
