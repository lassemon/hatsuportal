import ValueObject from './ValueObject'
import { InvalidOwnerTypeError } from '../errors/InvalidOwnerTypeError'
import { PostTypeEnum, isNonStringOrEmpty, isEnumValue } from '@hatsuportal/common'

export class OwnerType extends ValueObject<PostTypeEnum> {
  constructor(private readonly _value: PostTypeEnum) {
    super()

    if (isNonStringOrEmpty(_value) || !isEnumValue(_value, PostTypeEnum))
      throw new InvalidOwnerTypeError(`Value '${_value}' is not a valid owner type.`)

    this._value = _value
  }

  static canCreate(_value: PostTypeEnum) {
    try {
      new OwnerType(_value)
      return true
    } catch {
      return false
    }
  }

  get value(): PostTypeEnum {
    return this._value
  }

  equals(other: unknown): boolean {
    if (other instanceof OwnerType) {
      return this._value === other.value
    }
    return this._value === other
  }

  toString(): PostTypeEnum {
    return this._value
  }
}
