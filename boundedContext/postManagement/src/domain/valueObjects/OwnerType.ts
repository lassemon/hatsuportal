import { isNonStringOrEmpty, isEnumValue, EntityTypeEnum } from '@hatsuportal/common'
import { ValueObject } from '@hatsuportal/shared-kernel'
import { InvalidOwnerTypeError } from '../errors/InvalidOwnerTypeError'

export class OwnerType extends ValueObject<EntityTypeEnum> {
  static canCreate(value: EntityTypeEnum): boolean {
    try {
      OwnerType.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: EntityTypeEnum): void {
    new OwnerType(value)
  }

  constructor(public readonly value: EntityTypeEnum) {
    super()

    if (isNonStringOrEmpty(value) || !isEnumValue(value, EntityTypeEnum))
      throw new InvalidOwnerTypeError(`Value '${value}' is not a valid owner type.`)
  }

  equals(other: unknown): boolean {
    if (other instanceof OwnerType) {
      return this.value === other.value
    }
    return this.value === other
  }

  toString(): EntityTypeEnum {
    return this.value
  }
}
