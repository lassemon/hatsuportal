import { isNonStringOrEmpty, isEnumValue, VisibilityEnum, Logger } from '@hatsuportal/common'
import { ValueObject } from '@hatsuportal/common-bounded-context'
import { InvalidPostVisibilityError } from '../errors/InvalidPostVisibilityError'

const logger = new Logger('PostVisibility')
export class PostVisibility extends ValueObject<VisibilityEnum> {
  static canCreate(_value: VisibilityEnum) {
    try {
      new PostVisibility(_value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(private readonly _value: VisibilityEnum) {
    super()

    if (isNonStringOrEmpty(_value) || !isEnumValue(_value, VisibilityEnum))
      throw new InvalidPostVisibilityError(`Value '${_value}' is not a valid visibility for a post.`)

    this._value = _value
  }

  get value(): VisibilityEnum {
    return this._value
  }

  equals(other: unknown): boolean {
    if (other instanceof PostVisibility) {
      return this._value === other.value
    }
    return this._value === other
  }

  toString(): VisibilityEnum {
    return this._value
  }
}
