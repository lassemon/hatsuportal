import { isNonStringOrEmpty, Logger } from '@hatsuportal/foundation'
import { ValueObject } from './ValueObject'
import { InvalidImageCreatorNameError } from '../errors/InvalidImageCreatorNameError'

const logger = new Logger('ImageCreatorName')

interface CanCreateOptions {
  throwError?: boolean
}

export class ImageCreatorName extends ValueObject<string> {
  static canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new ImageCreatorName(value)
      return true
    } catch (error) {
      logger.warn(error)
      if (throwError) {
        throw error
      }
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
