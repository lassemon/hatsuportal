import { isNonStringOrEmpty, isEnumValue, VisibilityEnum } from '@hatsuportal/common'
import { ValueObject } from '@hatsuportal/shared-kernel'
import { InvalidPostVisibilityError } from '../errors/InvalidPostVisibilityError'

export class PostVisibility extends ValueObject<VisibilityEnum> {
  static canCreate(value: VisibilityEnum): boolean {
    try {
      PostVisibility.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: VisibilityEnum): void {
    new PostVisibility(value)
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
