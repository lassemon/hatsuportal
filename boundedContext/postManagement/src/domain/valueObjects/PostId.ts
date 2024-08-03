import { UniqueId } from '@hatsuportal/common-bounded-context'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'

export class PostId extends UniqueId {
  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidPostIdError(error)
    }
  }

  static override canCreate(value: string) {
    try {
      new PostId(value)
      return true
    } catch {
      return false
    }
  }
}
