import { UniqueId } from '@hatsuportal/shared-kernel'
import { Logger } from '@hatsuportal/foundation'
import { InvalidCommentIdError } from '../errors/InvalidCommentIdError'

const logger = new Logger('CommentId')

interface CanCreateOptions {
  throwError?: boolean
}

export class CommentId extends UniqueId {
  static override canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new CommentId(value)
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
      throw new InvalidCommentIdError(error)
    }
  }
}
