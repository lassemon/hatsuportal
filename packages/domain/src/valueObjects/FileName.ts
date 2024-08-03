import ValueObject from './ValueObject'
import { InvalidFileNameError } from '../errors/InvalidFileNameError'
import { isNonStringOrEmpty } from '@hatsuportal/common'

export class FileName extends ValueObject<string> {
  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value)) throw new InvalidFileNameError(`Value '${_value}' is not a valid file name.`)

    const forbiddenCharacters = /[\/\\:\*\?"<>\|]/
    const pattern = /^[^\s\\/:\*\?"<>\|]+\.[^\s\\/:\*\?"<>\|]+$/
    if (forbiddenCharacters.test(_value) || !pattern.test(_value))
      throw new InvalidFileNameError(`Value '${_value}' is not a valid file name.`)

    this._value = _value.replaceAll(' ', '').toLowerCase()
  }

  static canCreate(_value: string) {
    try {
      new FileName(_value)
      return true
    } catch {
      return false
    }
  }

  get name(): string {
    return this._value.substring(0, this._value.lastIndexOf('.'))
  }

  get extension(): string {
    return this._value.substring(this._value.lastIndexOf('.') + 1)
  }

  equals(other: unknown): boolean {
    return other instanceof FileName && this._value === other.value
  }

  get value(): string {
    return this._value
  }

  toString(): string {
    return this._value
  }
}
