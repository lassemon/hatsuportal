import { isNonStringOrEmpty, Logger } from '@hatsuportal/foundation'
import { ValueObject } from '@hatsuportal/shared-kernel'
import { InvalidPostCreatorNameError } from '../errors/InvalidPostCreatorNameError'

const logger = new Logger('PostCreatorName')

interface CanCreateOptions {
  throwError?: boolean
}

export class PostCreatorName extends ValueObject<string> {
  static canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new PostCreatorName(value)
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

    if (isNonStringOrEmpty(value)) throw new InvalidPostCreatorNameError(`Value '${value}' is not a valid post creator name.`)
  }

  equals(other: unknown): boolean {
    return other instanceof PostCreatorName && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
