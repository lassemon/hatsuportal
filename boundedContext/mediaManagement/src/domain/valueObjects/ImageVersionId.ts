import { Logger } from '@hatsuportal/foundation'
import { InvalidImageVersionIdError } from '../errors/InvalidImageVersionIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

const logger = new Logger('ImageVersionId')

interface CanCreateOptions {
  throwError?: boolean
}

export class ImageVersionId extends UniqueId {
  static override canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new ImageVersionId(value)
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
      throw new InvalidImageVersionIdError(error)
    }
  }
}
