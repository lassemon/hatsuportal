import ValueObject from './ValueObject'
import { InvalidPostVisibilityError } from '../errors/InvalidPostVisibilityError'
import { isNonStringOrEmpty, isEnumValue, VisibilityEnum } from '@hatsuportal/common'

export class PostVisibility extends ValueObject<VisibilityEnum> {
  constructor(private readonly _value: VisibilityEnum) {
    super()

    if (isNonStringOrEmpty(_value) || !isEnumValue(_value, VisibilityEnum))
      throw new InvalidPostVisibilityError(`Value '${_value}' is not a valid visibility for a post.`)

    this._value = _value
  }

  static canCreate(_value: VisibilityEnum) {
    try {
      new PostVisibility(_value)
      return true
    } catch {
      return false
    }
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
