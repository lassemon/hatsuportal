import { isNonStringOrEmpty, isEnumValue, VisibilityEnum, Logger } from '@hatsuportal/foundation'
import { ValueObject } from '@hatsuportal/shared-kernel'
import { InvalidPostVisibilityError } from '../errors/InvalidPostVisibilityError'

const logger = new Logger('PostVisibility')

interface CanCreateOptions {
  throwError?: boolean
}

export class PostVisibility extends ValueObject<VisibilityEnum> {
  static canCreate(value: VisibilityEnum, { throwError = false }: CanCreateOptions = {}) {
    try {
      new PostVisibility(value)
      return true
    } catch (error) {
      logger.warn(error)
      if (throwError) {
        throw error
      }
      return false
    }
  }

  constructor(public readonly value: VisibilityEnum) {
    super()

    if (isNonStringOrEmpty(value) || !isEnumValue(value, VisibilityEnum))
      throw new InvalidPostVisibilityError(`Value '${value}' is not a valid visibility for a post.`)
  }

  equals(other: unknown): boolean {
    if (other instanceof PostVisibility) {
      return this.value === other.value
    }
    return this.value === other
  }

  toString(): string {
    return this.value.toString()
  }
}
