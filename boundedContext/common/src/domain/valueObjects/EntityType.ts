import { isNonStringOrEmpty, isEnumValue, EntityTypeEnum } from '@hatsuportal/common'
import { ValueObject } from './ValueObject'
import { InvalidEntityTypeError } from '../errors/InvalidEntityTypeError'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('EntityType')
export class EntityType extends ValueObject<EntityTypeEnum> {
  static canCreate(_value: EntityTypeEnum) {
    try {
      new EntityType(_value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(private readonly _value: EntityTypeEnum) {
    super()

    if (isNonStringOrEmpty(_value) || !isEnumValue(_value, EntityTypeEnum))
      throw new InvalidEntityTypeError(`Value '${_value}' is not a valid entity type.`)

    this._value = _value
  }

  get value(): EntityTypeEnum {
    return this._value
  }

  equals(other: unknown): boolean {
    if (other instanceof EntityType) {
      return this._value === other.value
    }
    return this._value === other
  }

  toString(): EntityTypeEnum {
    return this._value
  }
}
