import { UniqueId } from '@hatsuportal/shared-kernel'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'

export class PostId extends UniqueId {
  static override canCreate(value: string): boolean {
    try {
      PostId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new PostId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidPostIdError(error)
    }
  }
}
