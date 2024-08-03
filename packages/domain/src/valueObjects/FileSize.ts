import { isNumber } from 'lodash'
import ValueObject from './ValueObject'
import { InvalidFileSizeError } from '../errors/InvalidFileSizeError'

export class FileSize extends ValueObject<number> {
  constructor(private readonly _value: number) {
    super()

    if (!isNumber(_value) || !_value || _value <= 0) throw new InvalidFileSizeError(`Value '${_value}' is not a valid file size.`)

    this._value = _value
  }

  static canCreate(_value: number) {
    try {
      new FileSize(_value)
      return true
    } catch {
      return false
    }
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
