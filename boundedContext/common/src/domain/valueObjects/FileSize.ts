import { isNumber, Logger } from '@hatsuportal/common'
import ValueObject from './ValueObject'
import { InvalidFileSizeError } from '../errors/InvalidFileSizeError'

const logger = new Logger('FileSize')
export class FileSize extends ValueObject<number> {
  static canCreate(_value: number) {
    try {
      new FileSize(_value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(private readonly _value: number) {
    super()

    if (!isNumber(_value) || !_value || _value <= 0) throw new InvalidFileSizeError(`Value '${_value}' is not a valid file size.`)

    this._value = _value
  }

  get value(): number {
    return this._value
  }

  equals(other: unknown): boolean {
    return other instanceof FileSize && this._value === other.value
  }

  toString(): string {
    return this._value.toString()
  }
}
