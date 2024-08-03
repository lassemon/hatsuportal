import { UniqueId } from '@hatsuportal/shared-kernel'
import { InvalidPostCreatorIdError } from '../errors/InvalidPostCreatorIdError'

export class PostCreatorId extends UniqueId {
  static override canCreate(value: string): boolean {
    try {
      PostCreatorId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new PostCreatorId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidPostCreatorIdError(error)
    }
  }
}
