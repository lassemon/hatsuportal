import { Logger } from '@hatsuportal/foundation'
import { InvalidCommentAuthorIdError } from '../errors/InvalidCommentAuthorIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

const logger = new Logger('CommentAuthorId')

interface CanCreateOptions {
  throwError?: boolean
}

export class CommentAuthorId extends UniqueId {
  static override canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new CommentAuthorId(value)
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
      throw new InvalidCommentAuthorIdError(error)
    }
  }
}
