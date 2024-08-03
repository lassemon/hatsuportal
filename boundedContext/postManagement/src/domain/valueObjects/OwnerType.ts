import { isNonStringOrEmpty, isEnumValue, EntityTypeEnum, Logger } from '@hatsuportal/common'
import { ValueObject } from '@hatsuportal/common-bounded-context'
import { InvalidOwnerTypeError } from '../errors/InvalidOwnerTypeError'

const logger = new Logger('OwnerType')

interface CanCreateOptions {
  throwError?: boolean
}

export class OwnerType extends ValueObject<EntityTypeEnum> {
  static canCreate(value: EntityTypeEnum, { throwError = false }: CanCreateOptions = {}) {
    try {
      new OwnerType(value)
      return true
    } catch (error) {
      logger.warn(error)
      if (throwError) {
        throw error
      }
      return false
    }
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
