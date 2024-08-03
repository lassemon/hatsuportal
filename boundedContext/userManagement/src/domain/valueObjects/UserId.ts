import { InvalidUserIdError } from '../errors/InvalidUserIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

export class UserId extends UniqueId {
  static override canCreate(value: string): boolean {
    try {
      UserId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new UserId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidUserIdError(error)
    }
  }
}
