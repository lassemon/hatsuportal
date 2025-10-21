import { Logger } from '@hatsuportal/foundation'
import { InvalidImageIdError } from '../errors/InvalidImageIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

const logger = new Logger('ImageId')

interface CanCreateOptions {
  throwError?: boolean
}

export class ImageId extends UniqueId {
  static override canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new ImageId(value)
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
      throw new InvalidImageIdError(error)
    }
  }
}
