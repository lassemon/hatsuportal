import { UniqueId } from '@hatsuportal/shared-kernel'
import { Logger } from '@hatsuportal/foundation'
import { InvalidTagIdError } from '../errors/InvalidTagIdError'

const logger = new Logger('TagId')

interface CanCreateOptions {
  throwError?: boolean
}

export class TagId extends UniqueId {
  static override canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new TagId(value)
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
      throw new InvalidTagIdError(error)
    }
  }
}
