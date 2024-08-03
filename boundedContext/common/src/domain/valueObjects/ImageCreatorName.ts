import { isNonStringOrEmpty, Logger } from '@hatsuportal/common'
import { ValueObject } from './ValueObject'
import { InvalidImageCreatorNameError } from '../errors/InvalidImageCreatorNameError'

const logger = new Logger('ImageCreatorName')
export class ImageCreatorName extends ValueObject<string> {
  static canCreate(value: string) {
    try {
      new ImageCreatorName(value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
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
