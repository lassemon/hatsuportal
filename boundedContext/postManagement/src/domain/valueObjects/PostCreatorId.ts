import { UniqueId } from '@hatsuportal/common-bounded-context'
import { InvalidPostCreatorIdError } from '../errors/InvalidPostCreatorIdError'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('PostCreatorId')

interface CanCreateOptions {
  throwError?: boolean
}

export class PostCreatorId extends UniqueId {
  static override canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new PostCreatorId(value)
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
      throw new InvalidPostCreatorIdError(error)
    }
  }
}
