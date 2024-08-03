import { UniqueId } from '@hatsuportal/common-bounded-context'
import { InvalidUserIdError } from '../errors/InvalidUserIdError'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('UserId')

interface CanCreateOptions {
  throwError?: boolean
}

export class UserId extends UniqueId {
  static override canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new UserId(value)
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
      throw new InvalidUserIdError(error)
    }
  }
}
