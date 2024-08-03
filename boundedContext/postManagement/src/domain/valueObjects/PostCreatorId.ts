import { UniqueId } from '@hatsuportal/common-bounded-context'
import { InvalidPostCreatorIdError } from '../errors/InvalidPostCreatorIdError'

export class PostCreatorId extends UniqueId {
  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidPostCreatorIdError(error)
    }
  }

  static override canCreate(value: string) {
    try {
      new PostCreatorId(value)
      return true
    } catch {
      return false
    }
  }
}
