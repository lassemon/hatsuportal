import { UniqueId } from '@hatsuportal/common-bounded-context'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('PostId')
export class PostId extends UniqueId {
  static override canCreate(value: string) {
    try {
      new PostId(value)
      return true
    } catch (error) {
      logger.warn(error)
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
