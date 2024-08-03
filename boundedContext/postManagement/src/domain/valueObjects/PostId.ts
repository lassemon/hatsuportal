import { UniqueId } from '@hatsuportal/shared-kernel'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'
import { Logger } from '@hatsuportal/foundation'

const logger = new Logger('PostId')

interface CanCreateOptions {
  throwError?: boolean
}

export class PostId extends UniqueId {
  static override canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new PostId(value)
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
      throw new InvalidPostIdError(error)
    }
  }
}
