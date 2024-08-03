import { isNonStringOrEmpty, Logger } from '@hatsuportal/common'
import { ValueObject } from '@hatsuportal/common-bounded-context'
import { InvalidPostCreatorNameError } from '../errors/InvalidPostCreatorNameError'

const logger = new Logger('PostCreatorName')
export class PostCreatorName extends ValueObject<string> {
  static canCreate(_value: string) {
    try {
      new PostCreatorName(_value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(private readonly _value: string) {
    super()

    if (isNonStringOrEmpty(_value)) throw new InvalidPostCreatorNameError(`Value '${_value}' is not a valid post creator name.`)

    this._value = _value
  }

  get value(): string {
    return this._value
  }

  equals(other: unknown): boolean {
    return other instanceof PostCreatorName && this._value === other.value
  }

  toString(): string {
    return this._value
  }
}
