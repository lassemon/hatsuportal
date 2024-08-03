import { UniqueId } from '@hatsuportal/shared-kernel'
import { Logger } from '@hatsuportal/foundation'
import { InvalidTagCreatorIdError } from '../errors/InvalidTagCreatorIdError'

const logger = new Logger('TagCreatorId')

interface CanCreateOptions {
  throwError?: boolean
}

export class TagCreatorId extends UniqueId {
  static override canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new TagCreatorId(value)
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
      throw new InvalidTagCreatorIdError(error)
    }
  }
}
