import { isNonStringOrEmpty } from '@hatsuportal/common'
import { ValueObject } from './ValueObject'
import { InvalidImageCreatorNameError } from '../errors/InvalidImageCreatorNameError'

export class ImageCreatorName extends ValueObject<string> {
  static canCreate(value: string): boolean {
    try {
      ImageCreatorName.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: string): void {
    new ImageCreatorName(value)
  }

  constructor(public readonly value: string) {
    super()

    if (isNonStringOrEmpty(value)) throw new InvalidImageCreatorNameError(`Value '${value}' is not a valid image creator name.`)
  }

  equals(other: unknown): boolean {
    return other instanceof ImageCreatorName && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
