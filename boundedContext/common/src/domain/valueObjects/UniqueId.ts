import { isNonStringOrEmpty, Logger } from '@hatsuportal/common'
import { ValueObject } from './ValueObject'
import { InvalidUniqueIdError } from '../errors/InvalidUniqueIdError'

const logger = new Logger('UniqueId')
export class UniqueId extends ValueObject<string> {
  static canCreate(value: string) {
    try {
      new UniqueId(value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value))
      throw new InvalidUniqueIdError(`Value '${_value}' is not a valid unique id for ${this.constructor.name}.`)

    // 36 characters is the uuid v4 standard length
    if (_value.length < 36) throw new InvalidUniqueIdError(`Value '${_value}' is too short.`)

    this._value = _value
  }

  get value(): string {
    return this._value
  }

  equals(other: unknown): boolean {
    return other instanceof UniqueId && this._value === other.value
  }

  toString(): string {
    return this._value
  }
}
