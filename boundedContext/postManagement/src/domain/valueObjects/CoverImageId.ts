import { Logger } from '@hatsuportal/foundation'
import { InvalidCoverImageIdError } from '../errors/InvalidCoverImageIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

const logger = new Logger('CoverImageId')

interface CanCreateOptions {
  throwError?: boolean
}

export class CoverImageId extends UniqueId {
  static override canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new CoverImageId(value)
      return true
    } catch (error) {
      logger.warn(error)
      if (throwError) {
        throw error
      }
      return false
    }
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidCoverImageIdError(error)
    }
  }
}
