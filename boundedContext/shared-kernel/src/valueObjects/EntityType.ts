import { ValueObject } from './ValueObject'
import { InvalidEntityTypeError } from '../errors/InvalidEntityTypeError'
import { EntityTypeEnum, isEnumValue, isNonStringOrEmpty } from '@hatsuportal/common'

export class EntityType extends ValueObject<EntityTypeEnum> {
  static canCreate(value: EntityTypeEnum): boolean {
    try {
      EntityType.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: EntityTypeEnum): void {
    new EntityType(value)
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
