import ValueObject from './ValueObject'
import { InvalidMimeTypeError } from '../errors/InvalidMimeTypeError'
import { isNonStringOrEmpty } from '@hatsuportal/common'

//TODO implement all allowed mime types and subtypes validation?

export class MimeType extends ValueObject<string> {
  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value)) throw new InvalidMimeTypeError(`Value '${_value}' is not a valid mime type.`)

    const pattern = /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/
    if (!pattern.test(_value)) throw new InvalidMimeTypeError(`Value '${_value}' is not a valid mime type.`)

    this._value = _value
  }

  static canCreate(_value: string) {
    try {
      new MimeType(_value)
      return true
    } catch {
      return false
    }
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
