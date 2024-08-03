import { isNonStringOrEmpty } from '@hatsuportal/common'
import { ValueObject } from '@hatsuportal/shared-kernel'
import { InvalidPostCreatorNameError } from '../errors/InvalidPostCreatorNameError'

export class PostCreatorName extends ValueObject<string> {
  static canCreate(value: string): boolean {
    try {
      PostCreatorName.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: string): void {
    new PostCreatorName(value)
  }

  constructor(public readonly value: string) {
    super()

    if (isNonStringOrEmpty(value)) throw new InvalidPostCreatorNameError(`Value '${value}' is not a valid post creator name.`)
  }

  equals(other: unknown): boolean {
    return other instanceof PostCreatorName && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
