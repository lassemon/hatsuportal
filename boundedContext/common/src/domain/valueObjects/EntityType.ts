import { isNonStringOrEmpty, isEnumValue, EntityTypeEnum } from '@hatsuportal/common'
import { ValueObject } from './ValueObject'
import { InvalidEntityTypeError } from '../errors/InvalidEntityTypeError'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('EntityType')
export class EntityType extends ValueObject<EntityTypeEnum> {
  static canCreate(value: EntityTypeEnum) {
    try {
      new EntityType(value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(public readonly value: EntityTypeEnum) {
    super()

    if (isNonStringOrEmpty(value) || !isEnumValue(value, EntityTypeEnum))
      throw new InvalidEntityTypeError(`Value '${value}' is not a valid entity type.`)
  }

  equals(other: unknown): boolean {
    if (other instanceof EntityType) {
      return this.value === other.value
    }
    return this.value === other
  }

  toString(): EntityTypeEnum {
    return this.value
  }
}
