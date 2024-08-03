import { isNonStringOrEmpty, isEnumValue, EntityTypeEnum, Logger } from '@hatsuportal/common'
import { ValueObject } from '@hatsuportal/common-bounded-context'
import { InvalidOwnerTypeError } from '../errors/InvalidOwnerTypeError'

const logger = new Logger('OwnerType')
export class OwnerType extends ValueObject<EntityTypeEnum> {
  static canCreate(_value: EntityTypeEnum) {
    try {
      new OwnerType(_value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(private readonly _value: EntityTypeEnum) {
    super()

    if (isNonStringOrEmpty(_value) || !isEnumValue(_value, EntityTypeEnum))
      throw new InvalidOwnerTypeError(`Value '${_value}' is not a valid owner type.`)

    this._value = _value
  }

  get value(): EntityTypeEnum {
    return this._value
  }

  equals(other: unknown): boolean {
    if (other instanceof OwnerType) {
      return this._value === other.value
    }
    return this._value === other
  }

  toString(): EntityTypeEnum {
    return this._value
  }
}
