import { isNonStringOrEmpty, Logger } from '@hatsuportal/common'
import { ValueObject } from './ValueObject'
import { InvalidImageCreatorNameError } from '../errors/InvalidImageCreatorNameError'

const logger = new Logger('ImageCreatorName')
export class ImageCreatorName extends ValueObject<string> {
  static canCreate(_value: string) {
    try {
      new ImageCreatorName(_value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value)) throw new InvalidImageCreatorNameError(`Value '${_value}' is not a valid image creator name.`)

    this._value = _value
  }

  get value(): string {
    return this._value
  }

  equals(other: unknown): boolean {
    return other instanceof ImageCreatorName && this._value === other.value
  }

  toString(): string {
    return this._value
  }
}
