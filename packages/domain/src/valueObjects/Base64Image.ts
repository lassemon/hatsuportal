import ValueObject from './ValueObject'
import { InvalidBase64ImageError } from '../errors/InvalidBase64ImageError'
import { BASE64_PREFIX, isNonStringOrEmpty } from '@hatsuportal/common'

export class Base64Image extends ValueObject<string> {
  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value) || !_value.startsWith(BASE64_PREFIX) || _value === BASE64_PREFIX)
      throw new InvalidBase64ImageError(`Value '${_value}' is not a valid base 64 encoded image.`)

    this._value = _value
  }

  static canCreate(_value: string) {
    try {
      new Base64Image(_value)
      return true
    } catch {
      return false
    }
  }

  get value(): string {
    return this._value
  }

  equals(other: unknown): boolean {
    return other instanceof Base64Image && this._value === other.value
  }

  toString(): string {
    return this._value
  }
}
