import ValueObject from './ValueObject'
import { isNonStringOrEmpty, Logger } from '@hatsuportal/common'
import { InvalidFileNameError } from '../errors/InvalidFileNameError'

const logger = new Logger('FileName')
export class FileName extends ValueObject<string> {
  static canCreate(_value: string) {
    try {
      new FileName(_value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }
  /**
   * Returns a temporary filename that keeps the same extension
   * and therefore remains valid under the same validation rules.
   *  photo.jpg   →   photo.tmp.jpg
   */
  static createTemporaryFileName(original: FileName): FileName {
    return new FileName(`${original.name}.tmp.${original.extension}`)
  }

  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value)) throw new InvalidFileNameError(`Value '${_value}' is not a valid file name.`)

    const forbiddenCharacters = /[\/\\:\*\?"<>\|]/
    const pattern = /^[^\s\\/:\*\?"<>\|]+\.[^\s\\/:\*\?"<>\|]+$/
    if (forbiddenCharacters.test(_value) || !pattern.test(_value))
      throw new InvalidFileNameError(`Value '${_value}' is not a valid file name.`)

    this._value = _value.replaceAll(' ', '').toLowerCase()
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
