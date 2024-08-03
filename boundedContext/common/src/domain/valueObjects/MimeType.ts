import { isNonStringOrEmpty, Logger } from '@hatsuportal/common'
import ValueObject from './ValueObject'
import { InvalidMimeTypeError } from '../errors/InvalidMimeTypeError'

const logger = new Logger('MimeType')
//TODO implement all allowed mime types and subtypes validation?

export class MimeType extends ValueObject<string> {
  static canCreate(_value: string) {
    try {
      new MimeType(_value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value)) throw new InvalidMimeTypeError(`Value '${_value}' is not a valid mime type.`)

    const pattern = /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/
    if (!pattern.test(_value)) throw new InvalidMimeTypeError(`Value '${_value}' is not a valid mime type.`)

    this._value = _value
  }

  get type(): string {
    return this._value.split('/')[0]
  }

  get subtype(): string {
    return this._value.split('/')[1]
  }

  get value(): string {
    return this._value
  }

  equals(other: unknown): boolean {
    return other instanceof MimeType && this._value === other.value
  }

  toString(): string {
    return this._value
  }
}
